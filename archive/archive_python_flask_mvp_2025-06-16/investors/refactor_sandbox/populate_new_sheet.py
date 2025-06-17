import sys
import os
import pandas as pd
# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from projects.spreadsheet_automation.auth import get_authenticated_service
from googleapiclient.errors import HttpError

# The NEW spreadsheet ID
SPREADSHEET_ID = "15mmVv_qQqaT4W_X-A6WlnxU5o0CYZ3Jd64ifGKE6_xI"

SEED_FILES = {
    "[DB] Investment_Groups": "seed_investment_groups.csv",
    "[DB] Investors": "seed_investors.csv",
    "[DB] Investments": "seed_investments.csv",
    "[DB] Payments_Log": "seed_payments_log.csv"
}

LOGIC_SHEETS_FORMULAS = {
    "[LOGIC] Investor_Account_Status": {
        "A2": "=UNIQUE(QUERY('[DB] Investments'!B:B, \"SELECT B WHERE B IS NOT NULL\"))",
        "B2": "=IF(A2<>\"\", SUMIF('[DB] Investments'!B:B, A2, '[DB] Investments'!D:D), \"\")",
        "C2": {
            "formula": "=IF(A2<>\"\", SUMIF('[DB] Payments_Log'!B:B, INDIRECT(\"A\" & ROW()) & \"*\", '[DB] Payments_Log'!D:D), \"\")",
            "note": "This formula assumes Investment_IDs in the payment log are prefixed with the Investor_ID. E.g., for investor 'inv_hila', payment Investment_IDs would be 'inv_hila_payment_01'."
        }
    }
}

def write_data_from_csv(service, sheet_name, csv_file):
    """Reads a CSV and writes its content to the specified sheet."""
    print(f"Populating '{sheet_name}' from '{csv_file}'...")
    try:
        df = pd.read_csv(csv_file)
        # Replace NaN values with empty strings, which Google API handles correctly
        df.fillna('', inplace=True)
        # Convert dataframe to a list of lists for the API
        data_to_write = [df.columns.values.tolist()] + df.values.tolist()
        
        body = { 'values': data_to_write }
        service.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=f"'{sheet_name}'!A1",
            valueInputOption="USER_ENTERED",
            body=body
        ).execute()
        print("...Success.")
    except Exception as e:
        print(f"...Error writing data to {sheet_name}: {e}")

def write_formulas(service, formulas_config):
    """Writes formulas to the logic sheets."""
    print("Writing formulas to [LOGIC] sheets...")
    requests = []
    for sheet_name, formulas in formulas_config.items():
        for cell, formula_data in formulas.items():
            
            formula_string = ""
            note_string = ""

            if isinstance(formula_data, str):
                formula_string = formula_data
            elif isinstance(formula_data, dict):
                formula_string = formula_data.get("formula", "")
                note_string = formula_data.get("note", "")

            # Find sheetId by title
            # This is inefficient but necessary if we don't know the IDs
            # In a real-world, larger app, we'd cache this.
            sheet_metadata = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
            sheet_id = None
            for s in sheet_metadata['sheets']:
                if s['properties']['title'] == sheet_name:
                    sheet_id = s['properties']['sheetId']
                    break
            
            if sheet_id is None:
                print(f"Could not find sheetId for '{sheet_name}'. Skipping formula for {cell}.")
                continue

            # A1 notation to grid coordinates
            col_str = ''.join(filter(str.isalpha, cell))
            row_idx = int(''.join(filter(str.isdigit, cell))) - 1
            col_idx = ord(col_str.upper()) - ord('A')
            
            request = {
                "updateCells": {
                    "rows": [{ "values": [{ "userEnteredValue": { "formulaValue": formula_string } }] }],
                    "start": { "sheetId": sheet_id, "rowIndex": row_idx, "columnIndex": col_idx },
                    "fields": "userEnteredValue"
                }
            }
            if note_string:
                request['updateCells']['rows'][0]['values'][0]['note'] = note_string

            requests.append(request)

    body = { 'requests': requests }
    try:
        service.spreadsheets().batchUpdate(spreadsheetId=SPREADSHEET_ID, body=body).execute()
        print("...Success.")
    except HttpError as error:
        print(f"...An error occurred during formula batch update: {error}")

def main():
    """Main function to populate the new spreadsheet."""
    service = get_authenticated_service('sheets', 'v4')
    if not service:
        return

    # 1. Populate DB sheets from seed files
    for sheet, csv_file in SEED_FILES.items():
        write_data_from_csv(service, sheet, os.path.join(os.path.dirname(__file__), csv_file))

    # 2. Write logic formulas
    write_formulas(service, LOGIC_SHEETS_FORMULAS)

    print("\n--- Population and Logic Implementation Complete! ---")
    print(f"Check your spreadsheet: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}")


if __name__ == "__main__":
    main() 