import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from projects.spreadsheet_automation.auth import get_authenticated_service
from googleapiclient.errors import HttpError

# --- Configuration ---
# The NEW spreadsheet to modify
SPREADSHEET_ID = "12C1PH0zx7YJaaOnU8I2HulLCBgMSZIF5t9oru7rsQ44"
# The ORIGINAL BMS spreadsheet to import data from
BMS_SPREADSHEET_ID = "1cDnLQ6I4654R7rhswbldW8EwmU5U88qwXQhFpRGbowg"
ALLOCATION_SHEET_NAME = "[DB] Asset_Allocation"

def main():
    """Adds and sets up the Asset Allocation sheet."""
    service = get_authenticated_service('sheets', 'v4')
    if not service:
        return

    print(f"Setting up '{ALLOCATION_SHEET_NAME}' sheet...")

    # --- 1. Add the new sheet ---
    add_sheet_request = {"addSheet": {"properties": {"title": ALLOCATION_SHEET_NAME}}}
    try:
        response = service.spreadsheets().batchUpdate(
            spreadsheetId=SPREADSHEET_ID,
            body={'requests': [add_sheet_request]}
        ).execute()
        sheet_id = response['replies'][0]['addSheet']['properties']['sheetId']
        print(f"Sheet '{ALLOCATION_SHEET_NAME}' created with ID: {sheet_id}")
    except HttpError as error:
        # It might fail if the sheet already exists. We can try to get its ID instead.
        print(f"Could not create sheet (it might already exist). Error: {error}")
        # In a real app, we'd get the ID here. For this script, we'll assume it needs creating.
        return

    # --- 2. Define the requests for formulas, headers, and validation ---
    requests = [
        # Add Headers
        {"updateCells": {"rows": [{"values": [
            {"userEnteredValue": {"stringValue": "Allocation_ID"}, "userEnteredFormat": {"textFormat": {"bold": True}}},
            {"userEnteredValue": {"stringValue": "Group_ID"}, "userEnteredFormat": {"textFormat": {"bold": True}}},
            {"userEnteredValue": {"stringValue": "Property_ID"}, "userEnteredFormat": {"textFormat": {"bold": True}}}
        ]}], "start": {"sheetId": sheet_id, "rowIndex": 0, "columnIndex": 0}, "fields": "userEnteredValue,userEnteredFormat.textFormat.bold"}},
        
        # Add IMPORTRANGE formula to pull properties from BMS
        {"updateCells": {"rows": [{"values": [
            {"userEnteredValue": {"formulaValue": f'=UNIQUE(QUERY(IMPORTRANGE("{BMS_SPREADSHEET_ID}", "Summary!A:A"), "SELECT Col1 WHERE Col1 IS NOT NULL AND Col1 <> \'\' AND Col1 <> \'Property\'"))'}}
        ]}], "start": {"sheetId": sheet_id, "rowIndex": 1, "columnIndex": 2}, "fields": "userEnteredValue"}},

        # Add Data Validation dropdown for Group_ID
        {"setDataValidation": {"range": {"sheetId": sheet_id, "startRowIndex": 1, "startColumnIndex": 1, "endColumnIndex": 2}, "rule": {"condition": {"type": "ONE_OF_RANGE", "values": [{"userEnteredValue": "='[DB] Investment_Groups'!A2:A"}]}, "strict": True}}}
    ]

    # --- 3. Execute the batch update ---
    try:
        service.spreadsheets().batchUpdate(spreadsheetId=SPREADSHEET_ID, body={'requests': requests}).execute()
        print("Successfully set up the allocation sheet with formulas and validation!")
        print(f"Please check the result at: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}")
    except HttpError as error:
        print(f"An error occurred during setup: {error}")

if __name__ == "__main__":
    main() 