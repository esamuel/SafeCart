#!/usr/bin/env node
/**
 * Create Sample Israeli Product Data for Testing
 *
 * This creates a small set of Israeli products to test the import process
 * before running the full download from supermarkets.
 */

const fs = require('fs');
const path = require('path');

// Sample Israeli products with real barcodes
const sampleProducts = [
  {
    ItemCode: '7290000068',
    ItemName: 'במבה אסם - חטיף בוטנים',  // Bamba - Osem peanut snack
    ManufacturerName: 'אסם',  // Osem
    ItemPrice: '4.90',
    Quantity: '1',
    UnitOfMeasure: 'unit'
  },
  {
    ItemCode: '7290000066097',
    ItemName: 'שוקולד עלית - חלב',  // Elite milk chocolate
    ManufacturerName: 'שטראוס',  // Strauss
    ItemPrice: '5.50',
    Quantity: '1',
    UnitOfMeasure: 'unit'
  },
  {
    ItemCode: '7290000171504',
    ItemName: 'חלב תנובה 3%',  // Tnuva milk 3%
    ManufacturerName: 'תנובה',  // Tnuva
    ItemPrice: '6.20',
    Quantity: '1',
    UnitOfMeasure: 'liter'
  },
  {
    ItemCode: '7290000173003',
    ItemName: 'קוטג\' תנובה 5%',  // Tnuva cottage cheese 5%
    ManufacturerName: 'תנובה',  // Tnuva
    ItemPrice: '5.90',
    Quantity: '250',
    UnitOfMeasure: 'gram'
  },
  {
    ItemCode: '7290005772139',
    ItemName: 'ביסקוויטים תלמה - עוגיות תה',  // Telma tea biscuits
    ManufacturerName: 'אסם',  // Osem
    ItemPrice: '7.90',
    Quantity: '1',
    UnitOfMeasure: 'unit'
  },
  {
    ItemCode: '7290000062013',
    ItemName: 'חומוס אחלה',  // Achla hummus
    ManufacturerName: 'אחלה',  // Achla
    ItemPrice: '8.90',
    Quantity: '400',
    UnitOfMeasure: 'gram'
  },
  {
    ItemCode: '7290111333996',
    ItemName: 'טחינה מעולה',  // Premium tahini
    ManufacturerName: 'הר ברכה',  // Har Bracha
    ItemPrice: '12.90',
    Quantity: '500',
    UnitOfMeasure: 'gram'
  },
  {
    ItemCode: '7290006533913',
    ItemName: 'פיתה מלאה',  // Whole wheat pita
    ManufacturerName: 'אנג\' ל',  // Angel
    ItemPrice: '9.90',
    Quantity: '6',
    UnitOfMeasure: 'unit'
  },
  {
    ItemCode: '7290000292809',
    ItemName: 'שמן זית',  // Olive oil
    ManufacturerName: 'רמדיה',  // Remedia
    ItemPrice: '24.90',
    Quantity: '500',
    UnitOfMeasure: 'ml'
  },
  {
    ItemCode: '7290000066722',
    ItemName: 'שוקולד פרה - חלב ואגוזים',  // Para chocolate with nuts
    ManufacturerName: 'שטראוס',  // Strauss
    ItemPrice: '6.90',
    Quantity: '1',
    UnitOfMeasure: 'unit'
  }
];

// Create CSV format
const headers = 'ItemCode,ItemName,ManufacturerName,ItemPrice,Quantity,UnitOfMeasure\n';
const rows = sampleProducts.map(p =>
  `${p.ItemCode},"${p.ItemName}","${p.ManufacturerName}",${p.ItemPrice},${p.Quantity},${p.UnitOfMeasure}`
).join('\n');

const csvContent = headers + rows;

// Ensure output directory exists
const outputDir = path.join(__dirname, 'israeli_outputs');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write CSV file
const outputFile = path.join(outputDir, 'sample_israeli_products_shufersal.csv');
fs.writeFileSync(outputFile, csvContent, 'utf8');

console.log('✅ Sample Israeli product data created!');
console.log(`File: ${outputFile}`);
console.log(`Products: ${sampleProducts.length}`);
console.log('\nSample products:');
sampleProducts.slice(0, 3).forEach((p, i) => {
  console.log(`${i + 1}. ${p.ItemName} (${p.ItemCode})`);
});

console.log('\nNext step: Run the import script');
console.log('  node packages/backend/scripts/import-israeli-products.js --test');
