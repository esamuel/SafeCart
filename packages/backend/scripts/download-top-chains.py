#!/usr/bin/env python3
"""
Download Israeli products from top supermarket chains
Focuses on Shufersal and Rami Levy for faster import with good coverage
"""

import os
import sys
from pathlib import Path

try:
    from il_supermarket_scarper import ScarpingTask
    from il_supermarket_parsers import ConvertingTask
except ImportError as e:
    print("ERROR: Required packages not installed")
    print(f"Details: {e}")
    sys.exit(1)

def main():
    # Setup directories
    script_dir = Path(__file__).parent
    dumps_dir = script_dir / "israeli_dumps"
    output_dir = script_dir / "israeli_outputs"

    dumps_dir.mkdir(exist_ok=True)
    output_dir.mkdir(exist_ok=True)

    print("=" * 70)
    print("Downloading from Top Israeli Supermarket Chains")
    print("=" * 70)
    print("Chains: Shufersal (40% market) + Rami Levy (major chain)")
    print(f"Dumps directory: {dumps_dir}")
    print(f"Output directory: {output_dir}")
    print("\nThis will take ~10-15 minutes...")
    print("=" * 70)
    print()

    # Step 1: Download from top chains only
    print("Step 1: Downloading product files...")
    print()

    try:
        ScarpingTask(
            enabled_scrapers=['shufersal', 'rami_levy'],  # Top 2 chains
            dump_folder_name=str(dumps_dir),
            limit=10,  # Download more files for better coverage
            multiprocessing=None,
            lookup_in_db=False,
        ).start()
        print("\n✅ Download complete!")
    except Exception as e:
        print(f"\n⚠️  Download encountered issues: {e}")
        print("Continuing with any successfully downloaded files...")

    print()

    # Step 2: Parse downloaded files
    print("Step 2: Parsing XML files to extract product data...")
    print()

    try:
        ConvertingTask(
            enabled_parsers=None,
            files_types=None,  # Parse all file types
            data_folder=str(dumps_dir),
            multiprocessing=None,
            output_folder=str(output_dir),
        ).start()
        print("\n✅ Parsing complete!")
    except Exception as e:
        print(f"\n❌ Parsing failed: {e}")
        print("Please check the dumps directory for downloaded files.")
        sys.exit(1)

    print()

    # Step 3: Check results
    csv_files = list(output_dir.glob("*.csv"))

    print("=" * 70)
    print("✅ Download and Parse Complete!")
    print("=" * 70)
    print(f"\nGenerated {len(csv_files)} CSV file(s):")
    for csv_file in csv_files:
        size_mb = csv_file.stat().st_size / (1024 * 1024)
        print(f"  - {csv_file.name} ({size_mb:.1f} MB)")

    print("\n" + "=" * 70)
    print("Next Step: Import to MongoDB")
    print("=" * 70)
    print("\nRun:")
    print("  cd packages/backend")
    print('  MONGODB_URI="your-uri" node scripts/import-israeli-products.js')
    print()

if __name__ == "__main__":
    main()
