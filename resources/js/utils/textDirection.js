// Utility functions for handling RTL/LTR text direction

/**
 * Detect if text contains Arabic characters
 * @param {string} text - The text to check
 * @returns {boolean} - True if text contains Arabic characters
 */
export const containsArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicRegex.test(text);
};

/**
 * Detect if text contains English characters
 * @param {string} text - The text to check
 * @returns {boolean} - True if text contains English characters
 */
export const containsEnglish = (text) => {
    const englishRegex = /[a-zA-Z]/;
    return englishRegex.test(text);
};

/**
 * Detect if text contains numbers
 * @param {string} text - The text to check
 * @returns {boolean} - True if text contains numbers
 */
export const containsNumbers = (text) => {
    const numberRegex = /[0-9]/;
    return numberRegex.test(text);
};

/**
 * Get the appropriate text direction for given text
 * @param {string} text - The text to analyze
 * @returns {string} - 'rtl' or 'ltr'
 */
export const getTextDirection = (text) => {
    if (!text || text.trim() === '') {
        return 'rtl'; // Default to RTL for Arabic interface
    }
    
    // If contains Arabic, use RTL
    if (containsArabic(text)) {
        return 'rtl';
    }
    
    // If contains only English or numbers without Arabic, use LTR
    if (containsEnglish(text) || containsNumbers(text)) {
        return 'ltr';
    }
    
    // Default to RTL for Arabic interface
    return 'rtl';
};

/**
 * Apply automatic direction to an input element
 * @param {HTMLElement} element - The input element
 * @param {string} value - The current value
 */
export const applyAutoDirection = (element, value) => {
    if (!element) return;
    
    const direction = getTextDirection(value);
    
    element.style.direction = direction;
    element.style.textAlign = direction === 'rtl' ? 'right' : 'left';
};

/**
 * Hook for handling auto-direction in React components
 * @param {HTMLElement} ref - React ref to the input element
 * @param {string} value - Current input value
 */
export const useAutoDirection = (ref, value) => {
    if (ref && ref.current) {
        applyAutoDirection(ref.current, value);
    }
};
