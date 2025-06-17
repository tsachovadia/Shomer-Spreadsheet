import datetime
import os
import pandas as pd
from googleapiclient.errors import HttpError
import re
import json
import sys

from auth import get_authenticated_service

# This script no longer uses a global Gemini API key, so the import and config are removed.

def get_all_sheet_names(service, spreadsheet_id):
    """Gets all sheet names from the spreadsheet."""
    try:
        spreadsheet_metadata = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        sheets = spreadsheet_metadata.get('sheets', [])
        return [sheet['properties']['title'] for sheet in sheets]
    except HttpError as err:
        print(f"An error occurred while fetching sheet properties: {err}")
        return None

def extract_formulas_from_sheet(service, spreadsheet_id, sheet_name):
    """Extracts all formulas from a given sheet."""
    print(f"Processing sheet: {sheet_name}...")
    try:
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=sheet_name,
            valueRenderOption='FORMULA'
        ).execute()
        
        values = result.get('values', [])
        formulas = []
        if not values:
            print(f"No data found in sheet: {sheet_name}")
            return []

        for r_idx, row in enumerate(values):
            for c_idx, cell_value in enumerate(row):
                if isinstance(cell_value, str) and cell_value.startswith('='):
                    temp_c_idx = c_idx
                    col_str = ""
                    while temp_c_idx >= 0:
                        col_str = chr(temp_c_idx % 26 + ord('A')) + col_str
                        temp_c_idx = temp_c_idx // 26 - 1
                    a1_notation = f"{col_str}{r_idx + 1}"
                    formulas.append({
                        'Sheet Name': sheet_name,
                        'Cell': a1_notation,
                        'Formula': cell_value
                    })
        print(f"Found {len(formulas)} formulas in {sheet_name}.")
        return formulas
    except HttpError as err:
        print(f"An error occurred while extracting formulas from {sheet_name}: {err}")
        return []

def main(target_system):
    """Main function to run the formula extraction process for a specific system."""
    
    # Load configuration
    with open('config.json', 'r') as f:
        all_configs = json.load(f)
    
    if target_system not in all_configs:
        print(f"Error: Target system '{target_system}' not found in config.json.")
        print(f"Available systems: {list(all_configs.keys())}")
        return

    config = all_configs[target_system]['config']
    spreadsheet_id = all_configs[target_system]['spreadsheet_id']
    
    print(f"--- Running extractor for system: {target_system} ---")
    print(f"Spreadsheet ID: {spreadsheet_id}")
    
    service = get_authenticated_service("sheets", "v4")
    sheet_names = get_all_sheet_names(service, spreadsheet_id)
    if not sheet_names:
        print("Could not retrieve sheet names. Exiting.")
        return

    all_formulas = []
    template_handled = False
    
    if config.get('houseSheetNamePattern'):
        house_sheet_pattern = re.compile(config['houseSheetNamePattern'])
    else:
        house_sheet_pattern = None

    # 1) Process the template sheet first
    if config.get('templateSheetName') and config['templateSheetName'] in sheet_names:
        print("\n--- Processing Template Sheet ---")
        formulas = extract_formulas_from_sheet(service, spreadsheet_id, config['templateSheetName'])
        for f in formulas:
            f['Sheet Name'] = f"{f['Sheet Name']} (TEMPLATE)"
        all_formulas.extend(formulas)
        template_handled = True

    # 2) Process the explicitly named sheets
    print("\n--- Processing Other Specified Sheets ---")
    for sheet_name in config.get('otherSheetsToProcess', []):
        if sheet_name == config.get('templateSheetName'):
            continue
        if sheet_name in sheet_names:
            formulas = extract_formulas_from_sheet(service, spreadsheet_id, sheet_name)
            all_formulas.extend(formulas)
        else:
            print(f"Warning: Specified sheet '{sheet_name}' not found.")

    # 3) Process house sheets if template was NOT handled
    if not template_handled and house_sheet_pattern:
        print("\n--- Processing House Sheets (Template Not Found) ---")
        for sheet_name in sheet_names:
            if house_sheet_pattern.match(sheet_name) and \
               sheet_name != config.get('templateSheetName') and \
               sheet_name not in config.get('otherSheetsToProcess', []):
                formulas = extract_formulas_from_sheet(service, spreadsheet_id, sheet_name)
                all_formulas.extend(formulas)

    if not all_formulas:
        print("No formulas were extracted. Exiting.")
        return

    df = pd.DataFrame(all_formulas)
    
    output_dir = os.path.join('formula_exports', target_system)
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    filename = os.path.join(output_dir, f"formulas_{timestamp}.csv")
    
    df.to_csv(filename, index=False, encoding='utf-8')
    print(f"\nSuccessfully extracted {len(df)} formulas for {target_system}.")
    print(f"Data saved to: {filename}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 main.py <system_name>")
        print("Example: python3 main.py bms")
    else:
        main(sys.argv[1]) 