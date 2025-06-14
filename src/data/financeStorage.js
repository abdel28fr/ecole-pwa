// إدارة البيانات المالية في localStorage

// مفاتيح التخزين
const FINANCE_CATEGORIES_KEY = 'finance_categories';
const FINANCE_TRANSACTIONS_KEY = 'finance_transactions';

// الفئات الافتراضية
const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name: 'رسوم دراسية',
    type: 'income', // income أو expense
    color: '#4caf50',
    description: 'رسوم التسجيل والدراسة',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'رواتب المعلمين',
    type: 'expense',
    color: '#f44336',
    description: 'رواتب الكادر التعليمي',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'مصاريف تشغيلية',
    type: 'expense',
    color: '#ff9800',
    description: 'كهرباء، ماء، إنترنت، إلخ',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    name: 'مواد تعليمية',
    type: 'expense',
    color: '#9c27b0',
    description: 'كتب، أدوات، مستلزمات',
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    name: 'إيرادات إضافية',
    type: 'income',
    color: '#2196f3',
    description: 'دورات خاصة، فعاليات، إلخ',
    createdAt: new Date().toISOString()
  }
];

// API الفئات المالية
export const financeCategoriesAPI = {
  // الحصول على جميع الفئات
  getAll: () => {
    const categories = localStorage.getItem(FINANCE_CATEGORIES_KEY);
    if (!categories) {
      localStorage.setItem(FINANCE_CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(categories);
  },

  // الحصول على فئة بالمعرف
  getById: (id) => {
    const categories = financeCategoriesAPI.getAll();
    return categories.find(category => category.id === id);
  },

  // إضافة فئة جديدة
  add: (categoryData) => {
    const categories = financeCategoriesAPI.getAll();
    const newCategory = {
      id: Date.now(),
      ...categoryData,
      createdAt: new Date().toISOString()
    };
    categories.push(newCategory);
    localStorage.setItem(FINANCE_CATEGORIES_KEY, JSON.stringify(categories));
    return newCategory;
  },

  // تحديث فئة
  update: (id, categoryData) => {
    const categories = financeCategoriesAPI.getAll();
    const index = categories.findIndex(category => category.id === id);
    if (index !== -1) {
      categories[index] = {
        ...categories[index],
        ...categoryData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(FINANCE_CATEGORIES_KEY, JSON.stringify(categories));
      return categories[index];
    }
    return null;
  },

  // حذف فئة
  delete: (id) => {
    // التحقق من وجود معاملات مرتبطة
    const transactions = financeTransactionsAPI.getAll();
    const hasTransactions = transactions.some(transaction => transaction.categoryId === id);
    
    if (hasTransactions) {
      throw new Error('لا يمكن حذف هذه الفئة لوجود معاملات مرتبطة بها');
    }

    const categories = financeCategoriesAPI.getAll();
    const filteredCategories = categories.filter(category => category.id !== id);
    localStorage.setItem(FINANCE_CATEGORIES_KEY, JSON.stringify(filteredCategories));
    return true;
  },

  // الحصول على فئات حسب النوع
  getByType: (type) => {
    const categories = financeCategoriesAPI.getAll();
    return categories.filter(category => category.type === type);
  }
};

// API المعاملات المالية
export const financeTransactionsAPI = {
  // الحصول على جميع المعاملات
  getAll: () => {
    const transactions = localStorage.getItem(FINANCE_TRANSACTIONS_KEY);
    return transactions ? JSON.parse(transactions) : [];
  },

  // الحصول على معاملة بالمعرف
  getById: (id) => {
    const transactions = financeTransactionsAPI.getAll();
    return transactions.find(transaction => transaction.id === id);
  },

  // إضافة معاملة جديدة
  add: (transactionData) => {
    const transactions = financeTransactionsAPI.getAll();
    const newTransaction = {
      id: Date.now(),
      ...transactionData,
      createdAt: new Date().toISOString()
    };
    transactions.push(newTransaction);
    localStorage.setItem(FINANCE_TRANSACTIONS_KEY, JSON.stringify(transactions));
    return newTransaction;
  },

  // تحديث معاملة
  update: (id, transactionData) => {
    const transactions = financeTransactionsAPI.getAll();
    const index = transactions.findIndex(transaction => transaction.id === id);
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        ...transactionData,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(FINANCE_TRANSACTIONS_KEY, JSON.stringify(transactions));
      return transactions[index];
    }
    return null;
  },

  // حذف معاملة
  delete: (id) => {
    const transactions = financeTransactionsAPI.getAll();
    const filteredTransactions = transactions.filter(transaction => transaction.id !== id);
    localStorage.setItem(FINANCE_TRANSACTIONS_KEY, JSON.stringify(filteredTransactions));
    return true;
  },

  // الحصول على معاملات حسب النوع
  getByType: (type) => {
    const transactions = financeTransactionsAPI.getAll();
    return transactions.filter(transaction => transaction.type === type);
  },

  // الحصول على معاملات حسب الفئة
  getByCategory: (categoryId) => {
    const transactions = financeTransactionsAPI.getAll();
    return transactions.filter(transaction => transaction.categoryId === categoryId);
  },

  // الحصول على معاملات حسب فترة زمنية
  getByDateRange: (startDate, endDate) => {
    const transactions = financeTransactionsAPI.getAll();
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
    });
  },

  // حساب إجمالي الإيرادات
  getTotalIncome: (startDate = null, endDate = null) => {
    let transactions = financeTransactionsAPI.getAll();
    
    if (startDate && endDate) {
      transactions = financeTransactionsAPI.getByDateRange(startDate, endDate);
    }
    
    return transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((total, transaction) => total + transaction.amount, 0);
  },

  // حساب إجمالي المصروفات
  getTotalExpenses: (startDate = null, endDate = null) => {
    let transactions = financeTransactionsAPI.getAll();
    
    if (startDate && endDate) {
      transactions = financeTransactionsAPI.getByDateRange(startDate, endDate);
    }
    
    return transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((total, transaction) => total + transaction.amount, 0);
  },

  // حساب صافي الربح
  getNetProfit: (startDate = null, endDate = null) => {
    const totalIncome = financeTransactionsAPI.getTotalIncome(startDate, endDate);
    const totalExpenses = financeTransactionsAPI.getTotalExpenses(startDate, endDate);
    return totalIncome - totalExpenses;
  },

  // الحصول على إحصائيات شهرية
  getMonthlyStats: (year = new Date().getFullYear()) => {
    const transactions = financeTransactionsAPI.getAll();
    const monthlyData = {};

    // تهيئة البيانات الشهرية
    for (let month = 1; month <= 12; month++) {
      monthlyData[month] = {
        income: 0,
        expenses: 0,
        net: 0
      };
    }

    // حساب البيانات الشهرية
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getFullYear() === year) {
        const month = transactionDate.getMonth() + 1;
        if (transaction.type === 'income') {
          monthlyData[month].income += transaction.amount;
        } else {
          monthlyData[month].expenses += transaction.amount;
        }
        monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
      }
    });

    return monthlyData;
  },

  // الحصول على إحصائيات الفئات
  getCategoryStats: (startDate = null, endDate = null) => {
    let transactions = financeTransactionsAPI.getAll();
    
    if (startDate && endDate) {
      transactions = financeTransactionsAPI.getByDateRange(startDate, endDate);
    }

    const categoryStats = {};
    const categories = financeCategoriesAPI.getAll();

    // تهيئة إحصائيات الفئات
    categories.forEach(category => {
      categoryStats[category.id] = {
        name: category.name,
        type: category.type,
        color: category.color,
        amount: 0,
        count: 0
      };
    });

    // حساب إحصائيات الفئات
    transactions.forEach(transaction => {
      if (categoryStats[transaction.categoryId]) {
        categoryStats[transaction.categoryId].amount += transaction.amount;
        categoryStats[transaction.categoryId].count += 1;
      }
    });

    return categoryStats;
  }
};
