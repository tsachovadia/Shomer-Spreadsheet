import os.path

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Define the paths relative to this file's location
AUTH_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_PATH = os.path.join(AUTH_DIR, 'credentials.json')
TOKEN_PATH = os.path.join(AUTH_DIR, 'token.json')

# If modifying these scopes, delete the file token.json.
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file" # Added scope to manage files (for deletion)
]

def get_authenticated_service(service_name, version):
    """
    Authenticates with a Google API and returns a service object.
    Handles the OAuth 2.0 flow, including token creation and refresh.
    """
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is
    # created automatically when the authorization flow completes for the first
    # time.
    if os.path.exists(TOKEN_PATH):
        creds = Credentials.from_authorized_user_file(TOKEN_PATH, SCOPES)

    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                CREDENTIALS_PATH, SCOPES
            )
            creds = flow.run_local_server(port=0)
            
        # Save the credentials for the next run
        with open(TOKEN_PATH, "w") as token:
            token.write(creds.to_json())

    return build(service_name, version, credentials=creds)

def main():
    """
    A simple function to test the authentication and connection.
    It tries to get the title of a spreadsheet.
    """
    try:
        service = get_authenticated_service("sheets", "v4")
        print("Authentication successful. Service object created.")
        
        # --- You will need to replace this with your actual Spreadsheet ID ---
        SPREADSHEET_ID = "1cDnLQ6I4654R7rhswbldW8EwmU5U88qwXQhFpRGbowg" # Please change this
        
        spreadsheet = service.spreadsheets().get(spreadsheetId=SPREADSHEET_ID).execute()
        print(f"Successfully accessed spreadsheet: '{spreadsheet['properties']['title']}'")

    except HttpError as err:
        print(f"An HTTP error occurred: {err}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main() 