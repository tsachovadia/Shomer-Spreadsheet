# Project Brief: Shomer Spreadsheet Professionalization

## 1. Project Goal

The primary goal of this project is to "wrap" the existing Google Sheets-based business management system in a professional and robust software development lifecycle. This involves migrating critical business logic, currently managed in Google Apps Script, into a local, version-controlled environment (Python).

The core objective is to create an automated, reliable, and maintainable system for:
1.  **Extracting and documenting** all formulas from the master spreadsheet.
2.  **Analyzing changes** and logic using an AI model (Gemini).
3.  **Proposing updates** to the system's markdown documentation.
4.  **Ensuring human-in-the-loop review** for all AI-suggested changes before they are applied.

This will serve as the foundation for future features, including investor portals, QuickBooks integration, and further business process automation.

## 2. Key Modules

-   **Google Sheets API Connector:** A Python module to securely authenticate and interact with the Google Sheets API.
-   **Formula Extractor:** A script to replicate and improve upon the existing `formula_fetching.gs` logic, pulling all relevant formulas from the sheets.
-   **CSV Persistence Layer:** A mechanism to save the extracted formulas into timestamped CSV files for historical tracking and analysis.
-   **AI Analyzer & Diff Generator:** A module that sends the latest formulas and existing documentation to the Gemini API and generates a `.diff` file with suggested documentation changes for review.
-   **Automation Runner:** A simple script to execute the entire workflow on demand. 