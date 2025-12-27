const translations = {
  en: {
    // Common
    welcome: 'Welcome',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    
    // Dashboard
    dashboard: 'Dashboard',
    overview: 'Overview',
    statistics: 'Statistics',
    recentActivity: 'Recent Activity',
    
    // Employees
    employees: 'Employees',
    employeeManagement: 'Employee Management',
    addEmployee: 'Add Employee',
    employeeDetails: 'Employee Details',
    position: 'Position',
    ratePerDay: 'Rate per Day',
    hireDate: 'Hire Date',
    status: 'Status',
    
    // Attendance
    attendance: 'Attendance',
    markAttendance: 'Mark Attendance',
    attendanceReport: 'Attendance Report',
    present: 'Present',
    absent: 'Absent',
    leave: 'Leave',
    halfDay: 'Half Day',
    hoursWorked: 'Hours Worked',
    
    // Inventory
    inventory: 'Inventory',
    materials: 'Materials',
    addMaterial: 'Add Material',
    itemCode: 'Item Code',
    itemName: 'Item Name',
    quantity: 'Quantity',
    unitPrice: 'Unit Price',
    category: 'Category',
    supplier: 'Supplier',
    
    // Payroll
    payroll: 'Payroll',
    generatePayroll: 'Generate Payroll',
    payrollReport: 'Payroll Report',
    grossAmount: 'Gross Amount',
    deductions: 'Deductions',
    netAmount: 'Net Amount',
    period: 'Period',
    
    // Enquiries
    enquiries: 'Enquiries',
    sendEnquiry: 'Send Enquiry',
    subject: 'Subject',
    message: 'Message',
    response: 'Response',
    
    // Reports
    reports: 'Reports',
    export: 'Export',
    generateReport: 'Generate Report',
    
    // Settings
    settings: 'Settings',
    profile: 'Profile',
    changePassword: 'Change Password',
    
    // Messages
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    confirmDelete: 'Are you sure you want to delete this item?',
    savedSuccessfully: 'Saved successfully',
    deletedSuccessfully: 'Deleted successfully',
    updatedSuccessfully: 'Updated successfully',
    
    // Validation
    required: 'This field is required',
    invalidEmail: 'Invalid email address',
    minLength: 'Minimum length is {min} characters',
    
    // Roles
    manager: 'Manager',
    storeManager: 'Store Manager',
    attendanceClerk: 'Attendance Clerk'
  },
  
  rw: {
    // Common
    welcome: 'Murakaza neza',
    login: 'Injira',
    logout: 'Sohoka',
    register: 'Iyandikishe',
    save: 'Bika',
    cancel: 'Hagarika',
    delete: 'Siba',
    edit: 'Hindura',
    view: 'Reba',
    search: 'Shaka',
    filter: 'Shyira umwihariko',
    
    // Dashboard
    dashboard: 'Ikibaho',
    overview: 'Incamake',
    statistics: 'Ibaruramiterere',
    recentActivity: 'Ibikorwa vya vuba',
    
    // Employees
    employees: 'Abakozi',
    employeeManagement: 'Kurwanya abakozi',
    addEmployee: 'Ongeraho umukozi',
    employeeDetails: 'Ibisobanuro ku mukozi',
    position: 'Umutwe',
    ratePerDay: 'Igiciro ku munsi',
    hireDate: 'Itariki yo gushyirwa mu kazi',
    status: 'Imimerere',
    
    // Attendance
    attendance: 'Amapresente',
    markAttendance: 'Andika amapresente',
    attendanceReport: 'Raporo y\'amapresente',
    present: 'Aho',
    absent: 'Ataho',
    leave: 'Umusanzu',
    halfDay: 'Umunsi umwe',
    hoursWorked: 'Amasaha yakoranye',
    
    // Inventory
    inventory: 'Ibikoresho',
    materials: 'Ibikoresho',
    addMaterial: 'Ongeraho ikoresho',
    itemCode: 'Kode y\'ikintu',
    itemName: 'Izina ry\'ikintu',
    quantity: 'Ingano',
    unitPrice: 'Igiciro',
    category: 'Itsinda',
    supplier: 'Umushahara',
    
    // Payroll
    payroll: 'Amafaranga yo kwishyura',
    generatePayroll: 'Kora amahesabu',
    payrollReport: 'Raporo y\'amahesabu',
    grossAmount: 'Amafaranga yose',
    deductions: 'Ibikurwaho',
    netAmount: 'Amafaranga asigaye',
    period: 'Igihe',
    
    // Enquiries
    enquiries: 'Ibibazo',
    sendEnquiry: 'Ohereza ikibazo',
    subject: 'Umutwe',
    message: 'Ubutumwa',
    response: 'Igisubizo',
    
    // Reports
    reports: 'Raporo',
    export: 'Kohereza',
    generateReport: 'Kora raporo',
    
    // Settings
    settings: 'Igenamiterere',
    profile: 'Umwirondoro',
    changePassword: 'Hindura ijambo ry\'ibanga',
    
    // Messages
    success: 'Byakunze',
    error: 'Ikosa',
    warning: 'Ibura',
    info: 'Amakuru',
    confirmDelete: 'Urabyizera ko ushaka gusiba iki kintu?',
    savedSuccessfully: 'Byabitswe neza',
    deletedSuccessfully: 'Byasibwe neza',
    updatedSuccessfully: 'Byahinduwe neza',
    
    // Validation
    required: 'Iyi ntambwe irakenerwa',
    invalidEmail: 'Email ntabwo ari yo',
    minLength: 'Uburebure butagutse ni {min}',
    
    // Roles
    manager: 'Umunyamabanga',
    storeManager: 'Umuyobozi w\'ibikoresho',
    attendanceClerk: 'Umwanditsi w\'amapresente'
  }
};

const t = (key, lang = 'en', params = {}) => {
  let translation = translations[lang]?.[key] || translations['en'][key] || key;
  
  // Replace parameters
  Object.entries(params).forEach(([param, value]) => {
    translation = translation.replace(`{${param}}`, value);
  });
  
  return translation;
};

const getAvailableLanguages = () => {
  return Object.keys(translations);
};

module.exports = { t, getAvailableLanguages };