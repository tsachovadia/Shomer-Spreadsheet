from flask import Flask, jsonify, request
from google_sheet_client import GoogleSheetClient
from flask_cors import CORS
import gspread

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

# --- Dummy User Data ---
# In a real application, this would come from a database.
DUMMY_USERS = {
    "admin": "password" 
}

# --- Configuration ---
# In a real app, this would be loaded from a config file or environment variables
INVESTORS_SPREADSHEET_ID = "1G2QCJDjHuy2RkdeQXL-WGtRzStWoPrN8EchjgD7Eoso"
INVESTORS_SHEET_NAME = "[DB] Investors"
GROUPS_SHEET_NAME = "[DB] Investment_Groups"
INVESTMENTS_SHEET_NAME = "[DB] Investments"
PAYMENTS_SHEET_NAME = "[DB] Payments_Log"

BMS_SPREADSHEET_ID = "11PnSn-4iX9sxNegMyW10df5DRlT_jFa6Ji1FSKEhOFQ"
BMS_SUMMARY_SHEET_NAME = "Summary"

# --- Initialize Google Sheet Client ---
# This assumes credentials.json (or fallback) is in the same directory
sheet_client = GoogleSheetClient()

# This is a dummy endpoint for initial setup verification.
# We will replace this with our actual API endpoints as defined in the blueprint.
@app.route('/api/status', methods=['GET'])
def get_status():
    """A simple endpoint to check if the backend is running."""
    return jsonify({"status": "ok", "message": "Shomer Backend is running!"})

@app.route('/api/login', methods=['POST'])
def login():
    """
    A simple login endpoint for initial development.
    Checks against a hardcoded user.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    username = data.get('username')
    password = data.get('password')

    # Check if user exists and password is correct
    if username in DUMMY_USERS and DUMMY_USERS[username] == password:
        # In a real app, you would generate and return a JWT (JSON Web Token) here.
        return jsonify({
            "status": "ok",
            "message": "Login successful!",
            "user": {
                "username": username,
                "role": "admin" # Hardcoded role for now
            }
        })
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/investors', methods=['GET'])
def get_investors():
    """
    Fetches the list of all investors from the Google Sheet.
    """
    if not sheet_client or not sheet_client.client:
        return jsonify({"error": "Sheet client not initialized"}), 500

    investors_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, INVESTORS_SHEET_NAME)
    if not investors_sheet:
        return jsonify({"error": "Could not find the investors sheet"}), 500
    
    records = investors_sheet.get_all_records()
    
    return jsonify(records)

@app.route('/api/investors', methods=['POST'])
def add_investor():
    """Adds a new investor to the [DB] Investors sheet."""
    data = request.get_json()
    if not data or 'Investor_ID' not in data or 'Full_Name' not in data:
        return jsonify({"error": "Invalid input. 'Investor_ID' and 'Full_Name' are required."}), 400

    investors_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, INVESTORS_SHEET_NAME)
    if not investors_sheet:
        return jsonify({"error": "Could not find the investors sheet"}), 500

    # Ensure the order matches the sheet columns
    new_row = [
        data.get('Investor_ID'),
        data.get('Full_Name'),
        data.get('Email', ''),
        data.get('Phone', ''),
        data.get('Contact_Log_Link', ''),
        data.get('Calculation_Method', 'Standard_Quarterly') # Default value
    ]
    
    investors_sheet.append_row(new_row, value_input_option='USER_ENTERED')
    return jsonify({"status": "ok", "message": "Investor added successfully."}), 201

@app.route('/api/investors/<string:investor_id>', methods=['PUT'])
def update_investor(investor_id):
    """Updates an existing investor's details."""
    data = request.get_json()
    investors_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, INVESTORS_SHEET_NAME)
    if not investors_sheet:
        return jsonify({"error": "Could not find the investors sheet"}), 500

    row_to_update = sheet_client.find_row_by_id(investors_sheet, id_column=1, target_id=investor_id)
    if not row_to_update:
        return jsonify({"error": "Investor not found"}), 404

    # This is a simple implementation. A more robust one would fetch the existing row
    # and update only the provided fields. For now, we assume all fields are sent.
    updated_row = [
        investor_id, # The ID doesn't change
        data.get('Full_Name'),
        data.get('Email'),
        data.get('Phone'),
        data.get('Contact_Log_Link'),
        data.get('Calculation_Method')
    ]
    
    investors_sheet.update(f'A{row_to_update}', [updated_row])
    return jsonify({"status": "ok", "message": "Investor updated successfully."})

@app.route('/api/investors/<string:investor_id>', methods=['DELETE'])
def delete_investor(investor_id):
    """Deletes an investor from the sheet."""
    investors_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, INVESTORS_SHEET_NAME)
    if not investors_sheet:
        return jsonify({"error": "Could not find the investors sheet"}), 500

    row_to_delete = sheet_client.find_row_by_id(investors_sheet, id_column=1, target_id=investor_id)
    if not row_to_delete:
        return jsonify({"error": "Investor not found"}), 404
        
    investors_sheet.delete_rows(row_to_delete)
    return jsonify({"status": "ok", "message": "Investor deleted successfully."})

@app.route('/api/groups', methods=['GET'])
def get_groups():
    """
    Fetches the list of all investment groups from the Google Sheet.
    """
    if not sheet_client or not sheet_client.client:
        return jsonify({"error": "Sheet client not initialized"}), 500

    groups_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, GROUPS_SHEET_NAME)
    if not groups_sheet:
        return jsonify({"error": "Could not find the investment groups sheet"}), 500
    
    records = sheet_client.get_all_records(groups_sheet)
    
    return jsonify(records)

@app.route('/api/groups', methods=['POST'])
def add_group():
    """Adds a new investment group."""
    data = request.get_json()
    if not data or 'Group_ID' not in data or 'Group_Name' not in data:
        return jsonify({"error": "Invalid input. 'Group_ID' and 'Group_Name' are required."}), 400

    groups_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, GROUPS_SHEET_NAME)
    if not groups_sheet:
        return jsonify({"error": "Could not find the groups sheet"}), 500

    new_row = [data.get('Group_ID'), data.get('Group_Name'), data.get('Group_Description', '')]
    groups_sheet.append_row(new_row, value_input_option='USER_ENTERED')
    return jsonify({"status": "ok", "message": "Group added successfully."}), 201

@app.route('/api/groups/<string:group_id>', methods=['DELETE'])
def delete_group(group_id):
    """Deletes an investment group."""
    groups_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, GROUPS_SHEET_NAME)
    if not groups_sheet:
        return jsonify({"error": "Could not find the groups sheet"}), 500

    row_to_delete = sheet_client.find_row_by_id(groups_sheet, id_column=1, target_id=group_id)
    if not row_to_delete:
        return jsonify({"error": "Group not found"}), 404
        
    groups_sheet.delete_rows(row_to_delete)
    return jsonify({"status": "ok", "message": "Group deleted successfully."})

@app.route('/api/groups/<string:group_id>', methods=['PUT'])
def update_group(group_id):
    """Updates an existing investment group."""
    data = request.get_json()
    groups_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, GROUPS_SHEET_NAME)
    if not groups_sheet:
        return jsonify({"error": "Could not find the groups sheet"}), 500

    row_to_update = sheet_client.find_row_by_id(groups_sheet, id_column=1, target_id=group_id)
    if not row_to_update:
        return jsonify({"error": "Group not found"}), 404

    # Assumes all fields are sent for the update
    updated_row = [
        group_id,
        data.get('Group_Name'),
        data.get('Group_Description')
    ]
    groups_sheet.update(f'A{row_to_update}', [updated_row])
    return jsonify({"status": "ok", "message": "Group updated successfully."})

@app.route('/api/investments', methods=['GET'])
def get_investments():
    """
    Fetches the list of all individual investments from the Google Sheet.
    """
    if not sheet_client or not sheet_client.client:
        return jsonify({"error": "Sheet client not initialized"}), 500

    investments_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, INVESTMENTS_SHEET_NAME)
    if not investments_sheet:
        return jsonify({"error": "Could not find the investments sheet"}), 500
    
    records = sheet_client.get_all_records(investments_sheet)
    
    return jsonify(records)

@app.route('/api/investments', methods=['POST'])
def add_investment():
    """Adds a new individual investment."""
    data = request.get_json()
    required_fields = ['Investment_ID', 'Investor_ID', 'Group_ID', 'Investment_Amount', 'Investment_Date']
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": f"Invalid input. Required fields are: {required_fields}"}), 400

    investments_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, INVESTMENTS_SHEET_NAME)
    if not investments_sheet:
        return jsonify({"error": "Could not find the investments sheet"}), 500

    new_row = [
        data.get('Investment_ID'),
        data.get('Investor_ID'),
        data.get('Group_ID'),
        data.get('Investment_Amount'),
        data.get('Investment_Date'),
        data.get('Interest_Rate', ''),
        data.get('Compounding_Interest', ''),
        data.get('Calculation_Method', '')
    ]
    investments_sheet.append_row(new_row, value_input_option='USER_ENTERED')
    return jsonify({"status": "ok", "message": "Investment added successfully."}), 201

@app.route('/api/investments/<string:investment_id>', methods=['DELETE'])
def delete_investment(investment_id):
    """Deletes an investment."""
    investments_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, INVESTMENTS_SHEET_NAME)
    if not investments_sheet:
        return jsonify({"error": "Could not find the investments sheet"}), 500

    row_to_delete = sheet_client.find_row_by_id(investments_sheet, id_column=1, target_id=investment_id)
    if not row_to_delete:
        return jsonify({"error": "Investment not found"}), 404
        
    investments_sheet.delete_rows(row_to_delete)
    return jsonify({"status": "ok", "message": "Investment deleted successfully."})

@app.route('/api/investments/<string:investment_id>', methods=['PUT'])
def update_investment(investment_id):
    """Updates an existing investment."""
    data = request.get_json()
    investments_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, INVESTMENTS_SHEET_NAME)
    if not investments_sheet:
        return jsonify({"error": "Could not find the investments sheet"}), 500

    row_to_update = sheet_client.find_row_by_id(investments_sheet, id_column=1, target_id=investment_id)
    if not row_to_update:
        return jsonify({"error": "Investment not found"}), 404

    updated_row = [
        investment_id,
        data.get('Investor_ID'),
        data.get('Group_ID'),
        data.get('Investment_Amount'),
        data.get('Investment_Date'),
        data.get('Interest_Rate'),
        data.get('Compounding_Interest'),
        data.get('Calculation_Method')
    ]
    investments_sheet.update(f'A{row_to_update}', [updated_row])
    return jsonify({"status": "ok", "message": "Investment updated successfully."})

@app.route('/api/payments', methods=['GET'])
def get_payments():
    """
    Fetches the list of all payments from the Google Sheet.
    """
    if not sheet_client or not sheet_client.client:
        return jsonify({"error": "Sheet client not initialized"}), 500

    payments_sheet = sheet_client.get_sheet_by_name(INVESTORS_SPREADSHEET_ID, PAYMENTS_SHEET_NAME)
    if not payments_sheet:
        return jsonify({"error": "Could not find the payments sheet"}), 500
    
    records = sheet_client.get_all_records(payments_sheet)
    
    return jsonify(records)

@app.route('/api/assets', methods=['GET'])
def get_assets():
    """
    Fetches the list of all assets and their current UPB directly from 
    the BMS 'Summary' sheet, as per the refined logic.
    """
    if not sheet_client or not sheet_client.client:
        return jsonify({"error": "Sheet client not initialized"}), 500

    try:
        summary_sheet = sheet_client.get_sheet_by_name(BMS_SPREADSHEET_ID, BMS_SUMMARY_SHEET_NAME)
        if not summary_sheet:
            return jsonify({"error": f"Could not find the BMS summary sheet: '{BMS_SUMMARY_SHEET_NAME}'"}), 500
        
        # Fetch columns A (Property) and M (Current UPB) starting from row 8
        asset_names = summary_sheet.col_values(1, value_render_option='FORMATTED_VALUE')[7:] # Column A from row 8
        upb_values = summary_sheet.col_values(13, value_render_option='FORMATTED_VALUE')[7:] # Column M from row 8

        assets_data = []
        # Loop through the rows and create a dictionary for each asset
        # where the asset name is not empty.
        for i in range(len(asset_names)):
            # Ensure upb_values has an entry for this index to avoid errors
            upb = upb_values[i] if i < len(upb_values) else None

            # Smart filter: only include rows that have an asset name AND a valid-looking UPB value.
            if asset_names[i] and upb and (isinstance(upb, (int, float)) or upb.startswith('$') or "didnt find" in upb.lower()):
                assets_data.append({
                    "assetName": asset_names[i],
                    "currentUPB": upb
                })
        
        return jsonify(assets_data)

    except Exception as e:
        print(f"An unexpected error occurred while fetching assets: {e}")
        return jsonify({"error": "An unexpected error occurred"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) # Running on port 5001 to avoid conflicts with frontend dev server 