#!/usr/bin/env python3
"""
Download and parse Israeli supermarket data
This script uses the il_supermarket_parsers package to fetch product data
from Israeli supermarkets and convert it to JSON for import into MongoDB.
"""

import os
import sys
import json
from pathlib import Path

try:
    from il_supermarket_scraper import ScraperRunner
    from il_supermarket_parsers import ConvertingTask
except ImportError as e:
    print("ERROR: Required packages not installed")
    print(f"Details: {e}")
    print("Please run: pip3 install il-supermarket-scraper pandas lxml")
    print("And: cd /tmp/israeli-supermarket-parsers && pip3 install -e .")
    sys.exit(1)

def main():
    # Setup directories
    base_dir = Path(__file__).parent
    dumps_dir = base_dir / "israeli_dumps"
    output_dir = base_dir / "israeli_outputs"

    dumps_dir.mkdir(exist_ok=True)
    output_dir.mkdir(exist_ok=True)

    print("=" * 60)
    print("Downloading Israeli Supermarket Data")
    print("=" * 60)
    print(f"Dumps directory: {dumps_dir}")
    print(f"Output directory: {output_dir}")
    print()

    # Step 1: Download data from supermarkets
    print("Step 1: Downloading product files from Israeli supermarkets...")
    print("This may take 5-10 minutes depending on connection speed.")
    print()

    try:
        # Use the scraper to download files
        runner = ScraperRunner(
            enabled_scrapers=['shufersal'],  # Start with just Shufersal for testing
            dump_folder=str(dumps_dir),
            files_limit=5,  # Limit files for testing
        )
        runner.run()
        print("✅ Download complete!")
    except Exception as e:
        print(f"❌ Download failed: {e}")
        print("This is normal if supermarket websites are slow or blocking.")
        print("Continuing with any downloaded files...")

    print()

    # Step 2: Parse downloaded XML files
    print("Step 2: Parsing XML files to extract product data...")
    print()

    try:
        ConvertingTask(
            enabled_parsers=None,  # Parse all available
            files_types=['Stores', 'Prices', 'PromoFull'],  # Product-related files
            data_folder=str(dumps_dir),
            multiprocessing=None,
            output_folder=str(output_dir),
        ).start()
        print("✅ Parsing complete!")
    except Exception as e:
        print(f"❌ Parsing failed: {e}")
        sys.exit(1)

    print()

    # Step 3: Convert to JSON format for MongoDB import
    print("Step 3: Converting to JSON for MongoDB import...")
    print()

    # Look for generated CSV files
    csv_files = list(output_dir.glob("*.csv"))

    if not csv_files:
        print("❌ No CSV files found in output directory")
        print("This might happen if download failed or files are still processing.")
        sys.exit(1)

    print(f"Found {len(csv_files)} CSV files:")
    for csv_file in csv_files:
        print(f"  - {csv_file.name}")

    # For now, just report success
    # The actual CSV to JSON conversion will be done in Node.js
    print()
    print("=" * 60)
    print("✅ Israeli Data Download Complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Review the CSV files in:", output_dir)
    print("2. Run the Node.js import script to load into MongoDB")
    print(f"   node packages/backend/scripts/import-israeli-products.js")
    print()

if __name__ == "__main__":
    main()
