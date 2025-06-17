import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from projects.spreadsheet_automation.auth import get_authenticated_service
from googleapiclient.errors import HttpError

# --- Configuration ---
SPREADSHEET_ID = "12C1PH0zx7YJaaOnU8I2HulLCBgMSZIF5t9oru7rsQ44" # Investors System v3.0 (Clean)

def get_sheet_info(service, spreadsheet_id):
    """Gets a map of sheet names to sheet IDs."""
    try:
        sheet_metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        sheets = sheet_metadata.get('sheets', [])
        return {s['properties']['title']: s['properties']['sheetId'] for s in sheets}
    except HttpError as error:
        print(f"An error occurred getting sheet info: {error}")
        return {}

def main():
    """Converts DB ranges to official tables and adds data validation."""
    service = get_authenticated_service('sheets', 'v4')
    if not service:
        return

    sheet_info = get_sheet_info(service, SPREADSHEET_ID)
    if not sheet_info:
        return

    print("Applying table formatting and data validation...")

    requests = []

    # --- Convert to Tables (Add Filter Views) ---
    # We apply a filter view to the entire sheet range for simplicity.
    for sheet_name, sheet_id in sheet_info.items():
        if sheet_name.startswith("[DB]"):
            requests.append({
                "addFilterView": {
                    "filter": {
                        "title": f"Data_Table_{sheet_name.replace(' ', '_')}",
                        "range": {"sheetId": sheet_id} # Applies to the whole sheet
                    }
                }
            })

    # --- Add Data Validation Dropdowns ---
    # In [DB] Investments -> Investor_ID
    sheet_id = sheet_info.get('[DB] Investments')
    if sheet_id:
        requests.append({"setDataValidation": {"range": {"sheetId": sheet_id, "startRowIndex": 1, "startColumnIndex": 1, "endColumnIndex": 2}, "rule": {"condition": {"type": "ONE_OF_RANGE", "values": [{"userEnteredValue": "='[DB] Investors'!A2:A"}]}, "strict": True}}})
        requests.append({"setDataValidation": {"range": {"sheetId": sheet_id, "startRowIndex": 1, "startColumnIndex": 2, "endColumnIndex": 3}, "rule": {"condition": {"type": "ONE_OF_RANGE", "values": [{"userEnteredValue": "='[DB] Investment_Groups'!A2:A"}]}, "strict": True}}})

    # In [DB] Payments_Log -> Investment_ID
    sheet_id = sheet_info.get('[DB] Payments_Log')
    if sheet_id:
        requests.append({"setDataValidation": {"range": {"sheetId": sheet_id, "startRowIndex": 1, "startColumnIndex": 1, "endColumnIndex": 2}, "rule": {"condition": {"type": "ONE_OF_RANGE", "values": [{"userEnteredValue": "='[DB] Investments'!A2:A"}]}, "strict": True}}})

    if not requests:
        print("No requests generated. Check sheet names.")
        return

    try:
        service.spreadsheets().batchUpdate(spreadsheetId=SPREADSHEET_ID, body={'requests': requests}).execute()
        print("Successfully formatted DB sheets as tables and added validation rules!")
    except HttpError as error:
        print(f"An error occurred: {error}")

if __name__ == "__main__":
    main() 