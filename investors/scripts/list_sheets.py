from auth import get_authenticated_service
from googleapiclient.errors import HttpError
import sys
import json

def main():
    """Gets all sheet names from the spreadsheet."""
    if len(sys.argv) < 2:
        print("Usage: python3 list_sheets.py <system_name>")
        return

    system_name = sys.argv[1]
    
    with open('config.json', 'r') as f:
        config = json.load(f)

    if system_name not in config:
        print(f"Error: System '{system_name}' not found in config.")
        return
        
    spreadsheet_id = config[system_name]['spreadsheet_id']

    service = get_authenticated_service("sheets", "v4")
    
    try:
        sheet_metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        sheets = sheet_metadata.get('sheets', [])
        
        if not sheets:
            print("No sheets found.")
            return

        print("Sheets in this spreadsheet:")
        for sheet in sheets:
            print(f"- {sheet['properties']['title']}")

    except HttpError as err:
        print(err)

if __name__ == "__main__":
    main() 