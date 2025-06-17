# Blueprint: Investors System (Legacy)

This document describes the structure and logic of the original investors spreadsheet (`1dMpnv4KoKcZfuhd8WoIS8hrG39hLW5Ldh38BTMSvkJk`), which functions as a collection of individual investor ledgers.

## System Overview

The spreadsheet is organized around individual sheets for each investor and investment group, rather than a relational database model. The core logic resides within each investor's personal sheet.

### 1. Investor Sheets (e.g., `hila kligman`, `morsikh`)

-   **Purpose:** To act as a detailed financial ledger for a single investor. Each row represents a transaction or a balance calculation at a specific point in time.
-   **Structure:**
    -   **Column A (Date):** The date of the transaction or calculation.
    -   **Column B (Opening Balance):** The starting balance for the period. Usually carries over the ending balance from the previous row (`=F5`).
    -   **Column C (Deposits/Investments):** Manual input for new funds added by the investor.
    -   **Column D (Withdrawals/Payments):** Manual input for payments made to the investor.
    -   **Column E (Interest Earned):** Calculated interest for the period. The formula varies per investor, indicating specific business rules.
        -   *Example (Standard):* `=(A8-A7)*(Table2_3[Interest Rate]/365)*B8` - Calculates daily interest based on a rate from a separate table.
    -   **Column F (Ending Balance):** The final balance for the period (`=B+C-D+E`). This value is carried over to the next period's opening balance.
-   **Key Cells:**
    -   `K5`: Seems to calculate the current, most up-to-date balance using a formula like `INDEX(FILTER(...))`. This is likely the **Current Balance** for the investor.
    -   `L5`: Appears to be a calculation for quarterly estimated profit or interest (`=I5*K5/4`).

### 2. Group Sheets (e.g., `SG1`, `Chayil`)

-   **Purpose:** To aggregate data from the individual investor sheets that belong to that group, or to hold group-specific parameters.
-   **Structure:** Varies, but generally summarizes total investments and returns for the group.

### 3. Data-Hub Sheet (`Pool Properties`)

-   **Purpose:** To connect to the external BMS spreadsheet and import a list of all properties and their current UPB.
-   **Key Formula (`B2`):**
    ```excel
    =QUERY(IMPORTRANGE("1cDnLQ6I4654R7rhswbldW8EwmU5U88qwXQhFpRGbowg","Summary!A:M"), "select Col1, Col13 where Col13 is not null and not Col13 matches '[A-Za-z]'", 1)
    ```
    -   This formula is the bridge between the two systems. It pulls the asset list from the BMS, filtering out non-numeric UPB values.

---

## Implications for Apps Script API

-   **No Simple Tables:** We cannot simply query a single table. To get an investor's data, we must open their specific sheet.
-   **Authentication:** The API will need a way to map a logged-in user (e.g., by email) to their specific sheet name (e.g., "hila kligman").
-   **Calculations:** To get "Future Payments", the Apps Script will need to replicate the interest calculation logic found in the investor sheets.
-   **Data Aggregation:** To get a summary for an investor, the script will need to read their entire ledger sheet and perform calculations, such as summing all payments from column D. 