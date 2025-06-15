import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

MERGE_API_KEY = os.getenv("MERGE_API_KEY")
ACCOUNT_TOKEN = os.getenv("ACCOUNT_TOKEN")

BASE_URL = "https://api.merge.dev/api/accounting/v1"

def get_accounts():
    """
    Fetches the list of accounts from QuickBooks via Merge.
    """
    if not MERGE_API_KEY or not ACCOUNT_TOKEN:
        print("Error: MERGE_API_KEY or ACCOUNT_TOKEN is not set.")
        print("Please check your .env file.")
        return

    headers = {
        "Authorization": f"Bearer {MERGE_API_KEY}",
        "X-Account-Token": ACCOUNT_TOKEN
    }
    
    try:
        response = requests.get(f"{BASE_URL}/accounts", headers=headers)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4xx or 5xx)
        
        accounts = response.json()
        
        print("Successfully fetched accounts!")
        for account in accounts.get("results", []):
            print(f"- ID: {account.get('id')}, Name: {account.get('name')}, Type: {account.get('account_type')}")

    except requests.exceptions.HTTPError as err:
        print(f"HTTP Error: {err}")
        print(f"Response Body: {err.response.text}")
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    get_accounts()
