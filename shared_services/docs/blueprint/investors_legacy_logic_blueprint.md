# Blueprint: Investors System (Legacy)

This document describes the structure and logic of the original investors spreadsheet (`1dMpnv4KoKcZfuhd8WoIS8hrG39hLW5Ldh38BTMSvkJk`), which functions as a collection of individual investor ledgers.

## System Overview

The spreadsheet is organized around individual sheets for each investor and investment group, rather than a relational database model. The core logic resides within each investor's personal sheet.

### 1. Investor Ledger Sheets (e.g., `hila kligman`, `morsikh`)

-   **Purpose:** To act as a detailed financial ledger for a single investor. Each sheet is self-contained.

-   **Structure Part 1: Investor Details (Rows 1-2)**
    -   This section acts as the master record for the investor's personal data.
    -   It includes fields like `Investor_ID`, `First name`, `Last name`, `Email`, etc.
    -   **Future-Proofing:** This area will hold future portal-related data like `portal_access_enabled` or authentication details.

-   **Structure Part 2: Loan Payment Schedule (Rows 4 onwards)**
    -   This is the investor's transaction ledger.
    -   **Column A (Date):** Manual input for the date of a transaction (deposit or payment).
    -   **Column B (Beginning balance):** The principal balance for the period.
        -   **Logic:** For `Compound=TRUE` accounts, this is the `Ending Balance` of the previous row. For `Compound=FALSE` (simple interest) accounts, this should **always be the original investment amount**.
    -   **Column C (Borrowed):** Manual input for new funds added.
    -   **Column D (Payment):** Manual input for payments made to the investor.
    -   **Column E (Interest):** Manual input for interest paid for the quarter.
    -   **Column F (Ending Balance):** Calculated field: `Beginning + Borrowed - Payment + Interest`.

-   **Structure Part 3: Investment Terms (Header table in H4:M5)**
    -   This table defines the terms for the main investment detailed in the ledger.
    -   **I5 (Interest Rate):** The annual interest rate.
    -   **J5 (Compound):** A checkbox (`TRUE`/`FALSE`) to determine if interest is compounding.
    -   **K5 (Current Ending balance):** A formula (`=INDEX(FILTER(...))`) that dynamically finds the most recent `Ending Balance` from column F. This is the **single source of truth for the investor's current total balance.**
    -   **L5 (Q Payment):** A **quarterly estimated payment** calculation, used for forecasting. The agreed-upon formula is `Interest Rate * Current Ending Balance / 4`.
    -   **M5 (investment group):** The `Group_ID` this investment belongs to. This links the investor's funds to a specific group.

### 2. Special Case: The `morsikh` Ledger

The sheet for the investor `morsikh` follows the same general ledger structure but with a critical difference in business logic, representing a special case.

-   **Automated Daily Interest Calculation:** Instead of manual quarterly interest entries, the `Interest` column (E) contains a formula that calculates interest on a daily basis: `=(A6-A5)*(loan_terms[Column 1]/365)*B6`.
-   **`loan_terms` Table:** This investor's sheet contains a separate named range or table called `loan_terms` which holds the specific interest rate used for these automated calculations.
-   **Group Allocation via Notes:** The association of funds to different investment groups (`Chayil`, `Segula`) appears to be managed via the `Notes` column (G) on a per-transaction basis.

-   **Implication:** The API logic must be able to identify this special case (likely via the `Calculation_Method` field in the main `[DB] Investors]` sheet from the sandbox data) and apply a different set of rules to calculate this investor's portfolio value and future payments.

### 3. Group Dashboard Sheets (e.g., `SG1`, `Chayil`)

-   **Purpose:** To serve as a management dashboard for a specific investment group, calculating its overall financial health and key performance indicators (KPIs).

-   **Key KPIs (Row 2):**
    -   **Total Funds:** The sum of all investors' current balances in this group. `(SUM of Investor Balance column)`
    -   **Total Note Values:** The sum of the Unpaid Principal Balances (UPB) of all properties assigned to this group. `(SUM of Asset UPB column)`
    -   **Collateral Coverage Ratio:** The core health metric of the group. `(Total Note Values / Total Funds)`. This cell has conditional formatting to turn red if it drops below a target (e.g., 125%).

-   **Investors Table (Columns A-C):**
    -   A list of all investors participating in this group.
    -   `Investor`: The investor's name.
    -   `Current Balance`: The investor's total current balance, pulled from their individual ledger sheet (e.g., from cell `K5` of the investor's sheet).
    -   `Percentage`: The investor's percentage of ownership in the pool. `(Investor's Balance / Total Funds)`

-   **Assets Table (Columns E-F):**
    -   A list of all properties assigned to this group.
    -   This data is dynamically pulled and filtered from the `Pool Properties` sheet using a `QUERY` formula, showing only the properties where Column A in `Pool Properties` matches the current group's name.
    -   `property`: The name of the asset.
    -   `current UPB`: The current unpaid balance of that asset.

### 4. Asset-to-Group Mapping Sheet (`Pool Properties`)

-   **Purpose:** This sheet serves as the central administrative interface for **assigning properties to investment groups**. It is the critical link between the BMS (which tracks assets) and the investor-side logic.
-   **Structure & Workflow:**
    -   **Column A (`pool`):** A **manual input** column with a dropdown list (Data Validation) containing the available `Group_ID`s (e.g., `SG1`, `Chayil`). The business manager uses this column to assign each property to a group.
    -   **Columns B & C (`property`, `current UPB`):** These columns are populated automatically by an `IMPORTRANGE` formula that pulls the complete list of assets and their current Unpaid Principal Balance (UPB) from the BMS spreadsheet.
-   **Business Logic:**
    -   This sheet is the "source of truth" for the asset allocation that underpins each investment group.
    -   The ultimate goal is to use this allocation data to calculate metrics for each group, such as the **Collateral Coverage Ratio**, ensuring it meets targets like 125%. The calculations themselves are performed in the individual group sheets (e.g., `SG1`, `Chayil`).

---

## Implications for Apps Script API

-   **No Simple Tables:** We cannot simply query a single table. To get an investor's data, we must open their specific sheet.
-   **Authentication:** The API will need a way to map a logged-in user (e.g., by email) to their specific sheet name (e.g., "hila kligman").
-   **Calculations:** To get "Future Payments", the Apps Script will need to replicate the interest calculation logic found in the investor sheets.
-   **Data Aggregation:** To get a summary for an investor, the script will need to read their entire ledger sheet and perform calculations, such as summing all payments from column D. 