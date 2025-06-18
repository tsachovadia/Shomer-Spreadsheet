import hashlib
import sys

def generate_hash(password):
    """Generates a SHA-256 hash for a given password."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 hash_passwords.py <password_to_hash>")
        sys.exit(1)

    password_to_hash = sys.argv[1]
    hashed_password = generate_hash(password_to_hash)
    
    print(f"Password: {password_to_hash}")
    print(f"SHA-256 Hash: {hashed_password}") 