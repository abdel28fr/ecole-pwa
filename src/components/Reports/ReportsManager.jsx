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
  Avatar,
  Chip,
  Alert
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Assessment as ReportIcon,
  EmojiEvents as CertificateIcon
} from '@mui/icons-material';

import { studentsAPI, subjectsAPI, classesAPI, gradesAPI, settingsAPI } from '../../data/storage';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './ReportStyles.css';

const ReportsManager = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [settings, setSettings] = useState({});
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const studentsData = studentsAPI.getAll();
    const subjectsData = subjectsAPI.getAll();
    const classesData = classesAPI.getAll();
    const gradesData = gradesAPI.getAll();
    const settingsData = settingsAPI.get();
    
    setStudents(studentsData);
    setSubjects(subjectsData);
    setClasses(classesData);
    setGrades(gradesData);
    setSettings(settingsData);
  };

  const generateStudentReport = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return null;

    const studentGrades = grades.filter(g => g.studentId === studentId);
    const studentClass = classes.find(c => c.id === student.classId);

    const subjectReports = subjects.map(subject => {
      const subjectGrades = studentGrades.filter(g => g.subjectId === subject.id);
      const average = subjectGrades.length > 0 
        ? (subjectGrades.reduce((sum, grade) => sum + grade.score, 0) / subjectGrades.length).toFixed(2)
        : 0;
      
      return {
        subject,
        grades: subjectGrades,
        average: parseFloat(average),
        gradeCount: subjectGrades.length
      };
    });

    // حساب المعدل العام
    let totalPoints = 0;
    let totalCoefficients = 0;

    subjectReports.forEach(report => {
      if (report.average > 0) {
        totalPoints += report.average * report.subject.coefficient;
        totalCoefficients += report.subject.coefficient;
      }
    });

    const generalAverage = totalCoefficients > 0 ? (totalPoints / totalCoefficients).toFixed(2) : 0;

    // تحميل ملاحظة التلميذ
    const savedData = localStorage.getItem('academyData');
    let studentNote = '';
    if (savedData) {
      const data = JSON.parse(savedData);
      studentNote = data.studentNotes?.[studentId] || '';
    }

    return {
      student,
      studentClass,
      subjectReports,
      generalAverage: parseFloat(generalAverage),
      totalGrades: studentGrades.length,
      studentNote
    };
  };

  const generateClassReport = (classId) => {
    const classData = classes.find(c => c.id === classId);
    if (!classData) return null;

    const classStudents = students.filter(s => s.classId === classId);
    const studentReports = classStudents.map(student => generateStudentReport(student.id));

    const classAverage = studentReports.length > 0
      ? (studentReports.reduce((sum, report) => sum + report.generalAverage, 0) / studentReports.length).toFixed(2)
      : 0;

    return {
      classData,
      studentReports,
      classAverage: parseFloat(classAverage),
      totalStudents: classStudents.length
    };
  };

  const generateMultiPageClassPDF = async (data) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const { classData, studentReports } = data;

    try {
      // الصفحة الأولى: معلومات القسم والإحصائيات
      const page1Element = document.createElement('div');
      page1Element.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 210mm;
        min-height: 297mm;
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
      page1Element.innerHTML = generateClassPage1HTML(data);
      document.body.appendChild(page1Element);

      const canvas1 = await html2canvas(page1Element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123
      });

      const imgData1 = canvas1.toDataURL('image/png');
      doc.addImage(imgData1, 'PNG', 0, 0, 210, 297);
      document.body.removeChild(page1Element);

      // الصفحات التالية: ترتيب التلاميذ
      const studentsPerPage = 20; // عدد التلاميذ في كل صفحة
      const sortedStudents = studentReports.sort((a, b) => b.generalAverage - a.generalAverage);
      const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        const startIndex = pageNum * studentsPerPage;
        const endIndex = Math.min(startIndex + studentsPerPage, sortedStudents.length);
        const pageStudents = sortedStudents.slice(startIndex, endIndex);

        const pageElement = document.createElement('div');
        pageElement.style.cssText = `
          position: absolute;
          top: -9999px;
          left: -9999px;
          width: 210mm;
          min-height: 297mm;
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

        pageElement.innerHTML = generateClassStudentsPageHTML({
          ...data,
          pageStudents,
          pageNumber: pageNum + 2, // الصفحة الثانية وما بعدها
          totalPages: totalPages + 1,
          startRank: startIndex + 1
        });

        document.body.appendChild(pageElement);

        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 794,
          height: 1123
        });

        doc.addPage();
        const imgData = canvas.toDataURL('image/png');
        doc.addImage(imgData, 'PNG', 0, 0, 210, 297);
        document.body.removeChild(pageElement);
      }

      doc.save(`class_report_${classData.name}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      alert('حدث خطأ في إنشاء التقرير. يرجى المحاولة مرة أخرى.');
    }
  };

  const generatePDF = async (type, data) => {
    if (type === 'class') {
      return generateMultiPageClassPDF(data);
    }

    // للتقارير الأخرى (تلميذ، شهادة)
    const reportElement = document.createElement('div');

    // تحديد أبعاد مختلفة للشهادة (أفقي) والتقارير الأخرى (عمودي)
    const isLandscape = type === 'certificate';
    const width = isLandscape ? '297mm' : '210mm';
    const height = isLandscape ? '210mm' : '297mm';

    reportElement.style.cssText = `
      position: absolute;
      top: -9999px;
      left: -9999px;
      width: ${width};
      min-height: ${height};
      max-height: ${height};
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

    if (type === 'student') {
      reportElement.innerHTML = generateStudentHTML(data);
    } else if (type === 'certificate') {
      reportElement.innerHTML = generateCertificateHTML(data);
    }

    document.body.appendChild(reportElement);

    try {
      // إعدادات مختلفة للشهادة (أفقي) والتقارير الأخرى (عمودي)
      const canvasWidth = isLandscape ? 1123 : 794;
      const canvasHeight = isLandscape ? 794 : 1123;

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: canvasWidth,
        height: canvasHeight
      });

      // إنشاء PDF بالتوجه المناسب
      const orientation = isLandscape ? 'l' : 'p'; // l = landscape, p = portrait
      const doc = new jsPDF(orientation, 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      // أبعاد الصفحة حسب التوجه
      const pdfWidth = isLandscape ? 297 : 210;
      const pdfHeight = isLandscape ? 210 : 297;

      doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // اسم الملف حسب النوع
      const fileName = type === 'certificate' ? 'شهادة_نجاح' :
                      type === 'student' ? 'كشف_نقاط' : 'تقرير_قسم';
      doc.save(`${fileName}_${Date.now()}.pdf`);
    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      alert('حدث خطأ في إنشاء التقرير. يرجى المحاولة مرة أخرى.');
    } finally {
      document.body.removeChild(reportElement);
    }
  };

  const generateStudentHTML = (data) => {
    const { student, studentClass, subjectReports, generalAverage, studentNote } = data;

    const appreciation = generalAverage >= 8 ? 'ممتاز' :
                        generalAverage >= 6 ? 'جيد' :
                        generalAverage >= 5 ? 'مقبول' : 'ضعيف';

    const appreciationColor = generalAverage >= 8 ? '#4caf50' :
                             generalAverage >= 6 ? '#ff9800' :
                             generalAverage >= 5 ? '#2196f3' : '#f44336';

    const statusColor = generalAverage >= 8 ? '#4caf50' :
                       generalAverage >= 6 ? '#ff9800' :
                       generalAverage >= 5 ? '#2196f3' : '#f44336';

    return `
      <!-- رأس كشف النقاط مع التخطيط المحسّن -->
      <div style="margin-bottom: 20px; position: relative; min-height: 70px;">
        <!-- صورة التلميذ في أعلى يسار العنوان -->
        <div style="position: absolute; top: 0; left: 0;">
          ${student.photo ?
            `<img src="${student.photo}" style="width: 65px; height: 65px; border-radius: 50%; object-fit: cover; border: 3px solid ${statusColor}; box-shadow: 0 3px 8px rgba(0,0,0,0.2);" alt="صورة التلميذ" />` :
            `<div style="width: 65px; height: 65px; background: ${statusColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold; box-shadow: 0 3px 8px rgba(0,0,0,0.2);">${student.fullName?.charAt(0) || 'ت'}</div>`
          }
        </div>

        <!-- اللوجو في يمين العنوان -->
        <div style="position: absolute; top: 0; right: 0;">
          ${settings.logo ?
            `<img src="${settings.logo}" style="width: 65px; height: 65px; border-radius: 50%; object-fit: cover; border: 3px solid #1976d2; box-shadow: 0 3px 8px rgba(0,0,0,0.2);" alt="لوجو الأكاديمية" />` :
            `<div style="width: 65px; height: 65px; background: #1976d2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold; box-shadow: 0 3px 8px rgba(0,0,0,0.2);">🎓</div>`
          }
        </div>

        <!-- معلومات الأكاديمية في المنتصف -->
        <div style="text-align: center; padding: 0 85px;">
          <h1 style="color: #1976d2; margin: 0 0 5px 0; font-size: 22px; font-weight: bold;">
            ${settings.academyName || 'أكاديمية نجم بلوس'}
          </h1>
          <h2 style="color: #666; margin: 0; font-size: 17px;">
            كشف النقاط
          </h2>
        </div>
      </div>
        <!-- بيانات التلميذ -->
        <div style="border: 2px solid #1976d2; padding: 15px; border-radius: 10px; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); margin-bottom: 20px;">
          <h3 style="color: #1976d2; margin: 0 0 12px 0; font-size: 18px; text-align: center; border-bottom: 2px solid #1976d2; padding-bottom: 8px;">بيانات التلميذ</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; text-align: center;">
            <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 0; font-size: 14px; color: #333;"><strong>الاسم الكامل:</strong></p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #1976d2; font-weight: bold;">${student.fullName}</p>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 0; font-size: 14px; color: #333;"><strong>القسم:</strong></p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #1976d2; font-weight: bold;">${studentClass?.name || 'غير محدد'}</p>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 0; font-size: 14px; color: #333;"><strong>السنة الدراسية:</strong></p>
              <p style="margin: 4px 0 0 0; font-size: 16px; color: #1976d2; font-weight: bold;">${settings.currentYear || '2024-2025'}</p>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="margin: 0; font-size: 14px; color: #333;"><strong>المعدل العام:</strong></p>
              <p style="margin: 4px 0 0 0; font-size: 18px; color: ${statusColor}; font-weight: bold;">${generalAverage}/10</p>
            </div>
          </div>
        </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <thead>
          <tr style="background-color: #1976d2; color: white;">
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">المادة</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">المعدل</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">المعامل</th>
            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">النقطة المعاملة</th>
          </tr>
        </thead>
        <tbody>
          ${subjectReports.map(report => {
            if (report.average > 0) {
              const scoreColor = report.average >= 5 ? '#4caf50' : '#f44336';
              return `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${report.subject.name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center; color: ${scoreColor}; font-weight: bold;">
                    ${report.average}/10
                  </td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${report.subject.coefficient}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: center; font-weight: bold;">
                    ${(report.average * report.subject.coefficient).toFixed(2)}
                  </td>
                </tr>
              `;
            }
            return '';
          }).join('')}
        </tbody>
      </table>

      <div style="text-align: center; padding: 15px; border: 3px solid ${appreciationColor}; border-radius: 12px; background: ${appreciationColor}20; margin-bottom: 20px;">
        <h3 style="margin: 8px 0; color: ${appreciationColor}; font-size: 18px;">
          المعدل العام: ${generalAverage}/10
        </h3>
        <h3 style="margin: 8px 0; color: ${appreciationColor}; font-size: 16px;">
          التقدير: ${appreciation}
        </h3>
      </div>

      ${studentNote ? `
        <div style="margin-bottom: 20px; padding: 15px; border: 2px solid #1976d2; border-radius: 10px; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%);">
          <h4 style="color: #1976d2; margin: 0 0 10px 0; font-size: 16px; text-align: center; border-bottom: 1px solid #1976d2; padding-bottom: 5px;">
            📝 ملاحظة المعلم
          </h4>
          <p style="margin: 0; font-size: 14px; color: #333; text-align: center; line-height: 1.6; padding: 8px;">
            ${studentNote}
          </p>
        </div>
      ` : ''}

      <div style="margin-top: 25px; text-align: center; font-size: 12px; color: #666;">
        <p style="margin-bottom: 20px;">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-DZ')}</p>
        <div style="display: flex; justify-content: space-between; margin-top: 25px;">
          <div style="text-align: center;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1976d2;">إدارة الأكاديمية</p>
            <div style="border-top: 2px solid #1976d2; width: 150px; margin-top: 20px;"></div>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">التوقيع والختم</p>
          </div>
          <div style="text-align: center;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #1976d2;">ولي الأمر</p>
            <div style="border-top: 2px solid #1976d2; width: 150px; margin-top: 20px;"></div>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #999;">التوقيع</p>
          </div>
        </div>
      </div>
    `;
  };

  const generateClassPage1HTML = (data) => {
    const { classData, studentReports, classAverage } = data;

    const passedStudents = studentReports.filter(r => r.generalAverage >= 5).length;
    const failedStudents = studentReports.length - passedStudents;
    const passRate = studentReports.length > 0 ? ((passedStudents / studentReports.length) * 100).toFixed(1) : 0;

    // إحصائيات التقديرات
    const excellentStudents = studentReports.filter(r => r.generalAverage >= 8).length;
    const goodStudents = studentReports.filter(r => r.generalAverage >= 6 && r.generalAverage < 8).length;
    const acceptableStudents = studentReports.filter(r => r.generalAverage >= 5 && r.generalAverage < 6).length;
    const weakStudents = studentReports.filter(r => r.generalAverage < 5).length;

    // إحصائيات المواد
    const subjectStats = subjects.map(subject => {
      const subjectGrades = grades.filter(g =>
        g.subjectId === subject.id &&
        studentReports.some(sr => sr.student.id === g.studentId)
      );

      const average = subjectGrades.length > 0
        ? (subjectGrades.reduce((sum, grade) => sum + grade.score, 0) / subjectGrades.length).toFixed(2)
        : 0;

      return {
        subject,
        average: parseFloat(average),
        gradeCount: subjectGrades.length
      };
    }).filter(stat => stat.gradeCount > 0);

    return `
      <!-- رأس الصفحة -->
      <div style="margin-bottom: 20px; text-align: center;">
        <!-- اللوجو والعنوان -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
          ${settings.logo ?
            `<img src="${settings.logo}" style="width: 55px; height: 55px; border-radius: 50%; object-fit: cover; border: 2px solid #1976d2; box-shadow: 0 3px 8px rgba(0,0,0,0.2);" alt="لوجو الأكاديمية" />` :
            `<div style="width: 55px; height: 55px; background: #1976d2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold; box-shadow: 0 3px 8px rgba(0,0,0,0.2);">🎓</div>`
          }
          <div>
            <h1 style="color: #1976d2; margin: 0 0 5px 0; font-size: 24px; font-weight: bold;">
              ${settings.academyName || 'أكاديمية نجم بلوس'}
            </h1>
            <h2 style="color: #666; margin: 0; font-size: 18px;">
              تقرير القسم: ${classData.name}
            </h2>
          </div>
        </div>

        <!-- معلومات أساسية -->
        <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 12px; border-radius: 12px; border: 2px solid #1976d2; margin-bottom: 18px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; text-align: center;">
            <div style="background: white; padding: 12px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
              <div style="background: #1976d2; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 16px;">👥</div>
              <h3 style="color: #1976d2; margin: 3px 0; font-size: 14px;">عدد التلاميذ</h3>
              <p style="font-size: 22px; font-weight: bold; margin: 3px 0; color: #1976d2;">${data.totalStudents}</p>
              <p style="font-size: 10px; color: #666; margin: 0;">تلميذ مسجل</p>
            </div>
            <div style="background: white; padding: 12px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
              <div style="background: #4caf50; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 16px;">📊</div>
              <h3 style="color: #4caf50; margin: 3px 0; font-size: 14px;">معدل القسم</h3>
              <p style="font-size: 22px; font-weight: bold; margin: 3px 0; color: #4caf50;">${classAverage}/10</p>
              <p style="font-size: 10px; color: #666; margin: 0;">المعدل العام</p>
            </div>
            <div style="background: white; padding: 12px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
              <div style="background: #ff9800; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 16px;">🎯</div>
              <h3 style="color: #ff9800; margin: 3px 0; font-size: 14px;">نسبة النجاح</h3>
              <p style="font-size: 22px; font-weight: bold; margin: 3px 0; color: #ff9800;">${passRate}%</p>
              <p style="font-size: 10px; color: #666; margin: 0;">من التلاميذ</p>
            </div>
          </div>
        </div>
      </div>

      <!-- إحصائيات مفصلة -->
      <div style="margin-bottom: 18px;">
        <h3 style="color: #1976d2; border-bottom: 3px solid #1976d2; padding-bottom: 6px; margin-bottom: 15px; font-size: 16px; text-align: center;">
          📊 إحصائيات مفصلة
        </h3>

        <!-- إحصائيات النجاح والرسوب -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 18px;">
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); padding: 15px; border-radius: 12px; text-align: center; border: 2px solid #4caf50; box-shadow: 0 3px 8px rgba(76, 175, 80, 0.2);">
            <div style="background: #4caf50; color: white; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 18px;">✓</div>
            <h4 style="color: #2e7d32; margin: 5px 0; font-size: 15px;">التلاميذ الناجحون</h4>
            <p style="font-size: 24px; font-weight: bold; color: #2e7d32; margin: 5px 0;">${passedStudents}</p>
            <p style="font-size: 11px; color: #388e3c; margin: 0;">معدل 5/10 فما فوق</p>
          </div>
          <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); padding: 15px; border-radius: 12px; text-align: center; border: 2px solid #f44336; box-shadow: 0 3px 8px rgba(244, 67, 54, 0.2);">
            <div style="background: #f44336; color: white; width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; font-size: 18px;">✗</div>
            <h4 style="color: #c62828; margin: 5px 0; font-size: 15px;">التلاميذ الراسبون</h4>
            <p style="font-size: 24px; font-weight: bold; color: #c62828; margin: 5px 0;">${failedStudents}</p>
            <p style="font-size: 11px; color: #d32f2f; margin: 0;">معدل أقل من 5/10</p>
          </div>
        </div>

        <!-- توزيع التقديرات -->
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 15px; border-radius: 12px; border: 2px solid #6c757d; margin-bottom: 18px;">
          <h4 style="color: #495057; margin: 0 0 12px 0; font-size: 15px; text-align: center;">📈 توزيع التقديرات</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px;">
            <div style="background: white; padding: 10px; border-radius: 8px; text-align: center; border: 2px solid #4caf50;">
              <div style="color: #4caf50; font-size: 16px; margin-bottom: 3px;">⭐</div>
              <p style="margin: 2px 0; font-size: 12px; color: #2e7d32; font-weight: bold;">ممتاز</p>
              <p style="margin: 2px 0; font-size: 16px; color: #2e7d32; font-weight: bold;">${excellentStudents}</p>
              <p style="margin: 0; font-size: 9px; color: #666;">8-10</p>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; text-align: center; border: 2px solid #ff9800;">
              <div style="color: #ff9800; font-size: 16px; margin-bottom: 3px;">👍</div>
              <p style="margin: 2px 0; font-size: 12px; color: #f57c00; font-weight: bold;">جيد</p>
              <p style="margin: 2px 0; font-size: 16px; color: #f57c00; font-weight: bold;">${goodStudents}</p>
              <p style="margin: 0; font-size: 9px; color: #666;">6-8</p>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; text-align: center; border: 2px solid #2196f3;">
              <div style="color: #2196f3; font-size: 16px; margin-bottom: 3px;">👌</div>
              <p style="margin: 2px 0; font-size: 12px; color: #1976d2; font-weight: bold;">مقبول</p>
              <p style="margin: 2px 0; font-size: 16px; color: #1976d2; font-weight: bold;">${acceptableStudents}</p>
              <p style="margin: 0; font-size: 9px; color: #666;">5-6</p>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; text-align: center; border: 2px solid #f44336;">
              <div style="color: #f44336; font-size: 16px; margin-bottom: 3px;">⚠️</div>
              <p style="margin: 2px 0; font-size: 12px; color: #d32f2f; font-weight: bold;">ضعيف</p>
              <p style="margin: 2px 0; font-size: 16px; color: #d32f2f; font-weight: bold;">${weakStudents}</p>
              <p style="margin: 0; font-size: 9px; color: #666;">&lt;5</p>
            </div>
          </div>
        </div>

        <!-- إحصائيات المواد -->
        ${subjectStats.length > 0 ? `
        <div style="background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%); padding: 12px; border-radius: 12px; border: 2px solid #ff9800;">
          <h4 style="color: #f57c00; margin: 0 0 10px 0; font-size: 14px; text-align: center;">📚 معدلات المواد</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
            ${subjectStats.slice(0, 8).map(stat => {
              const color = stat.average >= 7 ? '#4caf50' : stat.average >= 5 ? '#ff9800' : '#f44336';
              return `
                <div style="background: white; padding: 8px; border-radius: 8px; text-align: center; border: 2px solid ${color};">
                  <p style="margin: 0 0 3px 0; font-size: 11px; color: #333; font-weight: bold;">${stat.subject.name}</p>
                  <p style="margin: 0 0 2px 0; font-size: 14px; color: ${color}; font-weight: bold;">${stat.average}/10</p>
                  <p style="margin: 0; font-size: 8px; color: #666;">${stat.gradeCount} نقطة</p>
                </div>
              `;
            }).join('')}
            ${subjectStats.length > 8 ? `
              <div style="background: white; padding: 8px; border-radius: 8px; text-align: center; border: 2px solid #9e9e9e; display: flex; align-items: center; justify-content: center;">
                <p style="margin: 0; font-size: 11px; color: #666; font-weight: bold;">+${subjectStats.length - 8} مادة أخرى</p>
              </div>
            ` : ''}
          </div>
        </div>
        ` : ''}
      </div>

      <!-- معلومات إضافية -->
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); padding: 15px; border-radius: 12px; border: 2px solid #1976d2; margin-top: 15px;">
        <div style="text-align: center; margin-bottom: 12px;">
          <h4 style="color: #1976d2; margin: 0 0 8px 0; font-size: 15px;">📅 معلومات التقرير</h4>
          <p style="margin: 3px 0; font-size: 12px; color: #333;">
            <strong>السنة الدراسية:</strong> ${settings.currentYear || '2024-2025'}
          </p>
          <p style="margin: 3px 0; font-size: 12px; color: #333;">
            <strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString('ar-DZ')}
          </p>
          <p style="margin: 3px 0; font-size: 12px; color: #333;">
            <strong>الوقت:</strong> ${new Date().toLocaleTimeString('ar-DZ')}
          </p>
        </div>

        <div style="text-align: center; padding-top: 12px; border-top: 2px solid #1976d2;">
          <p style="margin: 0; font-size: 14px; color: #1976d2; font-weight: bold;">
            الصفحة 1 من ${Math.ceil(studentReports.length / 20) + 1}
          </p>
          <p style="margin: 3px 0 0 0; font-size: 11px; color: #666;">
            الصفحة التالية: ترتيب التلاميذ
          </p>
        </div>
      </div>
    `;
  };

  const generateClassStudentsPageHTML = (data) => {
    const { classData, pageStudents, pageNumber, totalPages, startRank } = data;

    return `
      <!-- رأس الصفحة -->
      <div style="margin-bottom: 25px; text-align: center;">
        <!-- اللوجو والعنوان -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 20px;">
          ${settings.logo ?
            `<img src="${settings.logo}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 3px solid #1976d2; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" alt="لوجو الأكاديمية" />` :
            `<div style="width: 60px; height: 60px; background: #1976d2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">🎓</div>`
          }
          <div>
            <h1 style="color: #1976d2; margin: 0 0 8px 0; font-size: 24px; font-weight: bold;">
              ${settings.academyName || 'أكاديمية نجم بلوس'}
            </h1>
            <h2 style="color: #666; margin: 0; font-size: 18px;">
              تقرير القسم: ${classData.name}
            </h2>
          </div>
        </div>
      </div>

      <!-- عنوان ترتيب التلاميذ -->
      <div style="margin-bottom: 20px;">
        <h3 style="color: #1976d2; border-bottom: 4px solid #1976d2; padding-bottom: 10px; margin-bottom: 15px; font-size: 20px; text-align: center;">
          🏆 ترتيب التلاميذ
        </h3>
        <div style="text-align: center; background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 10px; border-radius: 10px; border: 2px solid #1976d2; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #1976d2; font-weight: bold;">
            الصفحة ${pageNumber} من ${totalPages} • المراكز ${startRank} - ${startRank + pageStudents.length - 1}
          </p>
        </div>
      </div>

      <!-- جدول ترتيب التلاميذ -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden;">
        <thead>
          <tr style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white;">
            <th style="border: none; padding: 15px 8px; text-align: center; font-weight: bold; font-size: 14px;">🏅 الترتيب</th>
            <th style="border: none; padding: 15px 8px; text-align: center; font-weight: bold; font-size: 14px;">👤 اسم التلميذ</th>
            <th style="border: none; padding: 15px 8px; text-align: center; font-weight: bold; font-size: 14px;">📊 المعدل العام</th>
            <th style="border: none; padding: 15px 8px; text-align: center; font-weight: bold; font-size: 14px;">⭐ التقدير</th>
            <th style="border: none; padding: 15px 8px; text-align: center; font-weight: bold; font-size: 14px;">✅ الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${pageStudents.map((report, index) => {
            const globalRank = startRank + index;
            const appreciation = report.generalAverage >= 8 ? 'ممتاز' :
                                report.generalAverage >= 6 ? 'جيد' :
                                report.generalAverage >= 5 ? 'مقبول' : 'ضعيف';
            const status = report.generalAverage >= 5 ? 'ناجح' : 'راسب';
            const statusColor = report.generalAverage >= 5 ? '#4caf50' : '#f44336';
            const appreciationColor = report.generalAverage >= 8 ? '#4caf50' :
                                     report.generalAverage >= 6 ? '#ff9800' :
                                     report.generalAverage >= 5 ? '#2196f3' : '#f44336';

            // إضافة ميدالية للمراكز الثلاثة الأولى
            const medal = globalRank === 1 ? '🥇' : globalRank === 2 ? '🥈' : globalRank === 3 ? '🥉' : '';

            return `
              <tr style="background: ${index % 2 === 0 ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' : 'white'}; transition: all 0.3s ease;">
                <td style="border: none; border-bottom: 1px solid #e0e0e0; padding: 12px 8px; text-align: center; font-weight: bold; color: #1976d2; font-size: 14px;">
                  ${medal} ${globalRank}
                </td>
                <td style="border: none; border-bottom: 1px solid #e0e0e0; padding: 12px 8px; text-align: center; font-weight: 500; font-size: 14px;">
                  ${report.student.fullName}
                </td>
                <td style="border: none; border-bottom: 1px solid #e0e0e0; padding: 12px 8px; text-align: center;">
                  <span style="background: ${statusColor}20; color: ${statusColor}; padding: 6px 12px; border-radius: 15px; font-weight: bold; font-size: 14px; border: 2px solid ${statusColor};">
                    ${report.generalAverage}/10
                  </span>
                </td>
                <td style="border: none; border-bottom: 1px solid #e0e0e0; padding: 12px 8px; text-align: center;">
                  <span style="background: ${appreciationColor}20; color: ${appreciationColor}; padding: 6px 12px; border-radius: 12px; font-weight: bold; font-size: 13px; border: 2px solid ${appreciationColor};">
                    ${appreciation}
                  </span>
                </td>
                <td style="border: none; border-bottom: 1px solid #e0e0e0; padding: 12px 8px; text-align: center;">
                  <span style="background: ${statusColor}; color: white; padding: 6px 12px; border-radius: 12px; font-weight: bold; font-size: 13px; box-shadow: 0 2px 4px ${statusColor}40;">
                    ${status}
                  </span>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- معلومات الصفحة -->
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); padding: 20px; border-radius: 15px; border: 2px solid #1976d2; margin-top: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: center;">
            ${settings.logo ?
              `<img src="${settings.logo}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; margin-bottom: 8px; border: 2px solid #1976d2;" alt="لوجو الأكاديمية" />` :
              `<div style="width: 40px; height: 40px; background: #1976d2; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold;">🎓</div>`
            }
            <p style="margin: 0; font-size: 12px; color: #666;">إدارة الأكاديمية</p>
            <div style="border-top: 2px solid #1976d2; width: 100px; margin: 10px auto 5px;"></div>
            <p style="margin: 0; font-size: 10px; color: #999;">التوقيع والختم</p>
          </div>

          <div style="text-align: center;">
            <p style="margin: 0 0 5px 0; font-size: 16px; color: #1976d2; font-weight: bold;">
              الصفحة ${pageNumber} من ${totalPages}
            </p>
            <p style="margin: 0 0 5px 0; font-size: 12px; color: #333;">
              <strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString('ar-DZ')}
            </p>
            <p style="margin: 0; font-size: 12px; color: #333;">
              <strong>الوقت:</strong> ${new Date().toLocaleTimeString('ar-DZ')}
            </p>
          </div>

          <div style="text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #1976d2; font-weight: bold;">
              ${settings.academyName || 'أكاديمية نجم بلوس'}
            </p>
            <p style="margin: 3px 0; font-size: 11px; color: #666;">
              ${settings.academyAddress || 'العنوان'}
            </p>
            <p style="margin: 3px 0; font-size: 11px; color: #666;">
              📞 ${settings.academyPhone || 'رقم الهاتف'}
            </p>
          </div>
        </div>
      </div>
    `;
  };

  const generateClassHTML = (data) => {
    const { classData, studentReports, classAverage } = data;

    const passedStudents = studentReports.filter(r => r.generalAverage >= 5).length;
    const failedStudents = studentReports.length - passedStudents;
    const passRate = studentReports.length > 0 ? ((passedStudents / studentReports.length) * 100).toFixed(1) : 0;

    return `
      <div style="margin-bottom: 20px;">
        <!-- رأس الأكاديمية مع اللوجو -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
          ${settings.logo ?
            `<img src="${settings.logo}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 2px solid #1976d2; box-shadow: 0 2px 6px rgba(0,0,0,0.1);" alt="لوجو الأكاديمية" />` :
            `<div style="width: 50px; height: 50px; background: #1976d2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">🎓</div>`
          }
          <h1 style="color: #1976d2; margin: 0; font-size: 24px; font-weight: bold;">
            ${settings.academyName || 'أكاديمية نجم بلوس'}
          </h1>
        </div>

        <!-- عنوان التقرير -->
        <div style="text-align: center;">
          <h2 style="color: #666; margin: 0; font-size: 18px;">
            تقرير القسم: ${classData.name}
          </h2>
        </div>
        <div style="border: 2px solid #1976d2; padding: 15px; border-radius: 12px; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); box-shadow: 0 3px 8px rgba(0,0,0,0.1);">
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center; margin-bottom: 15px;">
            <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #1976d2; margin: 3px 0; font-size: 14px;">عدد التلاميذ</h3>
              <p style="font-size: 22px; font-weight: bold; margin: 3px 0; color: #1976d2;">${data.totalStudents}</p>
              <p style="font-size: 10px; color: #666; margin: 0;">تلميذ مسجل</p>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #4caf50; margin: 3px 0; font-size: 14px;">معدل القسم</h3>
              <p style="font-size: 22px; font-weight: bold; margin: 3px 0; color: #4caf50;">${classAverage}/10</p>
              <p style="font-size: 10px; color: #666; margin: 0;">المعدل العام</p>
            </div>
            <div style="background: white; padding: 10px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h3 style="color: #ff9800; margin: 3px 0; font-size: 14px;">نسبة النجاح</h3>
              <p style="font-size: 22px; font-weight: bold; margin: 3px 0; color: #ff9800;">${passRate}%</p>
              <p style="font-size: 10px; color: #666; margin: 0;">من التلاميذ</p>
            </div>
          </div>
          <div style="text-align: center; padding: 8px; background: white; border-radius: 6px; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">
            <p style="margin: 0; font-size: 14px; color: #333;"><strong>السنة الدراسية:</strong> ${settings.currentYear || '2024-2025'}</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 15px;">
        <h3 style="color: #1976d2; border-bottom: 3px solid #1976d2; padding-bottom: 8px; margin-bottom: 15px; font-size: 18px;">
          📊 إحصائيات مفصلة
        </h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%); padding: 12px; border-radius: 10px; text-align: center; border: 2px solid #4caf50; box-shadow: 0 2px 6px rgba(76, 175, 80, 0.2);">
            <div style="background: #4caf50; color: white; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 18px;">✓</div>
            <h4 style="color: #2e7d32; margin: 5px 0; font-size: 16px;">التلاميذ الناجحون</h4>
            <p style="font-size: 24px; font-weight: bold; color: #2e7d32; margin: 5px 0;">${passedStudents}</p>
            <p style="font-size: 12px; color: #388e3c; margin: 0;">معدل 5/10 فما فوق</p>
          </div>
          <div style="background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%); padding: 12px; border-radius: 10px; text-align: center; border: 2px solid #f44336; box-shadow: 0 2px 6px rgba(244, 67, 54, 0.2);">
            <div style="background: #f44336; color: white; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 18px;">✗</div>
            <h4 style="color: #c62828; margin: 5px 0; font-size: 16px;">التلاميذ الراسبون</h4>
            <p style="font-size: 24px; font-weight: bold; color: #c62828; margin: 5px 0;">${failedStudents}</p>
            <p style="font-size: 12px; color: #d32f2f; margin: 0;">معدل أقل من 5/10</p>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 10px;">
        <h3 style="color: #1976d2; border-bottom: 3px solid #1976d2; padding-bottom: 8px; margin-bottom: 15px; font-size: 18px;">
          🏆 ترتيب التلاميذ
        </h3>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; box-shadow: 0 3px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); color: white;">
            <th style="border: none; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 14px;">🏅 الترتيب</th>
            <th style="border: none; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 14px;">👤 اسم التلميذ</th>
            <th style="border: none; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 14px;">📊 المعدل العام</th>
            <th style="border: none; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 14px;">⭐ التقدير</th>
            <th style="border: none; padding: 12px 8px; text-align: center; font-weight: bold; font-size: 14px;">✅ الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${studentReports
            .sort((a, b) => b.generalAverage - a.generalAverage)
            .map((report, index) => {
              const appreciation = report.generalAverage >= 8 ? 'ممتاز' :
                                  report.generalAverage >= 6 ? 'جيد' :
                                  report.generalAverage >= 5 ? 'مقبول' : 'ضعيف';
              const status = report.generalAverage >= 5 ? 'ناجح' : 'راسب';
              const statusColor = report.generalAverage >= 5 ? '#4caf50' : '#f44336';
              const appreciationColor = report.generalAverage >= 8 ? '#4caf50' :
                                       report.generalAverage >= 6 ? '#ff9800' :
                                       report.generalAverage >= 5 ? '#2196f3' : '#f44336';

              // إضافة ميدالية للمراكز الثلاثة الأولى
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

              return `
                <tr style="background: ${index % 2 === 0 ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' : 'white'};">
                  <td style="border: none; border-bottom: 1px solid #e0e0e0; padding: 10px 8px; text-align: center; font-weight: bold; color: #1976d2; font-size: 13px;">
                    ${medal} ${index + 1}
                  </td>
                  <td style="border: none; border-bottom: 1px solid #e0e0e0; padding: 10px 8px; text-align: center; font-weight: 500; font-size: 13px;">
                    ${report.student.fullName}
                  </td>
                  <td style="border: none; border-bottom: 1px solid #e0e0e0; padding: 10px 8px; text-align: center;">
                    <span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 8px; border-radius: 12px; font-weight: bold; font-size: 13px;">
                      ${report.generalAverage}/10
                    </span>
                  </td>
                  <td style="border: none; border-bottom: 1px solid #e0e0e0; padding: 10px 8px; text-align: center;">
                    <span style="background: ${appreciationColor}20; color: ${appreciationColor}; padding: 4px 8px; border-radius: 10px; font-weight: bold; font-size: 12px;">
                      ${appreciation}
                    </span>
                  </td>
                  <td style="border: none; border-bottom: 1px solid #e0e0e0; padding: 10px 8px; text-align: center;">
                    <span style="background: ${statusColor}; color: white; padding: 4px 8px; border-radius: 10px; font-weight: bold; font-size: 12px;">
                      ${status}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
        </tbody>
      </table>

      <div style="margin-top: 30px; padding: 15px; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); border-radius: 10px; border: 2px solid #1976d2;">
        <div style="text-align: center; margin-bottom: 15px;">
          <h4 style="color: #1976d2; margin: 0 0 8px 0; font-size: 16px;">📅 معلومات التقرير</h4>
          <p style="margin: 3px 0; font-size: 12px; color: #333;">
            <strong>تاريخ الإصدار:</strong> ${new Date().toLocaleDateString('ar-DZ')}
          </p>
          <p style="margin: 3px 0; font-size: 12px; color: #333;">
            <strong>الوقت:</strong> ${new Date().toLocaleTimeString('ar-DZ')}
          </p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: center;">
            ${settings.logo ?
              `<img src="${settings.logo}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover; margin-bottom: 5px; border: 1px solid #1976d2;" alt="لوجو الأكاديمية" />` :
              `<div style="width: 30px; height: 30px; background: #1976d2; border-radius: 50%; margin: 0 auto 5px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">🎓</div>`
            }
            <p style="margin: 0; font-size: 10px; color: #666;">إدارة الأكاديمية</p>
            <div style="border-top: 1px solid #1976d2; width: 80px; margin: 8px auto 3px;"></div>
            <p style="margin: 0; font-size: 8px; color: #999;">التوقيع والختم</p>
          </div>

          <div style="text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #1976d2; font-weight: bold;">
              ${settings.academyName || 'أكاديمية نجم بلوس'}
            </p>
            <p style="margin: 2px 0; font-size: 10px; color: #666;">
              ${settings.academyAddress || 'العنوان'}
            </p>
            <p style="margin: 2px 0; font-size: 10px; color: #666;">
              📞 ${settings.academyPhone || 'رقم الهاتف'}
            </p>
          </div>
        </div>
      </div>
    `;
  };

  const generateCertificateHTML = (data) => {
    const { student, generalAverage, studentClass } = data;

    const appreciationWithPrefix = generalAverage >= 8 ? 'بتقدير ممتاز' :
                                  generalAverage >= 6 ? 'بتقدير جيد' :
                                  'بتقدير مقبول';

    const appreciationColor = generalAverage >= 8 ? '#4caf50' :
                             generalAverage >= 6 ? '#ff9800' : '#2196f3';

    return `
      <div style="width: 100%; height: 100%; padding: 20px; border: 5px solid #1976d2; border-radius: 20px; background: linear-gradient(135deg, #f8f9fa 0%, #e3f2fd 100%); box-sizing: border-box; position: relative; display: flex; flex-direction: column;">

        <!-- الزخرفة العلوية -->
        <div style="position: absolute; top: 10px; left: 50%; transform: translateX(-50%); width: 90%; height: 3px; background: linear-gradient(90deg, #1976d2, #42a5f5, #1976d2); border-radius: 2px;"></div>

        <!-- رأس الشهادة مع اللوجو وصورة التلميذ -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-top: 10px;">
          <!-- اللوجو في الجهة اليمنى -->
          <div style="flex-shrink: 0;">
            ${settings.logo ?
              `<img src="${settings.logo}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid #1976d2; box-shadow: 0 3px 8px rgba(0,0,0,0.2);" alt="لوجو الأكاديمية" />` :
              `<div style="width: 70px; height: 70px; background: #1976d2; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold; box-shadow: 0 3px 8px rgba(0,0,0,0.2);">🎓</div>`
            }
          </div>

          <!-- معلومات الأكاديمية في المنتصف -->
          <div style="text-align: center; flex: 1;">
            <h1 style="color: #1976d2; margin: 0; font-size: 24px; font-weight: bold; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
              ${settings.academyName || 'أكاديمية نجم بلوس'}
            </h1>
            <p style="color: #666; margin: 5px 0; font-size: 12px; font-weight: 500;">للتعليم والتكوين</p>
            <h2 style="color: #1976d2; margin: 10px 0; font-size: 20px; font-weight: bold;">
              🏆 شهادة نجاح 🏆
            </h2>
          </div>

          <!-- صورة التلميذ في الجهة اليسرى -->
          <div style="flex-shrink: 0;">
            ${student.photo ?
              `<img src="${student.photo}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover; border: 3px solid ${appreciationColor}; box-shadow: 0 3px 8px rgba(0,0,0,0.2);" alt="صورة التلميذ" />` :
              `<div style="width: 70px; height: 70px; border-radius: 50%; background: ${appreciationColor}; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; font-weight: bold; border: 3px solid ${appreciationColor}; box-shadow: 0 3px 8px rgba(0,0,0,0.2);">${student.fullName?.charAt(0) || 'ت'}</div>`
            }
          </div>
        </div>

        <!-- عنوان الشهادة -->
        <div style="text-align: center; margin: 30px 0;">
          <h2 style="color: #1976d2; font-size: 36px; margin: 0; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);">
            🏆 شهادة نجاح 🏆
          </h2>
          <div style="width: 200px; height: 4px; background: linear-gradient(90deg, #1976d2, #42a5f5, #1976d2); margin: 15px auto; border-radius: 2px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>
        </div>

        <!-- المحتوى الرئيسي -->
        <div style="flex: 1; display: flex; align-items: stretch; gap: 20px; margin: 10px 0;">

          <!-- القسم الأيسر: النص والمعلومات -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; padding: 15px;">
            <p style="font-size: 14px; color: #333; margin-bottom: 10px; line-height: 1.5;">
              تشهد إدارة <strong style="color: #1976d2;">${settings.academyName || 'أكاديمية نجم بلوس'}</strong>
            </p>
            <p style="font-size: 14px; color: #333; margin-bottom: 15px; line-height: 1.5;">
              بأن التلميذ(ة):
            </p>

            <div style="background: white; border: 2px solid ${appreciationColor}; border-radius: 12px; padding: 15px; margin: 10px 0; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
              <h3 style="color: #1976d2; font-size: 18px; margin: 0 0 5px 0; font-weight: bold;">
                ${student.fullName}
              </h3>
              <p style="color: #666; margin: 0; font-size: 14px;">
                ${studentClass?.name || 'القسم غير محدد'}
              </p>
            </div>

            <p style="font-size: 13px; color: #333; margin: 10px 0;">
              قد نجح(ت) في امتحانات نهاية السنة الدراسية
            </p>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">
              للسنة الدراسية: <strong style="color: #1976d2;">${settings.currentYear || '2024-2025'}</strong>
            </p>
          </div>

          <!-- القسم الأيمن: النتيجة والتقدير -->
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; text-align: center; padding: 15px;">
            <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 6px 20px rgba(0,0,0,0.1); border: 3px solid ${appreciationColor}; height: 100%; display: flex; flex-direction: column; justify-content: center;">

              <!-- دائرة النتيجة -->
              <div style="background: ${appreciationColor}; color: white; padding: 15px; border-radius: 50%; display: inline-block; margin: 0 auto 15px; box-shadow: 0 6px 15px ${appreciationColor}40; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                <span style="font-size: 20px; font-weight: bold; margin-bottom: 2px;">${generalAverage}</span>
                <span style="font-size: 10px; opacity: 0.9;">من 10</span>
              </div>

              <!-- التقدير -->
              <h3 style="color: ${appreciationColor}; margin: 10px 0; font-size: 16px; font-weight: bold;">
                ${appreciationWithPrefix}
              </h3>

              <!-- رسالة التهنئة -->
              <div style="background: ${appreciationColor}15; padding: 10px; border-radius: 8px; margin-top: 10px; border: 1px solid ${appreciationColor}30;">
                <p style="color: ${appreciationColor}; font-size: 12px; font-weight: bold; margin: 0;">
                  🎉 مبروك النجاح 🎉
                </p>
                <p style="color: #666; font-size: 10px; margin: 3px 0 0 0;">
                  نتمنى لك مزيداً من التفوق
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- التوقيعات والتاريخ -->
        <div style="margin-top: 15px; display: flex; justify-content: space-between; align-items: center; padding: 10px 20px; background: rgba(255,255,255,0.7); border-radius: 10px; border: 1px solid #e0e0e0;">

          <!-- التاريخ -->
          <div style="text-align: center; flex: 1;">
            <p style="margin: 0; font-size: 11px; color: #666; font-weight: bold;">التاريخ:</p>
            <p style="margin: 3px 0; font-weight: bold; color: #1976d2; font-size: 12px;">
              ${new Date().toLocaleDateString('ar-DZ')}
            </p>
          </div>

          <!-- معلومات الأكاديمية -->
          <div style="text-align: center; flex: 2;">
            <p style="margin: 0; font-size: 12px; color: #666; font-weight: bold;">
              ${settings.academyName || 'أكاديمية نجم بلوس'}
            </p>
            <p style="margin: 2px 0; font-size: 10px; color: #999;">
              ${settings.academyAddress || 'العنوان'} • 📞 ${settings.academyPhone || 'رقم الهاتف'}
            </p>
          </div>

          <!-- التوقيع والختم -->
          <div style="text-align: center; flex: 1;">
            <p style="margin: 0; font-size: 11px; color: #666; font-weight: bold;">إدارة الأكاديمية</p>
            <div style="border-top: 2px solid #1976d2; width: 80px; margin: 8px auto 3px;"></div>
            <p style="margin: 0; font-size: 9px; color: #999;">التوقيع والختم</p>
          </div>
        </div>

        <!-- الزخرفة السفلية -->
        <div style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%); width: 90%; height: 2px; background: linear-gradient(90deg, #1976d2, #42a5f5, #1976d2); border-radius: 1px;"></div>
      </div>
    `;
  };

  const handleGenerateReport = () => {
    if (selectedStudent) {
      const data = generateStudentReport(parseInt(selectedStudent));
      setReportData(data);
    } else if (selectedClass) {
      const data = generateClassReport(parseInt(selectedClass));
      setReportData(data);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'success';
    if (score >= 5) return 'warning';
    return 'error';
  };

  return (
    <Box>
      {/* العنوان */}
      <Typography variant="h4" component="h1" gutterBottom>
        التقارير والشهادات
      </Typography>

      {/* أدوات التحكم */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            إنشاء التقارير
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>اختر القسم</InputLabel>
                <Select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedStudent('');
                    setReportData(null);
                  }}
                  label="اختر القسم"
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
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>اختر التلميذ</InputLabel>
                <Select
                  value={selectedStudent}
                  onChange={(e) => {
                    setSelectedStudent(e.target.value);
                    setReportData(null);
                  }}
                  label="اختر التلميذ"
                  disabled={!selectedClass}
                >
                  <MenuItem value="">جميع التلاميذ</MenuItem>
                  {students
                    .filter(student => student.classId === parseInt(selectedClass))
                    .map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.fullName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={handleGenerateReport}
                disabled={!selectedClass}
                fullWidth
                startIcon={<ReportIcon />}
              >
                إنشاء التقرير
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* عرض التقرير */}
      {reportData && (
        <Card>
          <CardContent>
            {selectedStudent ? (
              // تقرير تلميذ واحد
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">
                    كشف نقاط التلميذ: {reportData.student.fullName}
                  </Typography>
                  <Box>
                    <Button
                      variant="outlined"
                      startIcon={<PdfIcon />}
                      onClick={() => generatePDF('student', reportData)}
                      sx={{ mr: 1 }}
                    >
                      تحميل كشف النقاط
                    </Button>
                    {reportData.generalAverage >= 5 && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CertificateIcon />}
                        onClick={() => generatePDF('certificate', reportData)}
                      >
                        شهادة نجاح
                      </Button>
                    )}
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>معلومات التلميذ</Typography>
                      <Typography>الاسم: {reportData.student.fullName}</Typography>
                      <Typography>العمر: {reportData.student.age} سنة</Typography>
                      <Typography>القسم: {reportData.studentClass?.name}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>الإحصائيات</Typography>
                      <Typography>المعدل العام: 
                        <Chip 
                          label={`${reportData.generalAverage}/10`}
                          color={getScoreColor(reportData.generalAverage)}
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                      <Typography>عدد النقاط: {reportData.totalGrades}</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>المادة</TableCell>
                        <TableCell>عدد النقاط</TableCell>
                        <TableCell>المعدل</TableCell>
                        <TableCell>المعامل</TableCell>
                        <TableCell>النقطة المعاملة</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.subjectReports.map((report) => (
                        <TableRow key={report.subject.id}>
                          <TableCell>{report.subject.name}</TableCell>
                          <TableCell>{report.gradeCount}</TableCell>
                          <TableCell>
                            <Chip
                              label={`${report.average}/10`}
                              color={getScoreColor(report.average)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{report.subject.coefficient}</TableCell>
                          <TableCell>
                            {(report.average * report.subject.coefficient).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              // تقرير القسم
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6">
                    تقرير القسم: {reportData.classData.name}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<PdfIcon />}
                    onClick={() => generatePDF('class', reportData)}
                  >
                    تحميل تقرير القسم
                  </Button>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {reportData.totalStudents}
                      </Typography>
                      <Typography>عدد التلاميذ</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="success.main">
                        {reportData.classAverage}
                      </Typography>
                      <Typography>معدل القسم</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="info.main">
                        {reportData.studentReports.filter(r => r.generalAverage >= 5).length}
                      </Typography>
                      <Typography>التلاميذ الناجحون</Typography>
                    </Paper>
                  </Grid>
                </Grid>

                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>التلميذ</TableCell>
                        <TableCell>المعدل العام</TableCell>
                        <TableCell>عدد النقاط</TableCell>
                        <TableCell>الحالة</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.studentReports.map((report) => (
                        <TableRow key={report.student.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar
                                sx={{ mr: 2, bgcolor: '#1976d2' }}
                                src={report.student.photo}
                              >
                                {!report.student.photo && report.student.fullName.charAt(0)}
                              </Avatar>
                              {report.student.fullName}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={`${report.generalAverage}/10`}
                              color={getScoreColor(report.generalAverage)}
                            />
                          </TableCell>
                          <TableCell>{report.totalGrades}</TableCell>
                          <TableCell>
                            <Chip
                              label={report.generalAverage >= 5 ? 'ناجح' : 'راسب'}
                              color={report.generalAverage >= 5 ? 'success' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {!reportData && (
        <Alert severity="info">
          اختر قسماً أو تلميذاً لإنشاء التقرير المطلوب
        </Alert>
      )}
    </Box>
  );
};

export default ReportsManager;
