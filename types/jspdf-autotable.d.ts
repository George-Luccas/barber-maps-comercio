declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface AutoTableOptions {
    startY?: number;
    head?: any[][];
    body?: any[][];
    headStyles?: any;
    styles?: any;
    alternateRowStyles?: any;
    didDrawPage?: (data: any) => void;
    margin?: any;
    theme?: 'striped' | 'grid' | 'plain';
  }

  export default function autoTable(doc: jsPDF, options: AutoTableOptions): void;
}
