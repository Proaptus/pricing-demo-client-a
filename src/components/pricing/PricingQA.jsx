import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Loader, Copy, Check } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { queryOpenRouter } from '../../services/openrouter';
import { buildSystemPrompt } from '../../services/qaSystemPrompt';
import { buildDocumentationContext } from '../../services/documentationLoader';

/**
 * PricingQA Component
 * LLM-powered Q&A for pricing calculator using LIVE DATA
 * Uses current model calculations + baseline documentation for accurate answers
 */
export default function PricingQA({ inputs, model, scenario }) {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [copied, setCopied] = useState(false);

  // Load documentation on component mount
  useEffect(() => {
    const loadDocs = async () => {
      try {
        const docs = await buildDocumentationContext();
        setDocumentation(docs);
      } catch (err) {
        console.error('Failed to load documentation:', err);
        // Continue without documentation - pricing data alone is still useful
      }
    };
    loadDocs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent empty submission
    if (!question.trim()) {
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');
    setCopied(false); // Reset copied state

    try {
      // Build system prompt with documentation + LIVE DATA
      const systemPrompt = buildSystemPrompt(documentation, inputs, model, scenario);

      // Query LLM
      const llmResponse = await queryOpenRouter(systemPrompt, question);

      setResponse(llmResponse);
      setQuestion(''); // Clear input after successful submission
    } catch (err) {
      setError(err.message || 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy response:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4 mb-8">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-slate-900">Ask About This Pricing</h3>
      </div>

      {/* Question Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about this pricing model..."
            className="w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Ask</span>
            </>
          )}
        </button>
      </form>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Response Display */}
      {response && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-medium text-slate-700">Response:</div>
            <button
              onClick={handleCopyResponse}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Copy full response as markdown"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>
          </div>
          <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-strong:text-slate-900 prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-a:text-blue-600 hover:prose-a:text-blue-800">
            <Streamdown
              copyButton={true}
              shikiTheme={['github-light-default', 'github-dark-default']}
            >
              {response}
            </Streamdown>
          </div>
        </div>
      )}
    </div>
  );
}
