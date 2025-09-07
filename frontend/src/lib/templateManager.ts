import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export interface BranchData {
  name: string;
  code: string;
  totalStudents: number;
  sections: number;
  yearLevel: number;
}

export interface TeacherData {
  name: string;
  employeeId: string;
  email: string;
  department: string;
  subjects: string[];
  maxHoursPerDay: number;
}

export interface SubjectData {
  name: string;
  code: string;
  type: 'theory' | 'practical' | 'tutorial';
  credits: number;
  contactHours: number;
  branch: string;
  semester: number;
}

export interface RoomData {
  name: string;
  type: 'classroom' | 'lab' | 'auditorium' | 'seminar';
  capacity: number;
  equipment: string[];
  branch?: string;
}

export interface TimetableGenerationData {
  branches: BranchData[];
  teachers: TeacherData[];
  subjects: SubjectData[];
  rooms: RoomData[];
  preferences: {
    startTime: string;
    endTime: string;
    lunchBreak: string;
    workingDays: string[];
    periodDuration: number;
  };
}

class TemplateManager {
  // Create Branches Template
  async createBranchesTemplate(): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Branches');

    // Set column widths
    worksheet.columns = [
      { header: 'Branch Name', key: 'name', width: 25 },
      { header: 'Branch Code', key: 'code', width: 15 },
      { header: 'Total Students', key: 'totalStudents', width: 15 },
      { header: 'Number of Sections', key: 'sections', width: 18 },
      { header: 'Year Level', key: 'yearLevel', width: 12 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' }
    };

    // Add sample data
    const sampleData = [
      { name: 'Computer Science', code: 'CS', totalStudents: 120, sections: 3, yearLevel: 3 },
      { name: 'Information Technology', code: 'IT', totalStudents: 100, sections: 2, yearLevel: 3 },
      { name: 'Electronics Engineering', code: 'EC', totalStudents: 80, sections: 2, yearLevel: 3 }
    ];

    sampleData.forEach(data => {
      worksheet.addRow(data);
    });

    // Add data validation
    worksheet.getColumn('totalStudents').eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'whole',
          operator: 'greaterThan',
          formula1: 0,
          showErrorMessage: true,
          errorTitle: 'Invalid Input',
          error: 'Total students must be greater than 0'
        };
      }
    });

    // Add instructions sheet
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.getColumn(1).width = 80;
    
    const instructions = [
      'BRANCHES TEMPLATE INSTRUCTIONS',
      '',
      '1. Branch Name: Full name of the academic branch/department',
      '2. Branch Code: Short code (2-4 characters) for the branch',
      '3. Total Students: Total number of students in the branch',
      '4. Number of Sections: How many sections/divisions per year',
      '5. Year Level: Current year level (1, 2, 3, 4)',
      '',
      'IMPORTANT NOTES:',
      '• Do not modify the header row',
      '• Branch codes should be unique',
      '• Total students must be greater than 0',
      '• Use only the provided format',
      '',
      'EXAMPLE:',
      'Computer Science | CS | 120 | 3 | 3'
    ];

    instructions.forEach((instruction, index) => {
      const cell = instructionsSheet.getCell(index + 1, 1);
      cell.value = instruction;
      if (index === 0) {
        cell.font = { bold: true, size: 16 };
      } else if (instruction.startsWith('IMPORTANT') || instruction.startsWith('EXAMPLE')) {
        cell.font = { bold: true };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Branches_Template.xlsx');
  }

  // Create Teachers Template
  async createTeachersTemplate(): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Teachers');

    worksheet.columns = [
      { header: 'Teacher Name', key: 'name', width: 25 },
      { header: 'Employee ID', key: 'employeeId', width: 15 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Department', key: 'department', width: 20 },
      { header: 'Subject Specializations', key: 'subjects', width: 40 },
      { header: 'Max Hours Per Day', key: 'maxHoursPerDay', width: 18 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '70AD47' }
    };

    // Add sample data
    const sampleData = [
      { 
        name: 'Dr. John Smith', 
        employeeId: 'T001', 
        email: 'john.smith@institution.edu',
        department: 'Computer Science',
        subjects: 'Data Structures, Algorithms, Programming',
        maxHoursPerDay: 6
      },
      { 
        name: 'Prof. Sarah Johnson', 
        employeeId: 'T002', 
        email: 'sarah.johnson@institution.edu',
        department: 'Computer Science',
        subjects: 'Database Systems, Web Development',
        maxHoursPerDay: 5
      }
    ];

    sampleData.forEach(data => {
      worksheet.addRow(data);
    });

    // Add instructions sheet
    const instructionsSheet = workbook.addWorksheet('Instructions');
    instructionsSheet.getColumn(1).width = 80;
    
    const instructions = [
      'TEACHERS TEMPLATE INSTRUCTIONS',
      '',
      '1. Teacher Name: Full name with title (Dr., Prof., etc.)',
      '2. Employee ID: Unique identifier for the teacher',
      '3. Email: Official email address',
      '4. Department: Department/Branch name (must match Branches template)',
      '5. Subject Specializations: Comma-separated list of subjects they can teach',
      '6. Max Hours Per Day: Maximum teaching hours per day (1-8)',
      '',
      'IMPORTANT NOTES:',
      '• Employee IDs must be unique',
      '• Email addresses must be valid format',
      '• Department names must match exactly with Branches template',
      '• Subject names will be used for assignment',
      '• Max hours should be realistic (typically 4-6 hours)',
      '',
      'EXAMPLE:',
      'Dr. John Smith | T001 | john@edu.com | Computer Science | Data Structures, Algorithms | 6'
    ];

    instructions.forEach((instruction, index) => {
      const cell = instructionsSheet.getCell(index + 1, 1);
      cell.value = instruction;
      if (index === 0) {
        cell.font = { bold: true, size: 16 };
      } else if (instruction.startsWith('IMPORTANT') || instruction.startsWith('EXAMPLE')) {
        cell.font = { bold: true };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Teachers_Template.xlsx');
  }

  // Create Subjects Template
  async createSubjectsTemplate(): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Subjects');

    worksheet.columns = [
      { header: 'Subject Name', key: 'name', width: 30 },
      { header: 'Subject Code', key: 'code', width: 15 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Credits', key: 'credits', width: 10 },
      { header: 'Contact Hours', key: 'contactHours', width: 15 },
      { header: 'Branch', key: 'branch', width: 20 },
      { header: 'Semester', key: 'semester', width: 12 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'E74C3C' }
    };

    // Add sample data
    const sampleData = [
      { 
        name: 'Data Structures and Algorithms', 
        code: 'CS301', 
        type: 'theory',
        credits: 4,
        contactHours: 4,
        branch: 'Computer Science',
        semester: 5
      },
      { 
        name: 'Programming Laboratory', 
        code: 'CS302', 
        type: 'practical',
        credits: 2,
        contactHours: 3,
        branch: 'Computer Science',
        semester: 5
      }
    ];

    sampleData.forEach(data => {
      worksheet.addRow(data);
    });

    // Add data validation for Type column
    worksheet.getColumn('type').eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"theory,practical,tutorial"'],
          showErrorMessage: true,
          errorTitle: 'Invalid Type',
          error: 'Please select from: theory, practical, tutorial'
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Subjects_Template.xlsx');
  }

  // Create Rooms Template
  async createRoomsTemplate(): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Rooms');

    worksheet.columns = [
      { header: 'Room Name', key: 'name', width: 20 },
      { header: 'Room Type', key: 'type', width: 15 },
      { header: 'Capacity', key: 'capacity', width: 12 },
      { header: 'Equipment', key: 'equipment', width: 40 },
      { header: 'Assigned Branch', key: 'branch', width: 20 }
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '9B59B6' }
    };

    // Add sample data
    const sampleData = [
      { 
        name: 'Room 101', 
        type: 'classroom', 
        capacity: 40,
        equipment: 'Projector, Whiteboard, AC',
        branch: 'Computer Science'
      },
      { 
        name: 'Lab A', 
        type: 'lab', 
        capacity: 30,
        equipment: 'Computers, Projector, AC, Network',
        branch: 'Computer Science'
      }
    ];

    sampleData.forEach(data => {
      worksheet.addRow(data);
    });

    // Add data validation for Room Type
    worksheet.getColumn('type').eachCell((cell, rowNumber) => {
      if (rowNumber > 1) {
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"classroom,lab,auditorium,seminar"'],
          showErrorMessage: true,
          errorTitle: 'Invalid Type',
          error: 'Please select from: classroom, lab, auditorium, seminar'
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Rooms_Template.xlsx');
  }

  // Download all templates at once
  async downloadAllTemplates(): Promise<void> {
    await this.createBranchesTemplate();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await this.createTeachersTemplate();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await this.createSubjectsTemplate();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await this.createRoomsTemplate();
  }

  // Parse uploaded Excel file
  async parseExcelFile(file: File, templateType: 'branches' | 'teachers' | 'subjects' | 'rooms'): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    const buffer = await file.arrayBuffer();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.getWorksheet(1);
    const data: any[] = [];
    
    if (!worksheet) {
      throw new Error('No worksheet found in the file');
    }

    // Skip header row and process data
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) {
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          const header = worksheet.getRow(1).getCell(colNumber).value as string;
          rowData[this.normalizeKey(header)] = cell.value;
        });
        
        if (this.validateRowData(rowData, templateType)) {
          data.push(rowData);
        }
      }
    });

    return data;
  }

  private normalizeKey(header: string): string {
    return header.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  }

  private validateRowData(data: any, templateType: string): boolean {
    // Basic validation - can be enhanced
    switch (templateType) {
      case 'branches':
        return data.branchname && data.branchcode;
      case 'teachers':
        return data.teachername && data.employeeid;
      case 'subjects':
        return data.subjectname && data.subjectcode;
      case 'rooms':
        return data.roomname && data.roomtype;
      default:
        return false;
    }
  }
}

export const templateManager = new TemplateManager();
