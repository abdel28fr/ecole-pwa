// نظام إدارة البيانات المحلي لأكاديمية نجم بلوس

// مفاتيح التخزين المحلي
const STORAGE_KEYS = {
  STUDENTS: 'academy_students',
  CLASSES: 'academy_classes',
  SUBJECTS: 'academy_subjects',
  GRADES: 'academy_grades',
  PAYMENTS: 'academy_payments',
  SETTINGS: 'academy_settings'
};

// بيانات افتراضية
const DEFAULT_DATA = {
  classes: [
    { id: 1, name: 'التحضيري الصغير (3-4 سنوات)', level: 'تحضيري', capacity: 20 },
    { id: 2, name: 'التحضيري الكبير (4-5 سنوات)', level: 'تحضيري', capacity: 20 },
    { id: 3, name: 'السنة الأولى ابتدائي', level: 'ابتدائي', capacity: 25 },
    { id: 4, name: 'السنة الثانية ابتدائي', level: 'ابتدائي', capacity: 25 },
    { id: 5, name: 'السنة الثالثة ابتدائي', level: 'ابتدائي', capacity: 25 },
  ],
  subjects: [
    { id: 1, name: 'الأنشطة الحركية', code: 'MOTOR', coefficient: 2 },
    { id: 2, name: 'التعبير الشفهي', code: 'ORAL', coefficient: 3 },
    { id: 3, name: 'الأنشطة الفنية', code: 'ART', coefficient: 2 },
    { id: 4, name: 'الألعاب التعليمية', code: 'GAMES', coefficient: 2 },
    { id: 5, name: 'الرياضيات البسيطة', code: 'MATH', coefficient: 3 },
    { id: 6, name: 'اللغة العربية', code: 'AR', coefficient: 3 },
    { id: 7, name: 'اللغة الفرنسية', code: 'FR', coefficient: 2 },
    { id: 8, name: 'العلوم', code: 'SCI', coefficient: 2 },
    { id: 9, name: 'التربية الإسلامية', code: 'REL', coefficient: 1 },
    { id: 10, name: 'التربية المدنية', code: 'CIV', coefficient: 1 },
  ],
  students: [],
  grades: [],
  payments: [],
  settings: {
    academyName: 'أكاديمية نجم بلوس',
    academyAddress: 'العنوان الكامل للأكاديمية',
    academyPhone: '+213 XX XX XX XX',
    academyEmail: 'info@academy.com',
    currentYear: '2024-2025',
    logo: ''
  }
};

// وظائف التخزين المحلي
export const storage = {
  // حفظ البيانات
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
      return false;
    }
  },

  // استرجاع البيانات
  load: (key, defaultValue = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error('خطأ في استرجاع البيانات:', error);
      return defaultValue;
    }
  },

  // حذف البيانات
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('خطأ في حذف البيانات:', error);
      return false;
    }
  },

  // مسح جميع البيانات
  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('خطأ في مسح البيانات:', error);
      return false;
    }
  }
};

// وظائف إدارة التلاميذ
export const studentsAPI = {
  // الحصول على جميع التلاميذ
  getAll: () => {
    return storage.load(STORAGE_KEYS.STUDENTS, DEFAULT_DATA.students);
  },

  // إضافة تلميذ جديد
  add: (student) => {
    const students = studentsAPI.getAll();
    const newStudent = {
      ...student,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    students.push(newStudent);
    storage.save(STORAGE_KEYS.STUDENTS, students);
    return newStudent;
  },

  // تحديث تلميذ
  update: (id, updatedStudent) => {
    const students = studentsAPI.getAll();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = { ...students[index], ...updatedStudent };
      storage.save(STORAGE_KEYS.STUDENTS, students);
      return students[index];
    }
    return null;
  },

  // حذف تلميذ
  delete: (id) => {
    const students = studentsAPI.getAll();
    const filteredStudents = students.filter(s => s.id !== id);
    storage.save(STORAGE_KEYS.STUDENTS, filteredStudents);
    return true;
  },

  // البحث عن تلميذ
  findById: (id) => {
    const students = studentsAPI.getAll();
    return students.find(s => s.id === id);
  },

  // البحث بالقسم
  findByClass: (classId) => {
    const students = studentsAPI.getAll();
    return students.filter(s => s.classId === classId);
  }
};

// وظائف إدارة الأقسام
export const classesAPI = {
  // الحصول على جميع الأقسام
  getAll: () => {
    return storage.load(STORAGE_KEYS.CLASSES, DEFAULT_DATA.classes);
  },

  // إضافة قسم جديد
  add: (classData) => {
    const classes = classesAPI.getAll();
    const newClass = {
      ...classData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    classes.push(newClass);
    storage.save(STORAGE_KEYS.CLASSES, classes);
    return newClass;
  },

  // تحديث قسم
  update: (id, updatedClass) => {
    const classes = classesAPI.getAll();
    const index = classes.findIndex(c => c.id === id);
    if (index !== -1) {
      classes[index] = { ...classes[index], ...updatedClass };
      storage.save(STORAGE_KEYS.CLASSES, classes);
      return classes[index];
    }
    return null;
  },

  // حذف قسم
  delete: (id) => {
    const classes = classesAPI.getAll();
    const filteredClasses = classes.filter(c => c.id !== id);
    storage.save(STORAGE_KEYS.CLASSES, filteredClasses);
    return true;
  },

  // البحث عن قسم
  findById: (id) => {
    const classes = classesAPI.getAll();
    return classes.find(c => c.id === id);
  }
};

// وظائف إدارة المواد
export const subjectsAPI = {
  // الحصول على جميع المواد
  getAll: () => {
    return storage.load(STORAGE_KEYS.SUBJECTS, DEFAULT_DATA.subjects);
  },

  // إضافة مادة جديدة
  add: (subject) => {
    const subjects = subjectsAPI.getAll();
    const newSubject = {
      ...subject,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    subjects.push(newSubject);
    storage.save(STORAGE_KEYS.SUBJECTS, subjects);
    return newSubject;
  },

  // تحديث مادة
  update: (id, updatedSubject) => {
    const subjects = subjectsAPI.getAll();
    const index = subjects.findIndex(s => s.id === id);
    if (index !== -1) {
      subjects[index] = { ...subjects[index], ...updatedSubject };
      storage.save(STORAGE_KEYS.SUBJECTS, subjects);
      return subjects[index];
    }
    return null;
  },

  // حذف مادة
  delete: (id) => {
    const subjects = subjectsAPI.getAll();
    const filteredSubjects = subjects.filter(s => s.id !== id);
    storage.save(STORAGE_KEYS.SUBJECTS, filteredSubjects);
    return true;
  },

  // البحث عن مادة
  findById: (id) => {
    const subjects = subjectsAPI.getAll();
    return subjects.find(s => s.id === id);
  }
};

// وظائف إدارة النقاط
export const gradesAPI = {
  // الحصول على جميع النقاط
  getAll: () => {
    return storage.load(STORAGE_KEYS.GRADES, DEFAULT_DATA.grades);
  },

  // إضافة نقطة جديدة
  add: (grade) => {
    const grades = gradesAPI.getAll();
    const newGrade = {
      ...grade,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    grades.push(newGrade);
    storage.save(STORAGE_KEYS.GRADES, grades);
    return newGrade;
  },

  // تحديث نقطة
  update: (id, updatedGrade) => {
    const grades = gradesAPI.getAll();
    const index = grades.findIndex(g => g.id === id);
    if (index !== -1) {
      grades[index] = { ...grades[index], ...updatedGrade };
      storage.save(STORAGE_KEYS.GRADES, grades);
      return grades[index];
    }
    return null;
  },

  // حذف نقطة
  delete: (id) => {
    const grades = gradesAPI.getAll();
    const filteredGrades = grades.filter(g => g.id !== id);
    storage.save(STORAGE_KEYS.GRADES, filteredGrades);
    return true;
  },

  // الحصول على نقاط تلميذ معين
  getByStudent: (studentId) => {
    const grades = gradesAPI.getAll();
    return grades.filter(g => g.studentId === studentId);
  },

  // الحصول على نقاط مادة معينة
  getBySubject: (subjectId) => {
    const grades = gradesAPI.getAll();
    return grades.filter(g => g.subjectId === subjectId);
  },

  // حساب المعدل العام لتلميذ
  calculateAverage: (studentId) => {
    const grades = gradesAPI.getByStudent(studentId);
    const subjects = subjectsAPI.getAll();
    
    if (grades.length === 0) return 0;

    let totalPoints = 0;
    let totalCoefficients = 0;

    subjects.forEach(subject => {
      const subjectGrades = grades.filter(g => g.subjectId === subject.id);
      if (subjectGrades.length > 0) {
        const subjectAverage = subjectGrades.reduce((sum, grade) => sum + grade.score, 0) / subjectGrades.length;
        totalPoints += subjectAverage * subject.coefficient;
        totalCoefficients += subject.coefficient;
      }
    });

    return totalCoefficients > 0 ? (totalPoints / totalCoefficients).toFixed(2) : 0;
  }
};

// وظائف إدارة التسديدات
export const paymentsAPI = {
  // الحصول على جميع التسديدات
  getAll: () => {
    return storage.load(STORAGE_KEYS.PAYMENTS, DEFAULT_DATA.payments);
  },

  // إضافة تسديد جديد
  add: (payment) => {
    const payments = paymentsAPI.getAll();

    // إنشاء ID فريد يتجنب التضارب
    let newId = Date.now();
    while (payments.some(p => p.id === newId)) {
      newId += 1;
    }

    const newPayment = {
      ...payment,
      id: newId,
      createdAt: new Date().toISOString()
    };
    payments.push(newPayment);
    storage.save(STORAGE_KEYS.PAYMENTS, payments);
    console.log('تم إضافة تسديد جديد:', newPayment);
    return newPayment;
  },

  // تحديث تسديد
  update: (id, updatedPayment) => {
    console.log('محاولة تحديث التسديد:', id, updatedPayment);
    const payments = paymentsAPI.getAll();
    console.log('جميع التسديدات قبل التحديث:', payments.length);

    const index = payments.findIndex(p => p.id === id);
    console.log('فهرس التسديد المراد تحديثه:', index);

    if (index !== -1) {
      const oldPayment = payments[index];
      console.log('التسديد القديم:', oldPayment);

      payments[index] = {
        ...payments[index],
        ...updatedPayment,
        id: id, // التأكد من عدم تغيير الـ ID
        updatedAt: new Date().toISOString()
      };

      console.log('التسديد الجديد:', payments[index]);
      storage.save(STORAGE_KEYS.PAYMENTS, payments);

      // التحقق من نجاح الحفظ
      const savedPayments = paymentsAPI.getAll();
      const savedPayment = savedPayments.find(p => p.id === id);
      console.log('التسديد بعد الحفظ:', savedPayment);

      return payments[index];
    }
    console.log('لم يتم العثور على التسديد بالـ ID:', id);
    return null;
  },

  // حذف تسديد
  delete: (id) => {
    const payments = paymentsAPI.getAll();
    const filteredPayments = payments.filter(p => p.id !== id);
    storage.save(STORAGE_KEYS.PAYMENTS, filteredPayments);
    return true;
  },

  // الحصول على تسديدات تلميذ معين
  getByStudent: (studentId) => {
    const payments = paymentsAPI.getAll();
    return payments.filter(p => p.studentId === studentId);
  },

  // الحصول على تسديدات شهر معين
  getByMonth: (month, year) => {
    const payments = paymentsAPI.getAll();
    return payments.filter(p => p.month === month && p.year === year);
  },

  // الحصول على التسديدات غير المدفوعة
  getUnpaid: () => {
    const payments = paymentsAPI.getAll();
    return payments.filter(p => !p.isPaid);
  },

  // البحث عن تسديد
  findById: (id) => {
    const payments = paymentsAPI.getAll();
    return payments.find(p => p.id === id);
  }
};

// وظائف الإعدادات
export const settingsAPI = {
  // الحصول على الإعدادات
  get: () => {
    return storage.load(STORAGE_KEYS.SETTINGS, DEFAULT_DATA.settings);
  },

  // تحديث الإعدادات
  update: (newSettings) => {
    const currentSettings = settingsAPI.get();
    const updatedSettings = { ...currentSettings, ...newSettings };
    storage.save(STORAGE_KEYS.SETTINGS, updatedSettings);
    return updatedSettings;
  }
};

// تهيئة البيانات الافتراضية
export const initializeDefaultData = () => {
  // تحقق من وجود البيانات، وإذا لم تكن موجودة، قم بإنشاء البيانات الافتراضية
  if (!storage.load(STORAGE_KEYS.CLASSES)) {
    storage.save(STORAGE_KEYS.CLASSES, DEFAULT_DATA.classes);
  }
  if (!storage.load(STORAGE_KEYS.SUBJECTS)) {
    storage.save(STORAGE_KEYS.SUBJECTS, DEFAULT_DATA.subjects);
  }
  if (!storage.load(STORAGE_KEYS.STUDENTS)) {
    storage.save(STORAGE_KEYS.STUDENTS, DEFAULT_DATA.students);
  }
  if (!storage.load(STORAGE_KEYS.GRADES)) {
    storage.save(STORAGE_KEYS.GRADES, DEFAULT_DATA.grades);
  }
  if (!storage.load(STORAGE_KEYS.PAYMENTS)) {
    storage.save(STORAGE_KEYS.PAYMENTS, DEFAULT_DATA.payments);
  }
  if (!storage.load(STORAGE_KEYS.SETTINGS)) {
    storage.save(STORAGE_KEYS.SETTINGS, DEFAULT_DATA.settings);
  }
};
