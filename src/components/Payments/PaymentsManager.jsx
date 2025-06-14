import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Payment as PaymentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Message as MessageIcon,
  Delete as DeleteIcon,
  DateRange as DateIcon,
  MonetizationOn as MoneyIcon,
  Person as PersonIcon,
  CheckCircle as PaidIcon,
  Cancel as UnpaidIcon
} from '@mui/icons-material';

import { studentsAPI, classesAPI, paymentsAPI, settingsAPI } from '../../data/storage';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PaymentsManager = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({});
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [openDialog, setOpenDialog] = useState(false);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [openMessageDialog, setOpenMessageDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [messageStudent, setMessageStudent] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    month: '',
    year: new Date().getFullYear(),
    amount: '',
    isPaid: false,
    paidDate: '',
    notes: ''
  });
  const [bulkFormData, setBulkFormData] = useState({
    classId: '',
    month: '',
    year: new Date().getFullYear(),
    amount: '',
    isPaid: false,
    paidDate: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    console.log('تحميل البيانات...');
    const studentsData = studentsAPI.getAll();
    const classesData = classesAPI.getAll();
    const paymentsData = paymentsAPI.getAll();
    const settingsData = settingsAPI.get();

    console.log('البيانات المحملة:', {
      students: studentsData.length,
      classes: classesData.length,
      payments: paymentsData.length,
      settings: settingsData
    });

    setStudents(studentsData);
    setClasses(classesData);
    setPayments(paymentsData);
    setSettings(settingsData);
  };

  const months = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' }
  ];

  const getClassName = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'غير محدد';
  };

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.fullName : 'غير محدد';
  };

  const getMonthName = (monthNumber) => {
    const month = months.find(m => m.value === monthNumber);
    return month ? month.label : 'غير محدد';
  };

  const filteredPayments = payments.filter(payment => {
    let matches = true;
    
    if (selectedClass) {
      const student = students.find(s => s.id === payment.studentId);
      matches = matches && student && student.classId === parseInt(selectedClass);
    }
    
    if (selectedStudent) {
      matches = matches && payment.studentId === parseInt(selectedStudent);
    }
    
    if (selectedMonth) {
      matches = matches && payment.month === parseInt(selectedMonth);
    }
    
    if (selectedYear) {
      matches = matches && payment.year === parseInt(selectedYear);
    }
    
    return matches;
  });

  const handleOpenDialog = (payment = null) => {
    if (payment) {
      console.log('فتح نافذة التعديل للتسديد:', payment);
      setEditingPayment(payment);
      setFormData({
        studentId: payment.studentId || '',
        month: payment.month || '',
        year: payment.year || new Date().getFullYear(),
        amount: payment.amount || '',
        isPaid: Boolean(payment.isPaid),
        paidDate: payment.paidDate || '',
        notes: payment.notes || ''
      });
    } else {
      console.log('فتح نافذة إضافة تسديد جديد');
      setEditingPayment(null);
      setFormData({
        studentId: '',
        month: '',
        year: new Date().getFullYear(),
        amount: '',
        isPaid: false,
        paidDate: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPayment(null);
    setFormData({
      studentId: '',
      month: '',
      year: new Date().getFullYear(),
      amount: '',
      isPaid: false,
      paidDate: '',
      notes: ''
    });
  };

  const handleSubmit = () => {
    if (!formData.studentId || !formData.month || !formData.amount) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      // التأكد من صحة البيانات قبل الحفظ
      const paymentData = {
        studentId: parseInt(formData.studentId),
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        amount: parseFloat(formData.amount),
        isPaid: Boolean(formData.isPaid),
        paidDate: formData.isPaid && formData.paidDate ? formData.paidDate : (formData.isPaid ? new Date().toISOString().split('T')[0] : ''),
        notes: formData.notes || ''
      };

      // التحقق من صحة البيانات
      if (isNaN(paymentData.studentId) || isNaN(paymentData.month) || isNaN(paymentData.year) || isNaN(paymentData.amount)) {
        alert('يرجى التأكد من صحة البيانات المدخلة');
        return;
      }

      if (editingPayment) {
        console.log('تحديث التسديد:', editingPayment.id, paymentData);
        console.log('التسديد الأصلي:', editingPayment);

        const result = paymentsAPI.update(editingPayment.id, paymentData);
        console.log('نتيجة التحديث:', result);

        if (result) {
          // تحديث فوري للحالة المحلية
          setPayments(prevPayments => {
            const newPayments = prevPayments.map(p => p.id === editingPayment.id ? result : p);
            console.log('الحالة المحلية بعد التحديث:', newPayments.find(p => p.id === editingPayment.id));
            return newPayments;
          });
        } else {
          console.error('فشل في تحديث التسديد');
          alert('فشل في تحديث التسديد. يرجى المحاولة مرة أخرى.');
          return;
        }
      } else {
        console.log('إضافة تسديد جديد:', paymentData);
        const result = paymentsAPI.add(paymentData);
        console.log('نتيجة الإضافة:', result);

        if (result) {
          // إضافة فورية للحالة المحلية
          setPayments(prevPayments => [...prevPayments, result]);
        } else {
          console.error('فشل في إضافة التسديد');
          alert('فشل في إضافة التسديد. يرجى المحاولة مرة أخرى.');
          return;
        }
      }

      // إعادة تحميل البيانات للتأكد من التزامن
      setTimeout(() => {
        loadData();
      }, 100);

      handleCloseDialog();

      // إظهار رسالة نجاح
      const student = students.find(s => s.id === paymentData.studentId);
      const monthName = getMonthName(paymentData.month);
      const successMessage = editingPayment
        ? `تم تحديث تسديد ${monthName} ${paymentData.year} للتلميذ ${student?.fullName || 'غير محدد'} بنجاح!`
        : `تم إضافة تسديد ${monthName} ${paymentData.year} للتلميذ ${student?.fullName || 'غير محدد'} بنجاح!`;

      setTimeout(() => {
        alert(successMessage);
      }, 100);

    } catch (error) {
      console.error('خطأ في حفظ التسديد:', error);
      alert('حدث خطأ في حفظ التسديد. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleOpenBulkDialog = () => {
    setBulkFormData({
      classId: '',
      month: '',
      year: new Date().getFullYear(),
      amount: '',
      isPaid: false,
      paidDate: '',
      notes: ''
    });
    setOpenBulkDialog(true);
  };

  const handleCloseBulkDialog = () => {
    setOpenBulkDialog(false);
    setBulkFormData({
      classId: '',
      month: '',
      year: new Date().getFullYear(),
      amount: '',
      isPaid: false,
      paidDate: '',
      notes: ''
    });
  };

  const handleBulkSubmit = async () => {
    if (!bulkFormData.classId || !bulkFormData.month || !bulkFormData.amount) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // الحصول على تلاميذ القسم المحدد
    const classStudents = students.filter(student => student.classId === parseInt(bulkFormData.classId));

    if (classStudents.length === 0) {
      alert('لا يوجد تلاميذ في القسم المحدد');
      return;
    }

    // التحقق من وجود تسديدات مكررة
    const existingPayments = payments.filter(payment =>
      payment.month === parseInt(bulkFormData.month) &&
      payment.year === parseInt(bulkFormData.year) &&
      classStudents.some(student => student.id === payment.studentId)
    );

    if (existingPayments.length > 0) {
      const duplicateStudents = existingPayments.map(payment => {
        const student = students.find(s => s.id === payment.studentId);
        return student ? student.fullName : 'غير محدد';
      });

      const confirmMessage = `تم العثور على تسديدات موجودة مسبقاً للتلاميذ التالية:\n\n${duplicateStudents.join('\n')}\n\nهل تريد المتابعة وإضافة التسديدات للتلاميذ الآخرين فقط؟`;

      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    try {
      let addedCount = 0;
      let skippedCount = 0;
      const newPayments = [];

      // معالجة متسلسلة لتجنب تضارب الـ IDs
      for (let i = 0; i < classStudents.length; i++) {
        const student = classStudents[i];

        // التحقق من عدم وجود تسديد مسبق لهذا التلميذ في نفس الشهر والسنة
        const existingPayment = payments.find(payment =>
          payment.studentId === student.id &&
          payment.month === parseInt(bulkFormData.month) &&
          payment.year === parseInt(bulkFormData.year)
        );

        if (!existingPayment) {
          const paymentData = {
            studentId: student.id,
            month: parseInt(bulkFormData.month),
            year: parseInt(bulkFormData.year),
            amount: parseFloat(bulkFormData.amount),
            isPaid: Boolean(bulkFormData.isPaid),
            paidDate: bulkFormData.isPaid && bulkFormData.paidDate ?
              bulkFormData.paidDate :
              (bulkFormData.isPaid ? new Date().toISOString().split('T')[0] : ''),
            notes: bulkFormData.notes || ''
          };

          console.log('إضافة تسديد جماعي للتلميذ:', student.fullName, paymentData);

          // تأخير صغير لضمان IDs فريدة
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 1));
          }

          const result = paymentsAPI.add(paymentData);
          console.log('نتيجة الإضافة:', result);

          if (result) {
            newPayments.push(result);
          }
          addedCount++;
        } else {
          skippedCount++;
        }
      }

      // تحديث فوري للحالة المحلية
      if (newPayments.length > 0) {
        console.log('تحديث الحالة المحلية بـ', newPayments.length, 'تسديد جديد');
        setPayments(prevPayments => {
          const updatedPayments = [...prevPayments, ...newPayments];
          console.log('إجمالي التسديدات بعد الإضافة:', updatedPayments.length);
          return updatedPayments;
        });
      }

      // إعادة تحميل البيانات للتأكد من التزامن
      setTimeout(() => {
        console.log('إعادة تحميل البيانات للتأكد من التزامن');
        loadData();
      }, 200);

      handleCloseBulkDialog();

      // إظهار رسالة النتيجة
      const className = classes.find(c => c.id === parseInt(bulkFormData.classId))?.name || 'غير محدد';
      const monthName = getMonthName(parseInt(bulkFormData.month));

      let resultMessage = `تم إضافة التسديدات بنجاح!\n\n`;
      resultMessage += `القسم: ${className}\n`;
      resultMessage += `الشهر: ${monthName} ${bulkFormData.year}\n`;
      resultMessage += `المبلغ: ${parseFloat(bulkFormData.amount)} دج\n\n`;
      resultMessage += `تم إضافة: ${addedCount} تسديد\n`;
      if (skippedCount > 0) {
        resultMessage += `تم تخطي: ${skippedCount} تسديد (موجود مسبقاً)`;
      }

      alert(resultMessage);
    } catch (error) {
      console.error('خطأ في إضافة التسديدات الجماعية:', error);
      alert('حدث خطأ في إضافة التسديدات الجماعية');
    }
  };

  const handleDelete = (paymentId) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      alert('لم يتم العثور على التسديد');
      return;
    }

    const student = students.find(s => s.id === payment.studentId);
    const monthName = getMonthName(payment.month);

    const confirmMessage = `هل أنت متأكد من حذف هذا التسديد؟\n\n` +
      `التلميذ: ${student?.fullName || 'غير محدد'}\n` +
      `الشهر: ${monthName} ${payment.year}\n` +
      `المبلغ: ${payment.amount} دج\n` +
      `الحالة: ${payment.isPaid ? 'مسدد' : 'غير مسدد'}\n` +
      `${payment.isPaid && payment.paidDate ? `تاريخ التسديد: ${new Date(payment.paidDate).toLocaleDateString('ar-DZ')}\n` : ''}` +
      `${payment.notes ? `الملاحظات: ${payment.notes}\n` : ''}\n` +
      `⚠️ تحذير: هذا الإجراء لا يمكن التراجع عنه!`;

    if (window.confirm(confirmMessage)) {
      try {
        paymentsAPI.delete(paymentId);
        loadData();

        // إظهار رسالة نجاح
        setTimeout(() => {
          alert(`تم حذف تسديد ${monthName} ${payment.year} للتلميذ ${student?.fullName || 'غير محدد'} بنجاح!`);
        }, 100);
      } catch (error) {
        console.error('خطأ في حذف التسديد:', error);
        alert('حدث خطأ في حذف التسديد. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const handleOpenMessage = (payment) => {
    const student = students.find(s => s.id === payment.studentId);
    setMessageStudent({ ...student, payment });
    setOpenMessageDialog(true);
  };

  const generatePaymentMessageHTML = () => {
    if (!messageStudent) return '';

    const { payment } = messageStudent;
    const monthName = getMonthName(payment.month);
    const currentDate = new Date().toLocaleDateString('ar-DZ');

    // حساب تاريخ الاستحقاق (تاريخ اليوم + 7 أيام)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const dueDateString = dueDate.toLocaleDateString('ar-DZ');

    return `
      <div style="
        font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        direction: rtl;
        text-align: right;
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
        background: white;
        color: #333;
        line-height: 1.8;
        font-size: 16px;
      ">
        <!-- الرأس -->
        <div style="text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1976d2; padding-bottom: 30px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
            ${settings.logo ?
              `<img src="${settings.logo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #1976d2; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" alt="لوجو الأكاديمية" />` :
              `<div style="width: 80px; height: 80px; background: linear-gradient(135deg, #1976d2, #42a5f5); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">🎓</div>`
            }
            <div>
              <h1 style="color: #1976d2; margin: 0 0 10px 0; font-size: 32px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                ${settings.academyName || 'أكاديمية نجم بلوس'}
              </h1>
              <p style="margin: 5px 0; color: #666; font-size: 16px;">
                📍 ${settings.academyAddress || 'العنوان الكامل للأكاديمية'}
              </p>
              <p style="margin: 5px 0; color: #666; font-size: 16px;">
                📞 ${settings.academyPhone || '+213 XX XX XX XX'}
              </p>
              ${settings.academyEmail ? `<p style="margin: 5px 0; color: #666; font-size: 16px;">📧 ${settings.academyEmail}</p>` : ''}
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 15px; border-radius: 15px; border: 2px solid #1976d2; margin-top: 20px;">
            <h2 style="color: #1976d2; margin: 0; font-size: 24px; font-weight: bold;">
              📋 إشعار تسديد المستحقات الدراسية
            </h2>
          </div>
        </div>

        <!-- معلومات التاريخ -->
        <div style="text-align: left; margin-bottom: 30px;">
          <div style="background: #f8f9fa; padding: 12px 20px; border-radius: 10px; border-right: 4px solid #1976d2; display: inline-block;">
            <strong style="color: #1976d2;">التاريخ:</strong> ${currentDate}
          </div>
        </div>

        <!-- معلومات المرسل إليه -->
        <div style="background: linear-gradient(135deg, #fff3e0, #ffe0b2); padding: 25px; border-radius: 15px; border: 2px solid #ff9800; margin-bottom: 30px;">
          <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 20px; display: flex; align-items: center;">
            👤 معلومات المرسل إليه
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong style="color: #333;">السيد/ة ولي أمر التلميذ:</strong><br>
              <span style="color: #1976d2; font-size: 18px; font-weight: bold;">${messageStudent.fullName}</span>
            </div>
            <div>
              <strong style="color: #333;">القسم:</strong><br>
              <span style="color: #1976d2; font-size: 18px; font-weight: bold;">${getClassName(messageStudent.classId)}</span>
            </div>
          </div>
        </div>

        <!-- المحتوى الرئيسي -->
        <div style="margin-bottom: 30px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
            <strong>تحية طيبة وبعد،</strong>
          </p>

          <p style="font-size: 16px; color: #555; line-height: 2; margin-bottom: 25px;">
            نتشرف بإعلامكم أن مستحقات الدراسة لشهر <strong style="color: #1976d2;">${monthName} ${payment.year}</strong>
            لابنكم/ابنتكم <strong style="color: #1976d2;">${messageStudent.fullName}</strong> قد حان موعد تسديدها.
          </p>
        </div>

        <!-- تفاصيل المستحقات -->
        <div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); padding: 25px; border-radius: 15px; border: 2px solid #4caf50; margin-bottom: 30px;">
          <h3 style="color: #2e7d32; margin: 0 0 20px 0; font-size: 20px; display: flex; align-items: center;">
            💰 تفاصيل المستحقات
          </h3>
          <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center;">
              <div style="padding: 15px; border-radius: 10px; background: linear-gradient(135deg, #e3f2fd, #bbdefb); border: 2px solid #1976d2;">
                <div style="color: #1976d2; font-size: 24px; margin-bottom: 8px;">📅</div>
                <strong style="color: #333;">الشهر</strong><br>
                <span style="color: #1976d2; font-size: 18px; font-weight: bold;">${monthName} ${payment.year}</span>
              </div>
              <div style="padding: 15px; border-radius: 10px; background: linear-gradient(135deg, #e8f5e8, #c8e6c9); border: 2px solid #4caf50;">
                <div style="color: #4caf50; font-size: 24px; margin-bottom: 8px;">💵</div>
                <strong style="color: #333;">المبلغ المطلوب</strong><br>
                <span style="color: #2e7d32; font-size: 20px; font-weight: bold;">${payment.amount.toLocaleString()} دج</span>
              </div>
              <div style="padding: 15px; border-radius: 10px; background: linear-gradient(135deg, #fff3e0, #ffe0b2); border: 2px solid #ff9800;">
                <div style="color: #ff9800; font-size: 24px; margin-bottom: 8px;">⏰</div>
                <strong style="color: #333;">تاريخ الاستحقاق</strong><br>
                <span style="color: #f57c00; font-size: 18px; font-weight: bold;">${dueDateString}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- الطلب -->
        <div style="background: linear-gradient(135deg, #ffebee, #ffcdd2); padding: 20px; border-radius: 15px; border: 2px solid #f44336; margin-bottom: 30px;">
          <p style="font-size: 16px; color: #333; line-height: 2; margin: 0; text-align: center;">
            <strong style="color: #d32f2f;">نرجو منكم التكرم بتسديد المبلغ المذكور قبل تاريخ الاستحقاق<br>
            (${dueDateString}) لضمان استمرارية التعليم المتميز لابنكم/ابنتكم.</strong>
          </p>
        </div>

        <!-- معلومات التواصل -->
        <div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); padding: 20px; border-radius: 15px; border: 2px solid #9c27b0; margin-bottom: 30px;">
          <h3 style="color: #7b1fa2; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
            📞 للاستفسار أو التواصل
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
              <strong style="color: #333;">📞 الهاتف:</strong><br>
              <span style="color: #7b1fa2; font-weight: bold;">${settings.academyPhone || '+213 XX XX XX XX'}</span>
            </div>
            <div>
              <strong style="color: #333;">📍 العنوان:</strong><br>
              <span style="color: #7b1fa2; font-weight: bold;">${settings.academyAddress || 'العنوان الكامل'}</span>
            </div>
          </div>
        </div>

        <!-- الختام -->
        <div style="text-align: center; margin-bottom: 40px;">
          <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
            شاكرين لكم تعاونكم وثقتكم
          </p>

          <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 20px; border-radius: 15px; border: 2px solid #1976d2;">
            <p style="margin: 0; font-size: 18px; color: #1976d2; font-weight: bold;">
              إدارة ${settings.academyName || 'أكاديمية نجم بلوس'}
            </p>
            <div style="margin-top: 15px; border-top: 2px solid #1976d2; padding-top: 15px;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                التوقيع والختم
              </p>
            </div>
          </div>
        </div>

        <!-- تذييل -->
        <div style="text-align: center; padding-top: 20px; border-top: 2px solid #ddd; color: #999; font-size: 12px;">
          <p style="margin: 0;">
            هذه رسالة رسمية من ${settings.academyName || 'أكاديمية نجم بلوس'} • تم إنشاؤها تلقائياً في ${currentDate}
          </p>
        </div>
      </div>
    `;
  };

  const generatePaymentMessage = () => {
    if (!messageStudent) return '';

    const { payment } = messageStudent;
    const monthName = getMonthName(payment.month);
    const currentDate = new Date().toLocaleDateString('ar-DZ');

    // حساب تاريخ الاستحقاق (تاريخ اليوم + 7 أيام)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const dueDateString = dueDate.toLocaleDateString('ar-DZ');

    return `
بسم الله الرحمن الرحيم

${settings.academyName || 'أكاديمية نجم بلوس'}
${settings.academyAddress || 'العنوان'}
${settings.academyPhone || 'رقم الهاتف'}

التاريخ: ${currentDate}

السيد/ة ولي أمر التلميذ: ${messageStudent.fullName}
القسم: ${getClassName(messageStudent.classId)}

تحية طيبة وبعد،

نتشرف بإعلامكم أن مستحقات الدراسة لشهر ${monthName} ${payment.year} لابنكم/ابنتكم ${messageStudent.fullName} قد حان موعد تسديدها.

تفاصيل المستحقات:
- الشهر: ${monthName} ${payment.year}
- المبلغ المطلوب: ${payment.amount} دينار جزائري
- تاريخ الاستحقاق: ${dueDateString}

نرجو منكم التكرم بتسديد المبلغ المذكور قبل تاريخ الاستحقاق (${dueDateString}) لضمان استمرارية التعليم المتميز لابنكم/ابنتكم.

للاستفسار أو التواصل:
الهاتف: ${settings.academyPhone || 'رقم الهاتف'}
العنوان: ${settings.academyAddress || 'العنوان'}

شاكرين لكم تعاونكم وثقتكم

إدارة ${settings.academyName || 'أكاديمية نجم بلوس'}
    `.trim();
  };

  const handlePrintMessage = () => {
    const messageContent = generatePaymentMessage();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>رسالة تسديد المستحقات</title>
          <style>
            body {
              font-family: 'Cairo', Arial, sans-serif;
              direction: rtl;
              text-align: right;
              padding: 20px;
              line-height: 1.8;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #1976d2;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .content {
              white-space: pre-line;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${settings.academyName || 'أكاديمية نجم بلوس'}</h2>
          </div>
          <div class="content">${messageContent}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const generateCompactPaymentMessageHTML = () => {
    if (!messageStudent) return '';

    const { payment } = messageStudent;
    const monthName = getMonthName(payment.month);
    const currentDate = new Date().toLocaleDateString('ar-DZ');

    // حساب تاريخ الاستحقاق (تاريخ اليوم + 7 أيام)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);
    const dueDateString = dueDate.toLocaleDateString('ar-DZ');

    return `
      <div style="
        font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        direction: rtl;
        text-align: right;
        max-width: 750px;
        margin: 0 auto;
        padding: 20px;
        background: white;
        color: #333;
        line-height: 1.5;
        font-size: 13px;
      ">
        <!-- الرأس المضغوط -->
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 2px solid #1976d2; padding-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
            ${settings.logo ?
              `<img src="${settings.logo}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid #1976d2;" alt="لوجو الأكاديمية" />` :
              `<div style="width: 60px; height: 60px; background: linear-gradient(135deg, #1976d2, #42a5f5); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">🎓</div>`
            }
            <div>
              <h1 style="color: #1976d2; margin: 0 0 8px 0; font-size: 22px; font-weight: bold;">
                ${settings.academyName || 'أكاديمية نجم بلوس'}
              </h1>
              <p style="margin: 3px 0; color: #666; font-size: 12px;">
                📍 ${settings.academyAddress || 'العنوان الكامل للأكاديمية'}
              </p>
              <p style="margin: 3px 0; color: #666; font-size: 12px;">
                📞 ${settings.academyPhone || '+213 XX XX XX XX'}
              </p>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 10px; border-radius: 10px; border: 2px solid #1976d2;">
            <h2 style="color: #1976d2; margin: 0; font-size: 16px; font-weight: bold;">
              📋 إشعار تسديد المستحقات الدراسية
            </h2>
          </div>
        </div>

        <!-- معلومات التاريخ -->
        <div style="text-align: left; margin-bottom: 20px;">
          <div style="background: #f8f9fa; padding: 8px 15px; border-radius: 8px; border-right: 3px solid #1976d2; display: inline-block;">
            <strong style="color: #1976d2;">التاريخ:</strong> ${currentDate}
          </div>
        </div>

        <!-- معلومات المرسل إليه -->
        <div style="background: linear-gradient(135deg, #fff3e0, #ffe0b2); padding: 15px; border-radius: 10px; border: 2px solid #ff9800; margin-bottom: 20px;">
          <h3 style="color: #f57c00; margin: 0 0 10px 0; font-size: 14px;">
            👤 معلومات المرسل إليه
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <strong style="color: #333; font-size: 12px;">السيد/ة ولي أمر التلميذ:</strong><br>
              <span style="color: #1976d2; font-size: 14px; font-weight: bold;">${messageStudent.fullName}</span>
            </div>
            <div>
              <strong style="color: #333; font-size: 12px;">القسم:</strong><br>
              <span style="color: #1976d2; font-size: 14px; font-weight: bold;">${getClassName(messageStudent.classId)}</span>
            </div>
          </div>
        </div>

        <!-- المحتوى الرئيسي -->
        <div style="margin-bottom: 20px;">
          <p style="font-size: 14px; color: #333; margin-bottom: 15px;">
            <strong>تحية طيبة وبعد،</strong>
          </p>

          <p style="font-size: 13px; color: #555; line-height: 1.6; margin-bottom: 20px;">
            نتشرف بإعلامكم أن مستحقات الدراسة لشهر <strong style="color: #1976d2;">${monthName} ${payment.year}</strong>
            لابنكم/ابنتكم <strong style="color: #1976d2;">${messageStudent.fullName}</strong> قد حان موعد تسديدها.
          </p>
        </div>

        <!-- تفاصيل المستحقات -->
        <div style="background: linear-gradient(135deg, #e8f5e8, #c8e6c9); padding: 15px; border-radius: 10px; border: 2px solid #4caf50; margin-bottom: 20px;">
          <h3 style="color: #2e7d32; margin: 0 0 12px 0; font-size: 14px;">
            💰 تفاصيل المستحقات
          </h3>
          <div style="background: white; padding: 12px; border-radius: 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; text-align: center;">
              <div style="padding: 8px; border-radius: 6px; background: #e3f2fd; border: 1px solid #1976d2;">
                <div style="color: #1976d2; font-size: 16px; margin-bottom: 4px;">📅</div>
                <strong style="color: #333; font-size: 11px;">الشهر</strong><br>
                <span style="color: #1976d2; font-size: 12px; font-weight: bold;">${monthName} ${payment.year}</span>
              </div>
              <div style="padding: 8px; border-radius: 6px; background: #e8f5e8; border: 1px solid #4caf50;">
                <div style="color: #4caf50; font-size: 16px; margin-bottom: 4px;">💵</div>
                <strong style="color: #333; font-size: 11px;">المبلغ المطلوب</strong><br>
                <span style="color: #2e7d32; font-size: 13px; font-weight: bold;">${payment.amount.toLocaleString()} دج</span>
              </div>
              <div style="padding: 8px; border-radius: 6px; background: #fff3e0; border: 1px solid #ff9800;">
                <div style="color: #ff9800; font-size: 16px; margin-bottom: 4px;">⏰</div>
                <strong style="color: #333; font-size: 11px;">تاريخ الاستحقاق</strong><br>
                <span style="color: #f57c00; font-size: 12px; font-weight: bold;">${dueDateString}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- الطلب -->
        <div style="background: linear-gradient(135deg, #ffebee, #ffcdd2); padding: 12px; border-radius: 10px; border: 2px solid #f44336; margin-bottom: 20px;">
          <p style="font-size: 13px; color: #333; line-height: 1.6; margin: 0; text-align: center;">
            <strong style="color: #d32f2f;">نرجو منكم التكرم بتسديد المبلغ المذكور قبل تاريخ الاستحقاق<br>
            (${dueDateString}) لضمان استمرارية التعليم المتميز لابنكم/ابنتكم.</strong>
          </p>
        </div>

        <!-- معلومات التواصل -->
        <div style="background: linear-gradient(135deg, #f3e5f5, #e1bee7); padding: 12px; border-radius: 10px; border: 2px solid #9c27b0; margin-bottom: 20px;">
          <h3 style="color: #7b1fa2; margin: 0 0 10px 0; font-size: 13px;">
            📞 للاستفسار أو التواصل
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
              <strong style="color: #333; font-size: 11px;">📞 الهاتف:</strong><br>
              <span style="color: #7b1fa2; font-weight: bold; font-size: 12px;">${settings.academyPhone || '+213 XX XX XX XX'}</span>
            </div>
            <div>
              <strong style="color: #333; font-size: 11px;">📍 العنوان:</strong><br>
              <span style="color: #7b1fa2; font-weight: bold; font-size: 12px;">${settings.academyAddress || 'العنوان الكامل'}</span>
            </div>
          </div>
        </div>

        <!-- الختام -->
        <div style="text-align: center; margin-bottom: 25px;">
          <p style="font-size: 13px; color: #555; margin-bottom: 15px;">
            شاكرين لكم تعاونكم وثقتكم
          </p>

          <div style="background: linear-gradient(135deg, #e3f2fd, #bbdefb); padding: 15px; border-radius: 10px; border: 2px solid #1976d2;">
            <p style="margin: 0; font-size: 14px; color: #1976d2; font-weight: bold;">
              إدارة ${settings.academyName || 'أكاديمية نجم بلوس'}
            </p>
            <div style="margin-top: 10px; border-top: 2px solid #1976d2; padding-top: 10px;">
              <p style="margin: 0; font-size: 11px; color: #666;">
                التوقيع والختم
              </p>
            </div>
          </div>
        </div>

        <!-- تذييل -->
        <div style="text-align: center; padding-top: 15px; border-top: 1px solid #ddd; color: #999; font-size: 10px;">
          <p style="margin: 0;">
            هذه رسالة رسمية من ${settings.academyName || 'أكاديمية نجم بلوس'} • تم إنشاؤها تلقائياً في ${currentDate}
          </p>
        </div>
      </div>
    `;
  };

  const handleDownloadPDF = async () => {
    if (!messageStudent) return;

    try {
      // إنشاء عنصر HTML للرسالة
      const messageElement = document.createElement('div');
      messageElement.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 210mm;
        max-height: 297mm;
        padding: 15mm;
        background: white;
        font-family: 'Cairo', sans-serif;
        direction: rtl;
        text-align: right;
        color: black;
        font-size: 12px;
        line-height: 1.4;
        overflow: hidden;
        box-sizing: border-box;
      `;

      messageElement.innerHTML = generateCompactPaymentMessageHTML();
      document.body.appendChild(messageElement);

      // تحويل HTML إلى صورة مع إعدادات محسّنة
      const canvas = await html2canvas(messageElement, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123,
        scrollX: 0,
        scrollY: 0
      });

      // إنشاء PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // حساب الأبعاد للتأكد من الاحتواء الكامل
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= 297) {
        // إذا كانت الصورة تتسع في صفحة واحدة
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        // إذا كانت الصورة طويلة، قم بتقسيمها
        const pageHeight = 297;
        let position = 0;

        while (position < imgHeight) {
          const remainingHeight = imgHeight - position;
          const currentHeight = Math.min(pageHeight, remainingHeight);

          if (position > 0) {
            doc.addPage();
          }

          doc.addImage(imgData, 'PNG', 0, -position, imgWidth, imgHeight);
          position += pageHeight;
        }
      }

      const fileName = `payment_notice_${messageStudent.fullName}_${getMonthName(messageStudent.payment.month)}_${messageStudent.payment.year}.pdf`;
      doc.save(fileName);

      // تنظيف
      document.body.removeChild(messageElement);
    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      alert('حدث خطأ في إنشاء ملف PDF. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <Box>
      {/* العنوان والأزرار */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          إدارة التسديدات
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            size="large"
          >
            إضافة تسديد جديد
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenBulkDialog}
            size="large"
            sx={{
              borderColor: '#4caf50',
              color: '#4caf50',
              '&:hover': {
                borderColor: '#388e3c',
                backgroundColor: '#e8f5e8',
                color: '#388e3c'
              }
            }}
          >
            إضافة لجميع تلاميذ القسم
          </Button>
        </Box>
      </Box>

      {/* الفلترة */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            فلترة التسديدات
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>القسم</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedStudent(''); // إعادة تعيين التلميذ عند تغيير القسم
                  }}
                  label="القسم"
                >
                  <MenuItem value="">جميع الأقسام</MenuItem>
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>التلميذ</InputLabel>
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  label="التلميذ"
                >
                  <MenuItem value="">جميع التلاميذ</MenuItem>
                  {students
                    .filter(student => !selectedClass || student.classId === parseInt(selectedClass))
                    .map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.fullName} - {getClassName(student.classId)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>الشهر</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="الشهر"
                >
                  <MenuItem value="">جميع الشهور</MenuItem>
                  {months.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>السنة</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="السنة"
                >
                  {[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035].map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedClass('');
                  setSelectedStudent('');
                  setSelectedMonth('');
                  setSelectedYear(new Date().getFullYear());
                }}
                fullWidth
              >
                إعادة تعيين
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* جدول التسديدات */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>التلميذ</TableCell>
              <TableCell>القسم</TableCell>
              <TableCell>الشهر</TableCell>
              <TableCell>السنة</TableCell>
              <TableCell>المبلغ (دج)</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>تاريخ التسديد</TableCell>
              <TableCell>الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => {
                const student = students.find(s => s.id === payment.studentId);
                return (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <PersonIcon sx={{ mr: 1, color: '#1976d2' }} />
                        {getStudentName(payment.studentId)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {student ? getClassName(student.classId) : 'غير محدد'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getMonthName(payment.month)}
                        variant="outlined"
                        size="small"
                        icon={<DateIcon />}
                      />
                    </TableCell>
                    <TableCell>{payment.year}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <MoneyIcon sx={{ mr: 1, color: '#4caf50' }} />
                        {payment.amount} دج
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.isPaid ? 'مسدد' : 'غير مسدد'}
                        color={payment.isPaid ? 'success' : 'error'}
                        icon={payment.isPaid ? <PaidIcon /> : <UnpaidIcon />}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </TableCell>
                    <TableCell>
                      {payment.isPaid && payment.paidDate
                        ? new Date(payment.paidDate).toLocaleDateString('ar-DZ')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Tooltip title="تعديل">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(payment)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="رسالة تسديد">
                        <IconButton
                          color="info"
                          onClick={() => handleOpenMessage(payment)}
                          size="small"
                          disabled={payment.isPaid}
                        >
                          <MessageIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="حذف">
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(payment.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Alert severity="info">
                    لا توجد تسديدات مطابقة لمعايير البحث
                  </Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* نافذة إضافة/تعديل التسديد */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPayment ? 'تعديل التسديد' : 'إضافة تسديد جديد'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>التلميذ</InputLabel>
                <Select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  label="التلميذ"
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.fullName} - {getClassName(student.classId)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>الشهر</InputLabel>
                <Select
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  label="الشهر"
                >
                  {months.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>السنة</InputLabel>
                <Select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  label="السنة"
                >
                  {[2023, 2024, 2025, 2026].map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="المبلغ (دينار جزائري)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                inputProps={{ min: 0, step: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPaid}
                    onChange={(e) => setFormData({
                      ...formData,
                      isPaid: e.target.checked,
                      paidDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                    })}
                  />
                }
                label="تم التسديد"
              />
            </Grid>
            {formData.isPaid && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="تاريخ التسديد"
                  type="date"
                  value={formData.paidDate}
                  onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ملاحظات"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="ملاحظات إضافية حول التسديد..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPayment ? 'تحديث' : 'إضافة'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* نافذة رسالة التسديد */}
      <Dialog
        open={openMessageDialog}
        onClose={() => setOpenMessageDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <MessageIcon color="primary" />
            رسالة تسديد المستحقات - {messageStudent?.fullName}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{
            maxHeight: '70vh',
            overflowY: 'auto',
            border: '2px solid #1976d2',
            borderRadius: 2,
            bgcolor: 'white'
          }}>
            <div dangerouslySetInnerHTML={{ __html: generatePaymentMessageHTML() }} />
          </Box>

          {/* معاينة النص البسيط */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              📄 معاينة النص البسيط (للطباعة العادية):
            </Typography>
            <Box sx={{
              whiteSpace: 'pre-line',
              fontFamily: 'Cairo, sans-serif',
              lineHeight: 1.8,
              p: 2,
              border: '1px solid #ddd',
              borderRadius: 1,
              bgcolor: '#f9f9f9',
              fontSize: '0.9rem',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {generatePaymentMessage()}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMessageDialog(false)}>إغلاق</Button>
          <Button
            onClick={handlePrintMessage}
            variant="outlined"
            startIcon={<PrintIcon />}
          >
            طباعة عادية
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{
              background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565c0, #1976d2)'
              }
            }}
          >
            تحميل PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* نافذة الإضافة الجماعية */}
      <Dialog open={openBulkDialog} onClose={handleCloseBulkDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon color="success" />
            إضافة تسديد لجميع تلاميذ القسم
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            سيتم إضافة تسديد بنفس المبلغ والشهر لجميع تلاميذ القسم المحدد.
            التلاميذ الذين لديهم تسديد مسبق لنفس الشهر والسنة سيتم تخطيهم.
          </Alert>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>القسم</InputLabel>
                <Select
                  value={bulkFormData.classId}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, classId: e.target.value })}
                  label="القسم"
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      {cls.name} ({students.filter(s => s.classId === cls.id).length} تلميذ)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>الشهر</InputLabel>
                <Select
                  value={bulkFormData.month}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, month: e.target.value })}
                  label="الشهر"
                >
                  {months.map((month) => (
                    <MenuItem key={month.value} value={month.value}>
                      {month.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>السنة</InputLabel>
                <Select
                  value={bulkFormData.year}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, year: e.target.value })}
                  label="السنة"
                >
                  {[2023, 2024, 2025, 2026].map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="المبلغ (دينار جزائري)"
                type="number"
                value={bulkFormData.amount}
                onChange={(e) => setBulkFormData({ ...bulkFormData, amount: e.target.value })}
                inputProps={{ min: 0, step: 100 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={bulkFormData.isPaid}
                    onChange={(e) => setBulkFormData({
                      ...bulkFormData,
                      isPaid: e.target.checked,
                      paidDate: e.target.checked ? new Date().toISOString().split('T')[0] : ''
                    })}
                  />
                }
                label="تم التسديد"
              />
            </Grid>
            {bulkFormData.isPaid && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="تاريخ التسديد"
                  type="date"
                  value={bulkFormData.paidDate}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, paidDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="ملاحظات"
                multiline
                rows={3}
                value={bulkFormData.notes}
                onChange={(e) => setBulkFormData({ ...bulkFormData, notes: e.target.value })}
                placeholder="ملاحظات إضافية حول التسديد (ستطبق على جميع التلاميذ)..."
              />
            </Grid>

            {/* معاينة التلاميذ */}
            {bulkFormData.classId && (
              <Grid item xs={12}>
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    سيتم إضافة التسديد للتلاميذ التالية:
                  </Typography>
                  <Box sx={{ maxHeight: 150, overflowY: 'auto', mt: 1 }}>
                    {students
                      .filter(student => student.classId === parseInt(bulkFormData.classId))
                      .map((student, index) => (
                        <Typography key={student.id} variant="body2" sx={{ mb: 0.5 }}>
                          {index + 1}. {student.fullName}
                        </Typography>
                      ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    إجمالي: {students.filter(s => s.classId === parseInt(bulkFormData.classId)).length} تلميذ
                  </Typography>
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkDialog}>إلغاء</Button>
          <Button
            onClick={handleBulkSubmit}
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
          >
            إضافة للجميع
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentsManager;
