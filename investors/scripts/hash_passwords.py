import os
import hashlib
from dotenv import load_dotenv

def generate_hash(password):
    """Generates a SHA-256 hash for a given password."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def main():
    """
    Loads passwords from a .env file in the parent directory,
    hashes them, and prints the results.
    """
    # Assuming this script is in 'investors/scripts' and .env is in 'investors/portal'
    dotenv_path = os.path.join(os.path.dirname(__file__), '..', 'portal', '.env')
    
    if not os.path.exists(dotenv_path):
        print(f"Error: .env file not found at {dotenv_path}")
        print("Please create it first with the user passwords.")
        return

    load_dotenv(dotenv_path=dotenv_path)

    passwords = {
        "hila": os.getenv("REACT_APP_HILA_PASSWORD"),
        "moty": os.getenv("REACT_APP_MOTY_PASSWORD"),
        "harvinder": os.getenv("REACT_APP_HARVINDER_PASSWORD")
    }

    print("--- Generated Password Hashes ---")
    for name, pwd in passwords.items():
        if pwd:
            hashed_password = generate_hash(pwd)
            print(f"User: {name}")
            print(f"  SHA-256 Hash: {hashed_password}\n")
        else:
            print(f"User: {name}")
            print(f"  Password not found in .env file.\n")
            
    print("--- Copy the hash values into your Google Sheet ---")

if __name__ == "__main__":
    main() 