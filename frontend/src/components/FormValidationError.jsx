import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Component to display form validation errors
 * 
 * @param {Object} props - Component props
 * @param {string} props.message - Error message to display
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} - Rendered component
 */
const FormValidationError = ({ message, className = '' }) => {
  if (!message) return null;
  
  return (
    <p className={`mt-1 text-sm text-red-600 flex items-center ${className}`}>
      <AlertCircle size={14} className="mr-1" />
      {message}
    </p>
  );
};

export default FormValidationError;
