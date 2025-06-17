import sys
import os
# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from projects.spreadsheet_automation.auth import get_authenticated_service
from googleapiclient.errors import HttpError
from refactor_sandbox.build_new_spreadsheet import create_new_spreadsheet, build_sheets, NEW_SPREADSHEET_TITLE

# The ID of the SPREADSHEET TO DELETE
OLD_SPREADSHEET_ID = "1G2QCJDjHuy2RkdeQXL-WGtRzStWoPrN8EchjgD7Eoso"

def delete_file_from_drive(service, file_id):
    """Deletes a file from Google Drive."""
    print(f"Attempting to delete spreadsheet with ID: {file_id}...")
    try:
        service.files().delete(fileId=file_id).execute()
        print("Successfully deleted the old sandbox spreadsheet.")
    except HttpError as error:
        if error.resp.status == 404:
            print("Old sandbox spreadsheet not found, proceeding...")
        else:
            print(f"An error occurred while trying to delete the file: {error}")
            # We might not want to stop the whole process if deletion fails
            # For now, we will just print the error and continue.
            pass

def main():
    """
    Main function to orchestrate the cleanup and build process.
    1. Deletes the old sandbox spreadsheet.
    2. Creates the new v2.1 spreadsheet.
    """
    print("--- Starting Cleanup and Build Process ---")
    
    # 1. Get authenticated services for both Drive and Sheets
    print("Authenticating...")
    drive_service = get_authenticated_service('drive', 'v3')
    sheets_service = get_authenticated_service('sheets', 'v4')
    print("Authentication successful.")

    if not drive_service or not sheets_service:
        print("Failed to authenticate. Aborting.")
        return

    # 2. Delete the old file
    delete_file_from_drive(drive_service, OLD_SPREADSHEET_ID)

    # 3. Create the new spreadsheet
    new_spreadsheet_id = create_new_spreadsheet(sheets_service, NEW_SPREADSHEET_TITLE)
    
    # 4. Build the structure in the new spreadsheet
    if new_spreadsheet_id:
        build_sheets(sheets_service, new_spreadsheet_id)
        print("\n--- Process Complete ---")
        print(f"Link to your new v2.1 spreadsheet: https://docs.google.com/spreadsheets/d/{new_spreadsheet_id}")

if __name__ == "__main__":
    main() 