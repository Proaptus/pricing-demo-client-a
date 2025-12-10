import React from 'react';

/**
 * PricingSection - Consistent container for pricing model panels
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} [props.subtitle] - Optional subtitle/description
 * @param {React.ReactNode} [props.actions] - Action buttons rendered in header
 * @param {React.ReactNode} props.children - Section body content
 * @param {string} [props.className] - Additional class names for outer section
 * @param {string} [props.bodyClassName] - Additional class names for body wrapper
 */
const PricingSection = ({
  title,
  subtitle,
  actions,
  children,
  className = '',
  bodyClassName = ''
}) => {
  const sectionClasses = ['bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6'];
  if (className) sectionClasses.push(className);
  const bodyClasses = ['px-6 py-5'];
  if (bodyClassName) bodyClasses.push(bodyClassName);

  return (
    <section className={sectionClasses.join(' ')}>
      <header className="flex flex-wrap items-start gap-3 justify-between px-6 py-4 border-b border-slate-200 bg-white">
      <div className="min-w-[220px]">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </header>
      <div className={bodyClasses.join(' ')}>
        {children}
      </div>
    </section>
  );
};

export default PricingSection;
