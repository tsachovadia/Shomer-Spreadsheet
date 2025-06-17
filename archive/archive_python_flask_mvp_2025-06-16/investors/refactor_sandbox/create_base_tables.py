import sys
import os
import pandas as pd
# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from projects.spreadsheet_automation.auth import get_authenticated_service
from googleapiclient.errors import HttpError

# --- Configuration ---
NEW_SPREADSHEET_TITLE = "Investors System v3.0 (Clean)"
SEED_FILES_TO_SHEETS = {
    "[DB] Investment_Groups": "seed_investment_groups.csv",
    "[DB] Investors": "seed_investors.csv",
    "[DB] Investments": "seed_investments.csv",
    "[DB] Payments_Log": "seed_payments_log.csv"
}

def create_new_spreadsheet(service, title):
    """Creates a new spreadsheet and returns its ID."""
    print(f"Creating new spreadsheet: '{title}'...")
    spreadsheet = {'properties': {'title': title}}
    try:
        sheet = service.spreadsheets().create(body=spreadsheet, fields='spreadsheetId').execute()
        spreadsheet_id = sheet.get('spreadsheetId')
        print(f"Success! New spreadsheet created with ID: {spreadsheet_id}")
        return spreadsheet_id
    except HttpError as error:
        print(f"An error occurred: {error}")
        return None

def write_data_from_csv(service, spreadsheet_id, sheet_name, csv_file_path):
    """Reads a CSV and writes its content to the specified sheet."""
    print(f"Populating '{sheet_name}' from '{csv_file_path}'...")
    try:
        df = pd.read_csv(csv_file_path)
        df.fillna('', inplace=True)
        data_to_write = [df.columns.values.tolist()] + df.values.tolist()
        
        body = {'values': data_to_write}
        service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id,
            range=f"'{sheet_name}'!A1",
            valueInputOption="USER_ENTERED",
            body=body
        ).execute()
        print("...Success.")
    except Exception as e:
        print(f"...Error writing data to {sheet_name}: {e}")

def main():
    """Main function to create and populate the new base spreadsheet."""
    service = get_authenticated_service('sheets', 'v4')
    if not service:
        return

    # 1. Create a new blank spreadsheet
    spreadsheet_id = create_new_spreadsheet(service, NEW_SPREADSHEET_TITLE)
    if not spreadsheet_id:
        return

    # 2. Add our new sheets FIRST
    add_requests = []
    sheet_ids_map = {}
    for i, sheet_name in enumerate(SEED_FILES_TO_SHEETS.keys()):
        sheet_id = i + 1 # Start with non-zero sheet IDs
        sheet_ids_map[sheet_name] = sheet_id
        add_requests.append({"addSheet": {"properties": {"sheetId": sheet_id, "title": sheet_name}}})

    try:
        service.spreadsheets().batchUpdate(spreadsheetId=spreadsheet_id, body={'requests': add_requests}).execute()
        print("Base sheets created successfully.")

        # 3. NOW, delete the default "Sheet1"
        # We assume the default sheet has ID 0. A more robust way would be to find it.
        delete_request = {"deleteSheet": {"sheetId": 0}}
        service.spreadsheets().batchUpdate(spreadsheetId=spreadsheet_id, body={'requests': [delete_request]}).execute()
        print("Default sheet removed.")

        # 4. Populate the newly created sheets
        for sheet_name, csv_file in SEED_FILES_TO_SHEETS.items():
            csv_path = os.path.join(os.path.dirname(__file__), csv_file)
            write_data_from_csv(service, spreadsheet_id, sheet_name, csv_path)

        print(f"\n--- Process Complete ---")
        print(f"Link to your new v3.0 spreadsheet: https://docs.google.com/spreadsheets/d/{spreadsheet_id}")

    except HttpError as error:
        print(f"An error occurred during sheet creation/population: {error}")

if __name__ == "__main__":
    main() 