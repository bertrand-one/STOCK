/**
 * Validation utility functions for form validation
 */

/**
 * Validates if a value is not empty
 * @param {string} value - The value to check
 * @returns {boolean} - True if value is not empty
 */
export const isNotEmpty = (value) => {
  return value !== undefined && value !== null && value.toString().trim() !== '';
};

/**
 * Validates if a value is a valid email
 * @param {string} value - The email to validate
 * @returns {boolean} - True if email is valid
 */
export const isValidEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

/**
 * Validates if a value is a valid name (allows letters, numbers, underscores)
 * Must start with a letter, can contain letters, numbers, and underscores
 * @param {string} value - The name to validate
 * @returns {boolean} - True if name is valid
 */
export const isValidName = (value) => {
  // Name must start with a letter, can contain letters, numbers, and underscores
  const nameRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  return nameRegex.test(value);
};

/**
 * Validates if a value is a valid number
 * @param {string|number} value - The value to check
 * @returns {boolean} - True if value is a valid number
 */
export const isValidNumber = (value) => {
  return !isNaN(Number(value));
};

/**
 * Validates if a value is a valid integer
 * @param {string|number} value - The value to check
 * @returns {boolean} - True if value is a valid integer
 */
export const isValidInteger = (value) => {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num);
};

/**
 * Validates if a value is a positive number
 * @param {string|number} value - The value to check
 * @returns {boolean} - True if value is a positive number
 */
export const isPositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validates if a value is a non-negative number
 * @param {string|number} value - The value to check
 * @returns {boolean} - True if value is a non-negative number
 */
export const isNonNegativeNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Validates if a value has a minimum length
 * @param {string} value - The value to check
 * @param {number} minLength - The minimum length required
 * @returns {boolean} - True if value meets minimum length
 */
export const hasMinLength = (value, minLength) => {
  return value && value.length >= minLength;
};

/**
 * Validates if a value has a maximum length
 * @param {string} value - The value to check
 * @param {number} maxLength - The maximum length allowed
 * @returns {boolean} - True if value meets maximum length
 */
export const hasMaxLength = (value, maxLength) => {
  return value && value.length <= maxLength;
};

/**
 * Creates a validation result object
 * @param {boolean} isValid - Whether the validation passed
 * @param {string} message - Error message if validation failed
 * @returns {Object} - Validation result object
 */
export const createValidationResult = (isValid, message = '') => {
  return {
    isValid,
    message: isValid ? '' : message
  };
};

/**
 * Validates a name field (allows letters, numbers, underscores)
 * @param {string} value - The name to validate
 * @param {string} fieldName - The name of the field (for error message)
 * @returns {Object} - Validation result object
 */
export const validateName = (value, fieldName = 'Name') => {
  if (!isNotEmpty(value)) {
    return createValidationResult(false, `${fieldName} is required`);
  }
  
  if (!isValidName(value)) {
    return createValidationResult(
      false, 
      `${fieldName} must start with a letter and can only contain letters, numbers, and underscores`
    );
  }
  
  return createValidationResult(true);
};

/**
 * Validates an email field
 * @param {string} value - The email to validate
 * @returns {Object} - Validation result object
 */
export const validateEmail = (value) => {
  if (!isNotEmpty(value)) {
    return createValidationResult(false, 'Email is required');
  }
  
  if (!isValidEmail(value)) {
    return createValidationResult(false, 'Please enter a valid email address');
  }
  
  return createValidationResult(true);
};

/**
 * Validates a password field
 * @param {string} value - The password to validate
 * @param {number} minLength - Minimum password length
 * @returns {Object} - Validation result object
 */
export const validatePassword = (value, minLength = 6) => {
  if (!isNotEmpty(value)) {
    return createValidationResult(false, 'Password is required');
  }
  
  if (!hasMinLength(value, minLength)) {
    return createValidationResult(false, `Password must be at least ${minLength} characters long`);
  }
  
  return createValidationResult(true);
};

/**
 * Validates a quantity field
 * @param {string|number} value - The quantity to validate
 * @param {number} max - Maximum allowed quantity
 * @returns {Object} - Validation result object
 */
export const validateQuantity = (value, max = null) => {
  if (!isNotEmpty(value)) {
    return createValidationResult(false, 'Quantity is required');
  }
  
  if (!isValidInteger(value)) {
    return createValidationResult(false, 'Quantity must be a whole number');
  }
  
  if (!isPositiveNumber(value)) {
    return createValidationResult(false, 'Quantity must be greater than 0');
  }
  
  if (max !== null && Number(value) > max) {
    return createValidationResult(false, `Not enough stock available. Maximum available: ${max}`);
  }
  
  return createValidationResult(true);
};
