import sys
import os
# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from projects.spreadsheet_automation.auth import get_authenticated_service
from googleapiclient.errors import HttpError
from refactor_sandbox.build_dashboard import get_sheet_id

# --- Configuration ---
SPREADSHEET_ID = "15mmVv_qQqaT4W_X-A6WlnxU5o0CYZ3Jd64ifGKE6_xI"
DASHBOARD_SHEET_NAME = "[VIEW] Group_Dashboard"

def main():
    """Applies advanced formatting and adds charts to the dashboard."""
    service = get_authenticated_service('sheets', 'v4')
    if not service:
        return

    sheet_id = get_sheet_id(service, SPREADSHEET_ID, DASHBOARD_SHEET_NAME)
    if sheet_id is None:
        return

    print("Applying advanced formatting and charts...")

    requests = [
        # --- 1. Adjust Column Widths for Padding and Layout ---
        {"updateDimensionProperties": {"range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": 0, "endIndex": 1}, "properties": {"pixelSize": 50}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {"range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": 3, "endIndex": 4}, "properties": {"pixelSize": 50}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {"range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": 6, "endIndex": 7}, "properties": {"pixelSize": 50}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {"range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": 1, "endIndex": 3}, "properties": {"pixelSize": 250}, "fields": "pixelSize"}},
        {"updateDimensionProperties": {"range": {"sheetId": sheet_id, "dimension": "COLUMNS", "startIndex": 4, "endIndex": 6}, "properties": {"pixelSize": 250}, "fields": "pixelSize"}},

        # --- 2. Format KPI Cards (Corrected Ranges) ---
        {"updateBorders": {"range": {"sheetId": sheet_id, "startRowIndex": 4, "endRowIndex": 8, "startColumnIndex": 1, "endColumnIndex": 3}, "top": {"style": "SOLID"}, "bottom": {"style": "SOLID"}, "left": {"style": "SOLID"}, "right": {"style": "SOLID"}, "innerHorizontal": {"style": "SOLID"}, "innerVertical": {"style": "SOLID"}}},
        {"repeatCell": {"range": {"sheetId": sheet_id, "startRowIndex": 4, "endRowIndex": 8, "startColumnIndex": 1, "endColumnIndex": 3}, "cell": {"userEnteredFormat": {"backgroundColor": {"red": 0.95, "green": 0.95, "blue": 0.95}}}, "fields": "userEnteredFormat.backgroundColor"}},
        {"repeatCell": {"range": {"sheetId": sheet_id, "startRowIndex": 4, "endRowIndex": 8, "startColumnIndex": 2, "endColumnIndex": 3}, "cell": {"userEnteredFormat": {"horizontalAlignment": "RIGHT", "textFormat": {"fontSize": 14, "bold": True}}}, "fields": "userEnteredFormat(horizontalAlignment,textFormat)"}},
        
        # --- 3. Add Charts ---
        { "addChart": { "chart": {
            "spec": {
                "title": "Investment Distribution by Investor",
                "pieChart": {
                    "legendPosition": "RIGHT_LEGEND",
                    "domain": {"sourceRange": {"sources": [{"sheetId": sheet_id, "startRowIndex": 10, "endRowIndex": 20, "startColumnIndex": 1, "endColumnIndex": 2}]}},
                    "series": {"sourceRange": {"sources": [{"sheetId": sheet_id, "startRowIndex": 10, "endRowIndex": 20, "startColumnIndex": 2, "endColumnIndex": 3}]}}
                }
            },
            "position": {"overlayPosition": {"anchorCell": {"sheetId": sheet_id, "rowIndex": 21, "columnIndex": 1}}}
        }}},
        { "addChart": { "chart": {
            "spec": {
                "title": "Asset Value (UPB) by Property",
                "basicChart": {
                    "chartType": "COLUMN",
                    "legendPosition": "NO_LEGEND",
                    "domains": [{"domain": {"sourceRange": {"sources": [{"sheetId": sheet_id, "startRowIndex": 10, "endRowIndex": 20, "startColumnIndex": 4, "endColumnIndex": 5}]}}}],
                    "series": [{"series": {"sourceRange": {"sources": [{"sheetId": sheet_id, "startRowIndex": 10, "endRowIndex": 20, "startColumnIndex": 5, "endColumnIndex": 6}]}}}]
                }
            },
            "position": {"overlayPosition": {"anchorCell": {"sheetId": sheet_id, "rowIndex": 21, "columnIndex": 4}}}
        }}}
    ]

    try:
        service.spreadsheets().batchUpdate(spreadsheetId=SPREADSHEET_ID, body={'requests': requests}).execute()
        print("Successfully applied advanced formatting and charts!")
        print(f"Check the result at: https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}")
    except HttpError as error:
        print(f"An error occurred applying design: {error}")

if __name__ == "__main__":
    main() 