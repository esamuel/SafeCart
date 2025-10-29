#!/usr/bin/env node
/**
 * Import Israeli Supermarket Products to MongoDB
 *
 * This script imports product data from Israeli supermarkets into MongoDB.
 * The data comes from the il_supermarket_parsers Python package.
 *
 * Usage:
 *   node import-israeli-products.js [--test] [--limit=1000]
 *
 * Options:
 *   --test    Run in test mode (only import first 100 products)
 *   --limit   Limit number of products to import
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');

// Try to load .env from multiple locations
const dotenvPath = path.join(__dirname, '../.env');
if (fs.existsSync(dotenvPath)) {
  require('dotenv').config({ path: dotenvPath });
}

const Product = require('../src/models/Product');

// Parse command line arguments
const args = process.argv.slice(2);
const isTestMode = args.includes('--test');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const importLimit = limitArg ? parseInt(limitArg.split('=')[1]) : (isTestMode ? 100 : Infinity);

console.log('='.repeat(60));
console.log('Israeli Product Import to MongoDB');
console.log('='.repeat(60));
console.log(`Mode: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);
console.log(`Limit: ${importLimit === Infinity ? 'NONE' : importLimit}`);
console.log('='.repeat(60));
console.log();

/**
 * Map CSV row from Israeli supermarket data to SafeCart Product schema
 */
function mapIsraeliProduct(row, chain) {
  // Extract barcode (try different field names)
  const barcode = row.ItemCode || row.barcode || row.item_code || '';

  if (!barcode || barcode.length < 8) {
    return null; // Skip invalid barcodes
  }

  // Extract product name (Hebrew)
  const name = row.ItemName || row.item_name || row.name || 'Unknown Product';

  // Extract manufacturer/brand
  const brand = row.ManufacturerName || row.manufacturer_name || row.brand || 'Unknown';

  // Extract price info
  const price = parseFloat(row.ItemPrice || row.price || row.unit_price || 0);

  // Extract unit info
  const quantity = parseFloat(row.Quantity || row.quantity || 1);
  const unitOfMeasure = row.UnitOfMeasure || row.unit_of_measure || 'unit';

  return {
    name: name.trim(),
    upc: barcode,
    barcode: barcode,
    brand: brand.trim(),
    category: 'Israeli Supermarket Product',

    // Multi-region support
    regions: [{
      country: 'IL',
      available: true,
      barcode: barcode,
      localName: name.trim(),
      localBrand: brand.trim(),
      stores: [chain],
      source: 'israeli_supermarket',
      lastUpdated: new Date(),
      pricing: {
        price: price,
        quantity: quantity,
        unitOfMeasure: unitOfMeasure
      }
    }],

    source: 'israeli_supermarket',
    userSubmitted: false,
    verified: true,

    // Nutritional data - marked as incomplete
    // Users will be prompted to add this data
    nutrition: {
      servingSize: '100g',
      netCarbs: null,
      sugar: null,
      fiber: null,
      protein: null,
      fat: null,
      calories: null,
      complete: false  // Flag to show UI prompt
    },

    diabetesInfo: {
      glycemicIndex: null,
      glycemicLoad: null,
      carbQuality: 'unknown'
    },

    allergens: {
      contains: [],
      mayContain: []
    }
  };
}

/**
 * Import products from a CSV file
 */
async function importFromCSV(filePath, chain) {
  return new Promise((resolve, reject) => {
    const products = [];
    let rowCount = 0;
    let skippedCount = 0;

    console.log(`\nProcessing: ${path.basename(filePath)}`);
    console.log(`Chain: ${chain}`);

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        rowCount++;

        if (rowCount > importLimit) {
          return; // Skip rows beyond limit
        }

        const product = mapIsraeliProduct(row, chain);

        if (product) {
          products.push(product);
        } else {
          skippedCount++;
        }

        // Progress indicator
        if (rowCount % 1000 === 0) {
          process.stdout.write(`\r  Processed ${rowCount} rows, mapped ${products.length} products...`);
        }
      })
      .on('end', () => {
        console.log(`\r  ✅ Processed ${rowCount} rows, mapped ${products.length} products`);
        if (skippedCount > 0) {
          console.log(`  ⚠️  Skipped ${skippedCount} rows (invalid barcodes)`);
        }
        resolve(products);
      })
      .on('error', reject);
  });
}

/**
 * Bulk upsert products to MongoDB
 */
async function bulkUpsertProducts(products) {
  console.log(`\nInserting ${products.length} products to MongoDB...`);

  let insertedCount = 0;
  let updatedCount = 0;
  let errorCount = 0;

  // Process in batches of 100 for better performance
  const batchSize = 100;

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);

    // Use bulkWrite for efficiency
    const operations = batch.map(product => ({
      updateOne: {
        filter: { upc: product.upc },
        update: { $set: product },
        upsert: true
      }
    }));

    try {
      const result = await Product.bulkWrite(operations);
      insertedCount += result.upsertedCount || 0;
      updatedCount += result.modifiedCount || 0;

      // Progress indicator
      process.stdout.write(`\r  Progress: ${Math.min(i + batchSize, products.length)}/${products.length}`);
    } catch (error) {
      console.error(`\n  ❌ Batch error at index ${i}:`, error.message);
      errorCount += batch.length;
    }
  }

  console.log(); // New line after progress
  console.log(`\n  ✅ Inserted: ${insertedCount}`);
  console.log(`  ✅ Updated: ${updatedCount}`);
  if (errorCount > 0) {
    console.log(`  ❌ Errors: ${errorCount}`);
  }

  return { insertedCount, updatedCount, errorCount };
}

/**
 * Main import function
 */
async function main() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/safecart';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Look for CSV files
    const outputDir = path.join(__dirname, 'israeli_outputs');

    if (!fs.existsSync(outputDir)) {
      console.log(`❌ Output directory not found: ${outputDir}`);
      console.log('\nPlease run the download script first:');
      console.log('  python3 packages/backend/scripts/download-israeli-data.py');
      process.exit(1);
    }

    const csvFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.csv'));

    if (csvFiles.length === 0) {
      console.log(`❌ No CSV files found in: ${outputDir}`);
      console.log('\nPlease run the download script first:');
      console.log('  python3 packages/backend/scripts/download-israeli-data.py');
      process.exit(1);
    }

    console.log(`Found ${csvFiles.length} CSV file(s):\n`);
    csvFiles.forEach(f => console.log(`  - ${f}`));

    // Import from each CSV file
    let totalProducts = [];

    for (const csvFile of csvFiles) {
      const filePath = path.join(outputDir, csvFile);

      // Try to determine chain from filename
      let chain = 'Unknown';
      if (csvFile.toLowerCase().includes('shufersal')) chain = 'Shufersal';
      else if (csvFile.toLowerCase().includes('rami')) chain = 'Rami Levy';
      else if (csvFile.toLowerCase().includes('victory')) chain = 'Victory';

      const products = await importFromCSV(filePath, chain);
      totalProducts = totalProducts.concat(products);
    }

    // Remove duplicates (same barcode from different chains)
    const uniqueProducts = [];
    const seenBarcodes = new Set();

    for (const product of totalProducts) {
      if (!seenBarcodes.has(product.upc)) {
        uniqueProducts.push(product);
        seenBarcodes.add(product.upc);
      }
    }

    console.log(`\nTotal unique products: ${uniqueProducts.length}`);
    console.log(`Duplicates removed: ${totalProducts.length - uniqueProducts.length}`);

    // Bulk insert to MongoDB
    const stats = await bulkUpsertProducts(uniqueProducts);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('Import Complete!');
    console.log('='.repeat(60));
    console.log(`Total products processed: ${uniqueProducts.length}`);
    console.log(`Inserted: ${stats.insertedCount}`);
    console.log(`Updated: ${stats.updatedCount}`);
    console.log(`Errors: ${stats.errorCount}`);
    console.log('='.repeat(60));

    // Check total count in database
    const totalInDB = await Product.countDocuments({ 'regions.country': 'IL' });
    console.log(`\nTotal Israeli products in database: ${totalInDB}`);

    // Show sample products
    const samples = await Product.find({ 'regions.country': 'IL' }).limit(5);
    console.log('\nSample products:');
    samples.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} (${p.upc})`);
      console.log(`   Brand: ${p.brand}`);
      console.log(`   Region: ${p.regions[0].country}`);
      console.log(`   Nutrition complete: ${p.nutrition?.complete || false}`);
    });

    console.log('\n✅ All done! Israeli products are now in the database.');
    console.log('\nNext steps:');
    console.log('1. Test the scanner with Israeli barcodes');
    console.log('2. Build UI for users to add missing nutrition data');
    console.log('3. Implement community contribution features\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run import
main();
