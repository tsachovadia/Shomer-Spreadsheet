import sys
import os
# This is a more robust way to add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from projects.spreadsheet_automation.auth import get_authenticated_service
from googleapiclient.errors import HttpError

# --- Configuration for the New Spreadsheet ---
NEW_SPREADSHEET_TITLE = "Investors System v2.0 (Sandbox)"

SHEETS_TO_CREATE = {
    # --- DB Sheets (Light Blue) ---
    "[DB] Investors": { "color": "#cfe2f3", "headers": ["Investor_ID", "Full_Name", "Email", "Phone", "Contact_Log_Link"] },
    "[DB] Investment_Groups": { "color": "#cfe2f3", "headers": ["Group_ID", "Group_Name", "Group_Description"] },
    "[DB] Investments": { "color": "#cfe2f3", "headers": ["Investment_ID", "Investor_ID", "Group_ID", "Investment_Amount", "Investment_Date", "Interest_Rate", "Compounding_Interest", "Calculation_Method"] },
    "[DB] Asset_Allocation": { "color": "#cfe2f3", "headers": ["Allocation_ID", "Group_ID", "Property_ID"] },
    "[DB] Payments_Log": { "color": "#cfe2f3", "headers": ["Payment_ID", "Investment_ID", "Payment_Date", "Payment_Amount", "Payment_Method"] },
    
    # --- LOGIC Sheets (Light Green) ---
    "[LOGIC] Quarterly_Calculations": { "color": "#d9ead3", "headers": ["Calc_ID", "Investment_ID", "Quarter", "Opening_Balance", "Interest_Earned", "Balance_Due"] },
    "[LOGIC] Investor_Account_Status": { "color": "#d9ead3", "headers": ["Investor_ID", "Total_Invested", "Total_Paid_To_Date", "Current_Balance_Due", "Next_Payment_Date", "Next_Report_Due"] },

    # --- VIEW Sheets (Light Yellow) ---
    "[VIEW] Investor_Dashboard": { "color": "#fff2cc", "headers": ["Metric", "Value"] },
    "[VIEW] Group_Dashboard": { "color": "#fff2cc", "headers": ["Metric", "Value"] },
    "[VIEW] Payments_Worksheet": { "color": "#fff2cc", "headers": ["Investor_Name", "Amount_To_Pay", "Payment_Date", "Status"] },

    # --- INPUT Sheets (Light Red) ---
    "[INPUT] New_Investment_UI": { "color": "#f4cccc", "headers": ["Field", "Value", "Notes"] },
    "[INPUT] Asset_Allocation_UI": { "color": "#f4cccc", "headers": ["Select Group", "Select Available Property", "Property UPB", "Action"] },
    "[INPUT] Log_Payment_UI": { "color": "#f4cccc", "headers": ["Select Investor", "Payment Amount", "Payment Date", "Action"] }
}

def create_new_spreadsheet(service, title):
    """Creates a new spreadsheet and returns its ID."""
    print(f"Creating new spreadsheet: '{title}'...")
    spreadsheet = { 'properties': { 'title': title } }
    try:
        sheet = service.spreadsheets().create(body=spreadsheet, fields='spreadsheetId').execute()
        spreadsheet_id = sheet.get('spreadsheetId')
        print(f"Success! New spreadsheet created with ID: {spreadsheet_id}")
        return spreadsheet_id
    except HttpError as error:
        print(f"An error occurred: {error}")
        return None

def build_sheets(service, spreadsheet_id):
    """Builds the structure of the new spreadsheet."""
    print("Building sheets structure...")
    requests = []
    
    # We will delete the default "Sheet1" at the end.
    # Its sheetId is almost always 0.
    default_sheet_id = 0

    for i, (sheet_name, properties) in enumerate(SHEETS_TO_CREATE.items()):
        # 1. Add the sheet
        # We start with a higher sheetId to avoid conflicts with the default sheet
        new_sheet_id = i + 1 
        requests.append({
            "addSheet": {
                "properties": {
                    "sheetId": new_sheet_id,
                    "title": sheet_name,
                    "gridProperties": { "frozenRowCount": 1 },
                    "tabColor": {
                        "red": int(properties["color"][1:3], 16) / 255.0,
                        "green": int(properties["color"][3:5], 16) / 255.0,
                        "blue": int(properties["color"][5:7], 16) / 255.0
                    }
                }
            }
        })
        # 2. Add headers
        requests.append({
            "updateCells": {
                "rows": [{
                    "values": [{
                        "userEnteredValue": {"stringValue": header},
                        "userEnteredFormat": {"textFormat": {"bold": True}}
                    } for header in properties["headers"]]
                }],
                "start": {"sheetId": new_sheet_id, "rowIndex": 0, "columnIndex": 0},
                "fields": "userEnteredValue,userEnteredFormat.textFormat.bold"
            }
        })

    # Now, add the request to delete the default sheet at the end
    requests.append({ "deleteSheet": { "sheetId": default_sheet_id } })

    body = { 'requests': requests }
    try:
        service.spreadsheets().batchUpdate(spreadsheetId=spreadsheet_id, body=body).execute()
        print("Successfully created and formatted all sheets.")
    except HttpError as error:
        print(f"An error occurred during batch update: {error}")

def main():
    """Main function to drive the script."""
    service = get_authenticated_service()
    if service:
        # --- TEMPORARY: Run build_sheets on the already created spreadsheet ---
        spreadsheet_id = "1G2QCJDjHuy2RkdeQXL-WGtRzStWoPrN8EchjgD7Eoso" 
        # spreadsheet_id = create_new_spreadsheet(service, NEW_SPREADSHEET_TITLE)
        if spreadsheet_id:
            build_sheets(service, spreadsheet_id)
            print(f"\nLink to your spreadsheet: https://docs.google.com/spreadsheets/d/{spreadsheet_id}")

if __name__ == "__main__":
    main() 