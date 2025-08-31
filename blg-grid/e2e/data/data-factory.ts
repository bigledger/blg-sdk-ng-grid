import { faker } from '@faker-js/faker';
import { GridColumn, GridRow, GridDataSet } from './types';

export class DataFactory {
  static createSmallDataset(): GridDataSet {
    const columns = this.createStandardColumns();
    const rows = this.generateRows(50, columns);
    
    return {
      name: 'small',
      description: 'Small dataset with 50 rows for basic testing',
      columns,
      rows,
      pageSize: 20
    };
  }
  
  static createMediumDataset(): GridDataSet {
    const columns = this.createStandardColumns();
    const rows = this.generateRows(500, columns);
    
    return {
      name: 'medium',
      description: 'Medium dataset with 500 rows for standard testing',
      columns,
      rows,
      pageSize: 50
    };
  }
  
  static createLargeDataset(): GridDataSet {
    const columns = this.createStandardColumns();
    const rows = this.generateRows(5000, columns);
    
    return {
      name: 'large',
      description: 'Large dataset with 5000 rows for virtual scrolling testing',
      columns,
      rows,
      pageSize: 100
    };
  }
  
  static createPerformanceDataset(): GridDataSet {
    const columns = this.createExtendedColumns();
    const rows = this.generateRows(10000, columns);
    
    return {
      name: 'performance',
      description: 'Performance dataset with 10000 rows and many columns',
      columns,
      rows,
      pageSize: 100
    };
  }
  
  static createExtremeDataset100k(): GridDataSet {
    const columns = this.createStandardColumns();
    const rows = this.generateRows(100000, columns);
    
    return {
      name: 'extreme-100k',
      description: 'Extreme dataset with 100,000 rows for stress testing',
      columns,
      rows,
      pageSize: 100
    };
  }
  
  static createExtremeDataset250k(): GridDataSet {
    const columns = this.createStandardColumns();
    const rows = this.generateRows(250000, columns);
    
    return {
      name: 'extreme-250k',
      description: 'Extreme dataset with 250,000 rows for stress testing',
      columns,
      rows,
      pageSize: 100
    };
  }
  
  static createExtremeDataset500k(): GridDataSet {
    const columns = this.createStandardColumns();
    const rows = this.generateRows(500000, columns);
    
    return {
      name: 'extreme-500k',
      description: 'Extreme dataset with 500,000 rows for stress testing',
      columns,
      rows,
      pageSize: 100
    };
  }
  
  static createGroupingDataset(): GridDataSet {
    const columns = this.createGroupingColumns();
    const rows = this.generateGroupingRows(50000, columns);
    
    return {
      name: 'grouping',
      description: 'Dataset with 50,000 rows optimized for grouping testing',
      columns,
      rows,
      pageSize: 100
    };
  }
  
  static createMixedDataset(): GridDataSet {
    const columns = this.createMixedTypeColumns();
    const rows = this.generateMixedRows(1000, columns);
    
    return {
      name: 'mixed',
      description: 'Mixed dataset with various data types and null values',
      columns,
      rows,
      pageSize: 50
    };
  }
  
  static createEmptyDataset(): GridDataSet {
    const columns = this.createStandardColumns();
    
    return {
      name: 'empty',
      description: 'Empty dataset for edge case testing',
      columns,
      rows: [],
      pageSize: 20
    };
  }
  
  static createSingleRowDataset(): GridDataSet {
    const columns = this.createStandardColumns();
    const rows = this.generateRows(1, columns);
    
    return {
      name: 'single-row',
      description: 'Single row dataset for edge case testing',
      columns,
      rows,
      pageSize: 20
    };
  }
  
  private static createStandardColumns(): GridColumn[] {
    return [
      { field: 'id', header: 'ID', type: 'number', width: 80, sortable: true, filterable: true },
      { field: 'firstName', header: 'First Name', type: 'text', width: 120, sortable: true, filterable: true },
      { field: 'lastName', header: 'Last Name', type: 'text', width: 120, sortable: true, filterable: true },
      { field: 'email', header: 'Email', type: 'text', width: 200, sortable: true, filterable: true },
      { field: 'age', header: 'Age', type: 'number', width: 80, sortable: true, filterable: true },
      { field: 'salary', header: 'Salary', type: 'currency', width: 120, sortable: true, filterable: true },
      { field: 'joinDate', header: 'Join Date', type: 'date', width: 140, sortable: true, filterable: true },
      { field: 'isActive', header: 'Active', type: 'boolean', width: 80, sortable: true, filterable: true }
    ];
  }
  
  private static createExtendedColumns(): GridColumn[] {
    const standard = this.createStandardColumns();
    const extended = [
      { field: 'department', header: 'Department', type: 'text', width: 120, sortable: true, filterable: true },
      { field: 'position', header: 'Position', type: 'text', width: 150, sortable: true, filterable: true },
      { field: 'phone', header: 'Phone', type: 'text', width: 120, sortable: true, filterable: true },
      { field: 'address', header: 'Address', type: 'text', width: 200, sortable: true, filterable: true },
      { field: 'city', header: 'City', type: 'text', width: 120, sortable: true, filterable: true },
      { field: 'country', header: 'Country', type: 'text', width: 120, sortable: true, filterable: true },
      { field: 'bonus', header: 'Bonus', type: 'percentage', width: 100, sortable: true, filterable: true },
      { field: 'rating', header: 'Rating', type: 'number', width: 80, sortable: true, filterable: true }
    ];
    
    return [...standard, ...extended];
  }
  
  private static createMixedTypeColumns(): GridColumn[] {
    return [
      { field: 'id', header: 'ID', type: 'number', width: 80, sortable: true, filterable: true },
      { field: 'name', header: 'Name', type: 'text', width: 150, sortable: true, filterable: true },
      { field: 'score', header: 'Score', type: 'number', width: 100, sortable: true, filterable: true },
      { field: 'percentage', header: 'Percentage', type: 'percentage', width: 120, sortable: true, filterable: true },
      { field: 'currency', header: 'Currency', type: 'currency', width: 120, sortable: true, filterable: true },
      { field: 'date', header: 'Date', type: 'date', width: 140, sortable: true, filterable: true },
      { field: 'isEnabled', header: 'Enabled', type: 'boolean', width: 80, sortable: true, filterable: true },
      { field: 'nullable', header: 'Nullable', type: 'text', width: 100, sortable: true, filterable: true }
    ];
  }
  
  private static createGroupingColumns(): GridColumn[] {
    return [
      { field: 'id', header: 'ID', type: 'number', width: 80, sortable: true, filterable: true },
      { field: 'region', header: 'Region', type: 'text', width: 120, sortable: true, filterable: true },
      { field: 'country', header: 'Country', type: 'text', width: 120, sortable: true, filterable: true },
      { field: 'department', header: 'Department', type: 'text', width: 150, sortable: true, filterable: true },
      { field: 'team', header: 'Team', type: 'text', width: 120, sortable: true, filterable: true },
      { field: 'employeeName', header: 'Employee', type: 'text', width: 180, sortable: true, filterable: true },
      { field: 'position', header: 'Position', type: 'text', width: 150, sortable: true, filterable: true },
      { field: 'salary', header: 'Salary', type: 'currency', width: 120, sortable: true, filterable: true },
      { field: 'bonus', header: 'Bonus', type: 'currency', width: 100, sortable: true, filterable: true },
      { field: 'experience', header: 'Experience (Years)', type: 'number', width: 120, sortable: true, filterable: true },
      { field: 'rating', header: 'Performance Rating', type: 'number', width: 140, sortable: true, filterable: true }
    ];
  }
  
  private static generateRows(count: number, columns: GridColumn[]): GridRow[] {
    const rows: GridRow[] = [];
    
    for (let i = 0; i < count; i++) {
      const row: GridRow = { id: i + 1 };
      
      columns.forEach(column => {
        if (column.field === 'id') return;
        
        switch (column.type) {
          case 'text':
            row[column.field] = this.generateTextValue(column.field);
            break;
          case 'number':
            row[column.field] = this.generateNumberValue(column.field);
            break;
          case 'currency':
            row[column.field] = faker.number.float({ min: 30000, max: 150000, fractionDigits: 2 });
            break;
          case 'percentage':
            row[column.field] = faker.number.float({ min: 0, max: 1, fractionDigits: 3 });
            break;
          case 'date':
            row[column.field] = faker.date.past({ years: 10 }).toISOString();
            break;
          case 'boolean':
            row[column.field] = faker.datatype.boolean();
            break;
        }
      });
      
      rows.push(row);
    }
    
    return rows;
  }
  
  private static generateMixedRows(count: number, columns: GridColumn[]): GridRow[] {
    const rows = this.generateRows(count, columns);
    
    // Add some null/undefined values for testing
    rows.forEach((row, index) => {
      if (index % 10 === 0) {
        row.nullable = null;
      }
      if (index % 15 === 0) {
        row.name = undefined;
      }
      if (index % 20 === 0) {
        row.score = null;
      }
    });
    
    return rows;
  }
  
  private static generateGroupingRows(count: number, columns: GridColumn[]): GridRow[] {
    const rows: GridRow[] = [];
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'];
    const countries = {
      'North America': ['United States', 'Canada', 'Mexico'],
      'Europe': ['Germany', 'France', 'United Kingdom', 'Spain', 'Italy'],
      'Asia Pacific': ['Japan', 'Australia', 'Singapore', 'South Korea', 'India'],
      'Latin America': ['Brazil', 'Argentina', 'Chile', 'Colombia'],
      'Middle East & Africa': ['UAE', 'South Africa', 'Saudi Arabia', 'Egypt']
    };
    const departments = ['Engineering', 'Sales', 'Marketing', 'Support', 'Operations', 'Finance', 'HR'];
    const teams = {
      'Engineering': ['Frontend', 'Backend', 'DevOps', 'QA', 'Mobile'],
      'Sales': ['Enterprise', 'SMB', 'Inside Sales', 'Partner Channel'],
      'Marketing': ['Digital', 'Content', 'Events', 'Product Marketing'],
      'Support': ['L1 Support', 'L2 Support', 'Customer Success'],
      'Operations': ['IT', 'Facilities', 'Security', 'Procurement'],
      'Finance': ['Accounting', 'FP&A', 'Tax', 'Treasury'],
      'HR': ['Recruiting', 'Benefits', 'Learning', 'Compensation']
    };
    const positions = {
      'Engineering': ['Software Engineer', 'Senior Engineer', 'Staff Engineer', 'Engineering Manager', 'Director'],
      'Sales': ['Account Executive', 'Senior AE', 'Sales Manager', 'VP Sales'],
      'Marketing': ['Marketing Specialist', 'Marketing Manager', 'Senior Manager', 'Director'],
      'Support': ['Support Engineer', 'Senior Support Engineer', 'Support Manager'],
      'Operations': ['Operations Analyst', 'Operations Manager', 'Director'],
      'Finance': ['Financial Analyst', 'Senior Analyst', 'Finance Manager', 'Director'],
      'HR': ['HR Specialist', 'HR Manager', 'Senior HR Manager', 'VP HR']
    };

    for (let i = 0; i < count; i++) {
      const region = regions[Math.floor(Math.random() * regions.length)];
      const countryList = countries[region];
      const country = countryList[Math.floor(Math.random() * countryList.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const teamList = teams[department];
      const team = teamList[Math.floor(Math.random() * teamList.length)];
      const positionList = positions[department];
      const position = positionList[Math.floor(Math.random() * positionList.length)];
      
      const baseSalary = this.getBaseSalaryByDepartment(department, position);
      const experience = Math.floor(Math.random() * 20) + 1;
      const rating = Math.round((Math.random() * 4 + 1) * 10) / 10; // 1.0 to 5.0, one decimal

      const row: GridRow = {
        id: i + 1,
        region,
        country,
        department,
        team,
        employeeName: faker.person.fullName(),
        position,
        salary: Math.round(baseSalary * (0.8 + Math.random() * 0.4)), // ±20% variation
        bonus: Math.round(baseSalary * 0.1 * rating / 5 * (0.5 + Math.random())), // Bonus based on rating
        experience,
        rating
      };
      
      rows.push(row);
    }
    
    return rows;
  }
  
  private static getBaseSalaryByDepartment(department: string, position: string): number {
    const baseSalaries = {
      'Engineering': { 'Software Engineer': 85000, 'Senior Engineer': 120000, 'Staff Engineer': 160000, 'Engineering Manager': 150000, 'Director': 200000 },
      'Sales': { 'Account Executive': 70000, 'Senior AE': 90000, 'Sales Manager': 120000, 'VP Sales': 180000 },
      'Marketing': { 'Marketing Specialist': 55000, 'Marketing Manager': 80000, 'Senior Manager': 110000, 'Director': 140000 },
      'Support': { 'Support Engineer': 50000, 'Senior Support Engineer': 70000, 'Support Manager': 90000 },
      'Operations': { 'Operations Analyst': 55000, 'Operations Manager': 80000, 'Director': 130000 },
      'Finance': { 'Financial Analyst': 60000, 'Senior Analyst': 80000, 'Finance Manager': 100000, 'Director': 140000 },
      'HR': { 'HR Specialist': 50000, 'HR Manager': 75000, 'Senior HR Manager': 95000, 'VP HR': 160000 }
    };
    
    return baseSalaries[department]?.[position] || 60000;
  }
  
  private static generateTextValue(field: string): string {
    switch (field) {
      case 'firstName':
        return faker.person.firstName();
      case 'lastName':
        return faker.person.lastName();
      case 'email':
        return faker.internet.email();
      case 'department':
        return faker.commerce.department();
      case 'position':
        return faker.person.jobTitle();
      case 'phone':
        return faker.phone.number();
      case 'address':
        return faker.location.streetAddress();
      case 'city':
        return faker.location.city();
      case 'country':
        return faker.location.country();
      case 'name':
        return faker.person.fullName();
      case 'nullable':
        return faker.lorem.words(3);
      default:
        return faker.lorem.words(2);
    }
  }
  
  private static generateNumberValue(field: string): number {
    switch (field) {
      case 'age':
        return faker.number.int({ min: 18, max: 70 });
      case 'rating':
        return faker.number.float({ min: 1, max: 5, fractionDigits: 1 });
      case 'score':
        return faker.number.int({ min: 0, max: 100 });
      default:
        return faker.number.int({ min: 1, max: 1000 });
    }
  }
}