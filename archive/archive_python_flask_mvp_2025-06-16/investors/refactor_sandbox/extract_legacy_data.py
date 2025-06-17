import sys
import os
# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from projects.spreadsheet_automation.auth import get_authenticated_service
from googleapiclient.errors import HttpError
import json

# --- Configuration ---
# The OLD investors spreadsheet
SPREADSHEET_ID = "1dMpnv4KoKcZfuhd8WoIS8hrG39hLW5Ldh38BTMSvkJk"
OUTPUT_FILE = "legacy_data_dump.txt"

# Sheets to ignore (like the temporary ones from the BMS)
SHEETS_TO_IGNORE = {"Monthly payment", "11118 Harvey Ave Old", "11118 Harvey Ave New"}

def get_all_sheet_names(service, spreadsheet_id):
    """Gets all sheet names from the spreadsheet, excluding ignored ones."""
    try:
        sheet_metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        sheets = sheet_metadata.get('sheets', [])
        return [
            sheet['properties']['title'] for sheet in sheets 
            if sheet['properties']['title'] not in SHEETS_TO_IGNORE
        ]
    except HttpError as err:
        print(f"An error occurred while fetching sheet properties: {err}")
        return None

def get_sheet_data(service, spreadsheet_id, sheet_name):
    """Gets both formulas and formatted values from a sheet."""
    try:
        # Batch get request for both formulas and values
        request = service.spreadsheets().values().batchGet(
            spreadsheetId=spreadsheet_id,
            ranges=[sheet_name],
            valueRenderOption='FORMULA',
            majorDimension='ROWS'
        )
        response = request.execute()
        formulas = response['valueRanges'][0].get('values', [])

        request = service.spreadsheets().values().batchGet(
            spreadsheetId=spreadsheet_id,
            ranges=[sheet_name],
            valueRenderOption='FORMATTED_VALUE',
            majorDimension='ROWS'
        )
        response = request.execute()
        values = response['valueRanges'][0].get('values', [])

        return formulas, values

    except HttpError as err:
        print(f"An error occurred while getting data from {sheet_name}: {err}")
        return [], []

def main():
    """Reads all data from all relevant sheets and dumps it to a text file."""
    service = get_authenticated_service()
    if not service:
        return

    sheet_names = get_all_sheet_names(service, SPREADSHEET_ID)
    if not sheet_names:
        print("Could not retrieve sheet names. Exiting.")
        return

    print(f"Found {len(sheet_names)} sheets to process: {', '.join(sheet_names)}")

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        for sheet_name in sheet_names:
            f.write("=" * 80 + "\n")
            f.write(f"SHEET NAME: {sheet_name}\n")
            f.write("=" * 80 + "\n\n")

            formulas, values = get_sheet_data(service, SPREADSHEET_ID, sheet_name)

            # Determine the max number of rows to iterate through
            max_rows = max(len(formulas), len(values))
            
            for i in range(max_rows):
                f.write(f"--- Row {i+1} ---\n")
                
                # Get the row from each list, or an empty list if index is out of bounds
                formula_row = formulas[i] if i < len(formulas) else []
                value_row = values[i] if i < len(values) else []

                max_cols = max(len(formula_row), len(value_row))

                for j in range(max_cols):
                    formula = formula_row[j] if j < len(formula_row) else ""
                    value = value_row[j] if j < len(value_row) else ""

                    # Only write if there's content
                    if formula or value:
                        # Convert both to string to be safe before formatting
                        f.write(f"  Col {chr(ord('A')+j)} | Formula: {str(formula).ljust(40)} | Value: {str(value)}\n")
                f.write("\n")
            
            print(f"Successfully processed and wrote data for: {sheet_name}")

    print(f"\nData dump complete. All information saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main() 