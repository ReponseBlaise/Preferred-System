module.exports = {
  // User roles
  ROLES: {
    MANAGER: 'manager',
    STORE_MANAGER: 'store_manager',
    ATTENDANCE_CLERK: 'attendance_clerk'
  },

  // Attendance status
  ATTENDANCE_STATUS: {
    PRESENT: 'present',
    ABSENT: 'absent',
    LEAVE: 'leave',
    HALF_DAY: 'half-day'
  },

  // Employee status
  EMPLOYEE_STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    TERMINATED: 'terminated',
    ON_LEAVE: 'on_leave'
  },

  // Payroll status
  PAYROLL_STATUS: {
    PENDING: 'pending',
    PROCESSED: 'processed',
    PAID: 'paid',
    CANCELLED: 'cancelled'
  },

  // Inventory transaction types
  TRANSACTION_TYPES: {
    PURCHASE: 'purchase',
    ISSUE: 'issue',
    RETURN: 'return',
    ADJUSTMENT: 'adjustment'
  },

  // Expense types
  EXPENSE_TYPES: [
    'communication',
    'transport',
    'ticket',
    'fees',
    'other'
  ],

  // Material categories
  MATERIAL_CATEGORIES: [
    'Construction',
    'Electrical',
    'Plumbing',
    'Tools',
    'Safety',
    'Office',
    'Other'
  ],

  // Enquiry status
  ENQUIRY_STATUS: {
    PENDING: 'pending',
    RESPONDED: 'responded',
    CLOSED: 'closed'
  },

  // Notification types
  NOTIFICATION_TYPES: {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success',
    ATTENDANCE: 'attendance',
    PAYROLL: 'payroll',
    INVENTORY: 'inventory',
    ENQUIRY: 'enquiry'
  },

  // Audit actions
  AUDIT_ACTIONS: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    EXPORT: 'EXPORT',
    IMPORT: 'IMPORT'
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  },

  // File upload constraints
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
  },

  // Date formats
  DATE_FORMATS: {
    DISPLAY: 'DD MMM YYYY',
    DATABASE: 'YYYY-MM-DD',
    DATETIME_DISPLAY: 'DD MMM YYYY HH:mm',
    DATETIME_DATABASE: 'YYYY-MM-DD HH:mm:ss'
  },

  // Currency
  CURRENCY: {
    SYMBOL: 'RWF',
    DECIMALS: 2
  },

  // Validation messages
  VALIDATION_MESSAGES: {
    REQUIRED: 'This field is required',
    INVALID_EMAIL: 'Please enter a valid email address',
    INVALID_PHONE: 'Please enter a valid phone number',
    MIN_LENGTH: 'Minimum length is {min} characters',
    MAX_LENGTH: 'Maximum length is {max} characters',
    NUMERIC: 'Please enter a numeric value',
    POSITIVE: 'Please enter a positive value',
    DATE_PAST: 'Date cannot be in the future',
    DATE_RANGE: 'End date must be after start date'
  },

  // Error messages
  ERROR_MESSAGES: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Insufficient permissions',
    NOT_FOUND: 'Resource not found',
    SERVER_ERROR: 'Internal server error',
    VALIDATION_ERROR: 'Validation failed',
    DUPLICATE_ENTRY: 'Duplicate entry found',
    INVALID_CREDENTIALS: 'Invalid credentials',
    ACCOUNT_DISABLED: 'Account is disabled'
  },

  // Success messages
  SUCCESS_MESSAGES: {
    CREATED: 'Created successfully',
    UPDATED: 'Updated successfully',
    DELETED: 'Deleted successfully',
    SAVED: 'Saved successfully',
    SENT: 'Sent successfully',
    PROCESSED: 'Processed successfully'
  }
};