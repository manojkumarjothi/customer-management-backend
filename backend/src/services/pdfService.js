/**
 * PDF service - salary slip generation using PDFKit.
 */

const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const PAYROLL_PDF_DIR = path.join(process.cwd(), UPLOAD_DIR, 'payroll');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Generate salary slip PDF and save to uploads/payroll.
 * Returns relative path for storage in Payroll.pdfPath.
 */
function generateSalarySlipPDF(payroll, employee) {
  ensureDir(PAYROLL_PDF_DIR);
  const fileName = `salary-${payroll.employee}-${payroll.year}-${String(payroll.month).padStart(2, '0')}.pdf`;
  const filePath = path.join(PAYROLL_PDF_DIR, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Salary Slip', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`Employee: ${employee.name || 'N/A'} (${employee.employeeId || 'N/A'})`);
    doc.text(`Period: ${getMonthName(payroll.month)} ${payroll.year}`);
    doc.moveDown();

    doc.text(`Basic Salary: ${formatMoney(payroll.basicSalary)}`);
    if (payroll.allowances && typeof payroll.allowances === 'object') {
      Object.entries(payroll.allowances).forEach(([k, v]) => {
        doc.text(`${k}: ${formatMoney(v)}`);
      });
    }
    doc.text(`Gross: ${formatMoney(payroll.grossSalary || payroll.basicSalary)}`);
    doc.moveDown();

    if (payroll.deductions && typeof payroll.deductions === 'object') {
      Object.entries(payroll.deductions).forEach(([k, v]) => {
        doc.text(`${k}: -${formatMoney(v)}`);
      });
    }
    doc.moveDown();
    doc.fontSize(12).text(`Net Salary: ${formatMoney(payroll.netSalary)}`, { underline: true });
    doc.moveDown(2);
    doc.fontSize(8).text('This is a system-generated document.', { align: 'center' });

    doc.end();
    stream.on('finish', () => {
      const relativePath = path.join(UPLOAD_DIR, 'payroll', fileName).replace(/\\/g, '/');
      resolve(relativePath);
    });
    stream.on('error', reject);
    doc.on('error', reject);
  });
}

function formatMoney(amount) {
  const n = Number(amount);
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-IN', { style: 'currency', currency: process.env.CURRENCY || 'INR' });
}

function getMonthName(month) {
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return names[month - 1] || '';
}

/**
 * Get absolute path for a stored pdfPath (for download).
 */
function getAbsolutePdfPath(relativePath) {
  if (!relativePath) return null;
  return path.join(process.cwd(), relativePath);
}

module.exports = { generateSalarySlipPDF, getAbsolutePdfPath, ensureDir };
