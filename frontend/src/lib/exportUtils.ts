import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export interface TimetableData {
  [day: string]: {
    [timeSlot: string]: {
      subject: string;
      teacher: string;
      room: string;
    } | null;
  };
}

export interface ExportOptions {
  filename?: string;
  title?: string;
  institutionName?: string;
  semester?: string;
  generatedDate?: string;
}

// Export as PNG
export const exportTimetableAsPNG = async (
  elementId: string, 
  options: ExportOptions = {}
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Timetable element not found');
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    });

    const link = document.createElement('a');
    link.download = `${options.filename || 'timetable'}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting PNG:', error);
    throw new Error('Failed to export as PNG');
  }
};

// Export as PDF
export const exportTimetableAsPDF = async (
  elementId: string,
  options: ExportOptions = {}
): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Timetable element not found');
  }

  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
    
    const imgWidth = 297; // A4 landscape width in mm
    const pageHeight = 210; // A4 landscape height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add title page
    if (options.title) {
      pdf.setFontSize(20);
      pdf.text(options.title, 148.5, 30, { align: 'center' });
      
      if (options.institutionName) {
        pdf.setFontSize(14);
        pdf.text(options.institutionName, 148.5, 45, { align: 'center' });
      }
      
      if (options.semester) {
        pdf.setFontSize(12);
        pdf.text(`Semester: ${options.semester}`, 148.5, 60, { align: 'center' });
      }
      
      if (options.generatedDate) {
        pdf.setFontSize(10);
        pdf.text(`Generated on: ${options.generatedDate}`, 148.5, 75, { align: 'center' });
      }
      
      position = 90;
    }

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${options.filename || 'timetable'}.pdf`);
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw new Error('Failed to export as PDF');
  }
};

// Export as Excel
export const exportTimetableAsExcel = (
  timetableData: TimetableData,
  options: ExportOptions = {}
): void => {
  try {
    const days = Object.keys(timetableData);
    const timeSlots = Object.keys(timetableData[days[0]] || {});

    // Create worksheet data
    const wsData: any[][] = [];
    
    // Header row
    wsData.push(['Time', ...days]);
    
    // Data rows
    timeSlots.forEach(timeSlot => {
      const row = [timeSlot];
      days.forEach(day => {
        const slot = timetableData[day][timeSlot];
        if (slot) {
          row.push(`${slot.subject}\n${slot.teacher}\n${slot.room}`);
        } else {
          row.push('Free');
        }
      });
      wsData.push(row);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [{ wch: 15 }, ...days.map(() => ({ wch: 25 }))];
    ws['!cols'] = colWidths;

    // Set row heights for better readability
    const rowHeights = wsData.map(() => ({ hpt: 60 }));
    ws['!rows'] = rowHeights;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Timetable');

    // Add metadata sheet if options provided
    if (options.title || options.institutionName || options.semester) {
      const metaData = [
        ['Property', 'Value'],
        ['Title', options.title || ''],
        ['Institution', options.institutionName || ''],
        ['Semester', options.semester || ''],
        ['Generated Date', options.generatedDate || new Date().toLocaleDateString()],
        ['Export Date', new Date().toLocaleDateString()]
      ];
      
      const metaWs = XLSX.utils.aoa_to_sheet(metaData);
      XLSX.utils.book_append_sheet(wb, metaWs, 'Information');
    }

    // Save file
    XLSX.writeFile(wb, `${options.filename || 'timetable'}.xlsx`);
  } catch (error) {
    console.error('Error exporting Excel:', error);
    throw new Error('Failed to export as Excel');
  }
};

// Export as CSV
export const exportTimetableAsCSV = (
  timetableData: TimetableData,
  options: ExportOptions = {}
): void => {
  try {
    const days = Object.keys(timetableData);
    const timeSlots = Object.keys(timetableData[days[0]] || {});

    let csvContent = '';
    
    // Add metadata if provided
    if (options.title) csvContent += `Title,${options.title}\n`;
    if (options.institutionName) csvContent += `Institution,${options.institutionName}\n`;
    if (options.semester) csvContent += `Semester,${options.semester}\n`;
    if (options.generatedDate) csvContent += `Generated Date,${options.generatedDate}\n`;
    csvContent += `Export Date,${new Date().toLocaleDateString()}\n\n`;

    // Header row
    csvContent += `Time,${days.join(',')}\n`;
    
    // Data rows
    timeSlots.forEach(timeSlot => {
      const row = [timeSlot];
      days.forEach(day => {
        const slot = timetableData[day][timeSlot];
        if (slot) {
          row.push(`"${slot.subject} | ${slot.teacher} | ${slot.room}"`);
        } else {
          row.push('Free');
        }
      });
      csvContent += row.join(',') + '\n';
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${options.filename || 'timetable'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    throw new Error('Failed to export as CSV');
  }
};

// Utility function to extract timetable data from various formats
export const extractTimetableData = (timetable: any): TimetableData => {
  if (timetable.timetable_data) {
    return timetable.timetable_data;
  }
  
  if (timetable.timetable) {
    return timetable.timetable;
  }
  
  // If it's already in the right format
  if (typeof timetable === 'object' && timetable.Monday) {
    return timetable;
  }
  
  // Default empty timetable
  return {
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {}
  };
};

// Generate export options from timetable object
export const generateExportOptions = (timetable: any): ExportOptions => {
  return {
    filename: `timetable_${timetable.name || 'export'}_${new Date().toISOString().split('T')[0]}`,
    title: timetable.name || 'Academic Timetable',
    institutionName: timetable.institution_name || 'Educational Institution',
    semester: timetable.semester ? `Semester ${timetable.semester}` : 'Current Semester',
    generatedDate: timetable.created_at ? new Date(timetable.created_at).toLocaleDateString() : new Date().toLocaleDateString()
  };
};
