import React from 'react';

const Input = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  className = '',
  required = false,
  maxLength
}) => {
  const inputClasses = [
    'input',
    error ? 'input--error' : '',
    disabled ? 'input--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClasses}
        required={required}
        maxLength={maxLength}
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
};

export default Input;
