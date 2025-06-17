import gspread
from oauth2client.service_account import ServiceAccountCredentials
import os.path
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

# This module will encapsulate all the logic for interacting with Google Sheets.

class GoogleSheetClient:
    def __init__(self, service_account_path='service_account.json', user_credentials_path='desktop_credentials.json', scope=None):
        """
        Initializes the client and authenticates with Google Sheets.
        Tries Service Account auth first, falls back to User auth.
        """
        if scope is None:
            scope = [
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/drive.file"
            ]
        self.scope = scope
        self.creds = None

        # 1. Try Service Account credentials first
        if os.path.exists(service_account_path):
            try:
                self.creds = ServiceAccountCredentials.from_json_keyfile_name(service_account_path, self.scope)
                print("Authenticated using Service Account.")
            except Exception as e:
                print(f"Could not authenticate with Service Account: {e}")
                self.creds = None

        # 2. Fallback to User (desktop) credentials if service account failed or not present
        if not self.creds:
            token_path = 'token.json'
            if os.path.exists(token_path):
                self.creds = Credentials.from_authorized_user_file(token_path, self.scope)
            
            if not self.creds or not self.creds.valid:
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                else:
                    if os.path.exists(user_credentials_path):
                        flow = InstalledAppFlow.from_client_secrets_file(user_credentials_path, self.scope)
                        self.creds = flow.run_local_server(port=0)
                    else:
                        print(f"ERROR: Neither '{service_account_path}' nor '{user_credentials_path}' found.")
                        return None
                
                with open(token_path, 'w') as token:
                    token.write(self.creds.to_json())
            print("Authenticated using User Credentials.")

        if self.creds:
            self.client = gspread.authorize(self.creds)
        else:
            self.client = None

    def get_sheet_by_name(self, spreadsheet_id, sheet_name):
        """
        Opens a specific sheet (tab) in a spreadsheet.
        """
        try:
            spreadsheet = self.client.open_by_key(spreadsheet_id)
            return spreadsheet.worksheet(sheet_name)
        except gspread.exceptions.SpreadsheetNotFound:
            print(f"Error: Spreadsheet with ID '{spreadsheet_id}' not found.")
            return None
        except gspread.exceptions.WorksheetNotFound:
            print(f"Error: Worksheet with name '{sheet_name}' not found.")
            return None

    def get_all_records(self, sheet):
        """
        Fetches all records from a given sheet as a list of dictionaries.
        Assumes the first row is the header.
        """
        if not sheet:
            return []
        return sheet.get_all_records()

    def find_row_by_id(self, sheet, id_column, target_id):
        """
        Finds the row number for a given ID in a specific column.
        Returns the row number (1-indexed) or None if not found.
        """
        if not sheet:
            return None
        try:
            id_list = sheet.col_values(id_column)
            # +1 because list is 0-indexed but sheet rows are 1-indexed
            return id_list.index(str(target_id)) + 1
        except ValueError:
            return None

    def append_row(self, sheet, data_row):
        """
        Appends a new row to the sheet.
        :param data_row: A list of values in the correct order.
        """
        if not sheet:
            return False
        sheet.append_row(data_row, value_input_option='USER_ENTERED')
        return True

    def update_row(self, sheet, row_number, data_row):
        """
        Updates a specific row in the sheet.
        """
        if not sheet:
            return False
        sheet.update(f'A{row_number}', [data_row], value_input_option='USER_ENTERED')
        return True

    def delete_row(self, sheet, row_number):
        """
        Deletes a specific row from the sheet.
        """
        if not sheet:
            return False
        sheet.delete_rows(row_number)
        return True

# Example usage (for testing purposes)
if __name__ == '__main__':
    # For local development, create an OAuth 2.0 Client ID for "Desktop app"
    # and save the downloaded JSON as 'desktop_credentials.json' in this directory.
    # The script will fall back to using this method.

    print("Attempting to connect to Google Sheets...")
    client = GoogleSheetClient()
    
    if client and client.client:
        # You would get this from your config file in a real scenario
        BMS_SPREADSHEET_ID = '11PnSn-4iX9sxNegMyW10df5DRlT_jFa6Ji1FSKEhOFQ' 

        # Example: Fetching data from the 'Summary' sheet
        summary_sheet = client.get_sheet_by_name(BMS_SPREADSHEET_ID, 'Summary')
        
        if summary_sheet:
            print("Successfully connected and opened the 'Summary' sheet.")
            # Note: get_all_records might fail if the sheet is not structured with a clear header row.
            # This is just for a connection test.
            first_row = summary_sheet.row_values(1)
            print("First row of Summary sheet:", first_row)
    else:
        print("Failed to create a Google Sheet client. Please check your credentials.") 