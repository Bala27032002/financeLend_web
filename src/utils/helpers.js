/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
};

/**
 * Format date
 */
export const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format date and time
 */
export const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Calculate days between two dates
 */
export const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end - start;
    return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Get loan status badge class
 */
export const getLoanStatusBadge = (status) => {
    const badges = {
        'active': 'badge-success',
        'closed': 'badge-info',
        'defaulted': 'badge-danger',
        'written-off': 'badge-danger'
    };
    return badges[status] || 'badge-info';
};

/**
 * Get payment method display name
 */
export const getPaymentMethodName = (method) => {
    const methods = {
        'cash': 'Cash',
        'bank_transfer': 'Bank Transfer',
        'upi': 'UPI',
        'cheque': 'Cheque',
        'other': 'Other'
    };
    return methods[method] || method;
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate email
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate PAN
 */
export const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
};

/**
 * Validate Aadhar
 */
export const validateAadhar = (aadhar) => {
    const aadharRegex = /^\d{12}$/;
    return aadharRegex.test(aadhar);
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num || 0);
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
    if (!total) return 0;
    return ((value / total) * 100).toFixed(2);
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
    if (!name) return '';
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

export default {
    formatCurrency,
    formatDate,
    formatDateTime,
    calculateDaysBetween,
    getLoanStatusBadge,
    getPaymentMethodName,
    validatePhone,
    validateEmail,
    validatePAN,
    validateAadhar,
    formatNumber,
    calculatePercentage,
    truncateText,
    getInitials,
    debounce
};
