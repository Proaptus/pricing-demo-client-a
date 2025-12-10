import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PricingQA from '../PricingQA';

// Mock Streamdown component
vi.mock('streamdown', () => ({
  Streamdown: ({ children }) => <div>{children}</div>,
}));

// Mock the services
vi.mock('../../../services/openrouter', () => ({
  queryOpenRouter: vi.fn(),
}));

vi.mock('../../../services/qaSystemPrompt', () => ({
  buildSystemPrompt: vi.fn(),
}));

vi.mock('../../../services/documentationLoader', () => ({
  buildDocumentationContext: vi.fn(),
}));

import { queryOpenRouter } from '../../../services/openrouter';
import { buildSystemPrompt } from '../../../services/qaSystemPrompt';
import { buildDocumentationContext } from '../../../services/documentationLoader';

describe('PricingQA Component - SSOT Pattern Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Setup default mock implementations
    // Q&A uses ONLY baseline documentation (SSOT), no live data
    buildDocumentationContext.mockResolvedValue('Comprehensive baseline documentation from docs/baseline/current.json');
    buildSystemPrompt.mockReturnValue('System prompt with baseline docs only');
    queryOpenRouter.mockResolvedValue('This is a test response from the LLM');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render question input and submit button', () => {
    render(<PricingQA />);

    // Check for input field
    const input = screen.getByPlaceholderText(/ask a question/i);
    expect(input).toBeDefined();

    // Check for submit button
    const button = screen.getByRole('button', { name: /ask|submit/i });
    expect(button).toBeDefined();
  });

  it('should update question state on input change', async () => {
    const user = userEvent.setup();

    render(<PricingQA />);

    const input = screen.getByPlaceholderText(/ask a question/i);

    await user.type(input, 'What is the baseline nSites value?');

    expect(input.value).toBe('What is the baseline nSites value?');
  });

  it('should call API on submit using ONLY baseline documentation (SSOT pattern)', async () => {
    const user = userEvent.setup();

    render(<PricingQA />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    const button = screen.getByRole('button', { name: /ask|submit/i });

    await user.type(input, 'What is the baseline margin?');
    await user.click(button);

    // Should load baseline documentation
    await waitFor(() => {
      expect(buildDocumentationContext).toHaveBeenCalled();
    });

    // Should build system prompt with ONLY documentation (no live data)
    await waitFor(() => {
      expect(buildSystemPrompt).toHaveBeenCalledWith(
        'Comprehensive baseline documentation from docs/baseline/current.json'
      );
    });

    // Should query LLM with baseline-only prompt
    await waitFor(() => {
      expect(queryOpenRouter).toHaveBeenCalledWith(
        'System prompt with baseline docs only',
        'What is the baseline margin?'
      );
    });
  });

  it('should show loading state during API call', async () => {
    const user = userEvent.setup();

    // Make API call take time
    queryOpenRouter.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve('Response'), 100);
    }));

    render(<PricingQA />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    const button = screen.getByRole('button', { name: /ask|submit/i });

    await user.type(input, 'Test question');
    await user.click(button);

    // Check for loading indicator
    expect(screen.queryByText(/loading|asking|thinking/i)).toBeDefined();

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText(/loading|asking|thinking/i)).toBeNull();
    }, { timeout: 2000 });
  });

  it('should display response when API returns', async () => {
    const user = userEvent.setup();
    const testResponse = 'The margin is 22.22%';

    queryOpenRouter.mockResolvedValue(testResponse);

    render(<PricingQA />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    const button = screen.getByRole('button', { name: /ask|submit/i });

    await user.type(input, 'What is the margin?');
    await user.click(button);

    // Wait for response to appear
    await waitFor(() => {
      expect(screen.getByText(testResponse)).toBeDefined();
    });
  });

  it('should display error on API failure', async () => {
    const user = userEvent.setup();

    queryOpenRouter.mockRejectedValue(new Error('API Error: 500'));

    render(<PricingQA />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    const button = screen.getByRole('button', { name: /ask|submit/i });

    await user.type(input, 'Test question');
    await user.click(button);

    // Wait for specific error message (not just word "error")
    await waitFor(() => {
      expect(screen.getByText(/API Error: 500/i)).toBeDefined();
    });
  });

  it('should prevent empty question submission', async () => {
    const user = userEvent.setup();

    render(<PricingQA />);

    const button = screen.getByRole('button', { name: /ask|submit/i });

    // Try to submit with empty input
    await user.click(button);

    // API should not be called
    expect(queryOpenRouter).not.toHaveBeenCalled();
  });

  it('should clear input after successful submission', async () => {
    const user = userEvent.setup();

    render(<PricingQA />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    const button = screen.getByRole('button', { name: /ask|submit/i });

    await user.type(input, 'Test question');
    await user.click(button);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});
