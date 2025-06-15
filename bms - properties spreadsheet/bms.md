# Business Management System - Documentation

**Version:** 2.1.2
**Objective:** To document the core business logic, data models, and formulas used in the Google Sheets-based management system. This document will serve as the source of truth for system maintenance, formula updates, and the development of future application layers.

---

## Module 1: Land Contract (LC) Management

**Sheet:** `House template` (This serves as a template for each individual property/LC sheet)

### 1.1. Purpose

This sheet is the central operational hub for a single Land Contract (LC). It tracks all financial details from two perspectives:

1.  **The Buyer's Loan:** The standard amortization of the loan given to the home buyer.
2.  **The Company's Investment (as "Segula"):** The performance and profitability of the LC note, which was purchased at a discount from the originating entity (e.g., "Chayil").

### 1.2. Key Data Areas & Logic

#### 1.2.1. Header & Core Data (Rows 1-13)

*   **Identification (Rows 1-5):** Contains links (ClickUp, Google Drive) and static data for the LLC, property address, and borrower information. This is for reference and manual input.
*   **Loan & Deal Structure (Cells B8:D12):**
    *   **`B8 (price to buyer)`**: Input. The full sale price to the end-buyer.
    *   **`B9 (down payment)`**: Input.
    *   **`B10 (loan amount)`**: Formula: `=B8-B9`. The initial principal of the loan to the buyer.
    *   **`B11 (rate)`**: Input. The buyer's annual interest rate.
    *   **`B12 (monthly payment)`**: Input. **Crucially, this is a manually entered P&I payment**, not calculated via `PMT`. This allows for non-standard payment schedules.
    *   **`D9 (Discount amount)`**: Input. The discount percentage at which the company (Segula) buys the note (e.g., 0.20 for a 20% discount).
    *   **`D10 (Price to segula)`**: Formula: `=(1-$D$9)*B10`. The actual price the company paid for the LC asset. This is the company's "cost basis" for this investment.
    *   **`D12 (Starting Date)`**: Input. The date of the *first payment* due on the loan.

*   **Current Status (Cells B13 & D8):**
    *   **`B13 (Current UPB)`**: Formula: `=IFERROR(INDEX(L19:L, MATCH(TEXT(TODAY(),"MMM-YYYY"), B19:B, 0)), "Didnt find")`.
        *   **Logic:** Attempts to find the current Unpaid Principal Balance (UPB). It takes today's month and year (e.g., "Jul-2024"), tries to find an exact match in the `Date` column (Column B) of the payment schedule, and returns the corresponding UPB from Column L.
        *   **CRITICAL FLAW:** This formula is unreliable. It only works if a payment happens *exactly* in the current month and the `Date` column format is exactly "Mmm-yyyy".
        *   **Recommended Fix:** `=LOOKUP(2,1/(L19:L<>""),L19:L)`. This robustly finds the last non-empty value in the UPB column.
    *   **`D8 (Number of payment)`**: Formula: `=INDEX(FILTER(S18:S, X18:X<0), 1)`.
        *   **Logic:** A clever method to find the loan term. It looks at the "Original Buyer Loan" amortization schedule (Columns R-X), filters the `payment number` column (S) for all rows where the `Ending UPB` (Column X) is less than zero (i.e., the loan is paid off), and takes the first result. This finds the payment number where the loan term ends.

#### 1.2.2. Yearly Financial Summary (Columns G-X, Rows 3-13)

*   **Purpose:** Aggregates the monthly data from the payment schedule below into annual totals.
*   **Headers (Row 2):** `H2:X2` contain the years (e.g., 2022, 2023, ...).
*   **Formulas (General Structure):** The formulas in rows 5-13 use `SUMIFS` to sum values from a specific column in the payment schedule (rows 19-1002) if the date in column B falls within the given year.
    *   **Example (Cell H5 - City Taxes for year in H2):** `=SUMIFS($F$19:$F$1002, $B$19:$B$1002, "*" & H$2)`
        *   **Logic:** Sums all values in the `taxes` column (F) where the `Date` column (B) contains the year from H2 (e.g., contains "2023").
        *   **Note:** This is a weak check, as it relies on text matching. A date-based check (`>=DATE(H2,1,1)` and `<=DATE(H2,12,31)`) is more robust.
    *   This pattern repeats for `Insurance` (G), `Interest payed` (H), `Principal payed` (I), etc.

#### 1.2.3. Payment Schedule & Amortization Tables (Rows 18 onwards)

This is the core of the sheet, with two parallel tables.

*   **Table 1: Company's Servicing Ledger (Columns A-M)**
    *   This table tracks what actually happens with payments received from the buyer.
    *   **Inputs:** `C (Payments recieved)`, `E (late fees)`, `F (taxes)`, `G (insurance)` are the primary manual inputs for each payment.
    *   **`B19` (Date):** `=TRIM(R19)`. It pulls the calculated date ("mmm-yyyy") from the buyer's amortization schedule, linking the two tables.
    *   **`D19` (Net Payment):** `=C19-E19-F19-G19`. Calculates the net amount available to service the loan's Principal & Interest (P&I) after deducting fees and escrow.
    *   **`H19` (interest):** `=V19`. Pulls the *standard* interest portion from the buyer's amortization schedule.
    *   **`I19` (principal):** `=C19-E19-F19-G19-H19`. This is the actual principal portion paid, calculated as (Total Received) - (Deductions) - (Standard Interest).
    *   **`J19` (principal payback):** `=I19*(1-$D$9)`. **Key for company profit.** It's the portion of the principal paid that is considered payback of the company's investment.
    *   **`K19` (profit on discount):** `=I19*$D$9`. **The other key profit component.** It's the portion of the principal paid that represents the realization of the discount.
    *   **`L19` (UPB):** `=U19 - I19`. The Unpaid Principal Balance from the buyer's perspective.
    *   **Conditional Logic:** Most formulas in this section are wrapped in an `IF(AND(...), ..., "")` check. This ensures that calculations only appear for months that have already passed, keeping the sheet clean for future entries.

*   **Table 2: Original Buyer Loan Amortization (Columns R-X)**
    *   This is a **standard loan amortization schedule**. It shows what *should* happen each month if the buyer pays exactly on time.
    *   **`R19` (Date):** `=TEXT(EDATE(D12,1),"mmm-yyyy")`. Generates the first payment month based on the loan's `Starting Date` (D12). `R20` and subsequent rows continue the sequence monthly.
    *   **`T19` (Monthly Payment):** `=$B$12`. Fixed reference to the agreed P&I payment.
    *   **`U19` (Opening Balance):** `=B10` for the first payment, `=X18` (previous ending balance) for subsequent payments.
    *   **`V19` (Interest):** `=U19*$B$11/12`. Standard interest calculation.
    *   **`W19` (Principal):** `=T19-V19`. Standard principal calculation.
    *   **`X19` (UPB):** `=U19-W19`. Standard closing balance.

---

## Module 2: Aggregated Reporting

**Sheet:** `Summary`

### 2.1. Purpose
Provides a high-level, dynamic financial overview of all properties for a user-selected period (Yearly, Monthly, or Quarterly).

### 2.2. Logic

*   **User Inputs:** `F5 (Year)`, `G5 (Period Type: "Yearly", "Monthly", "QTR1", etc.)`, `H5 (Month Number, if G5 is "Monthly")`.
*   **Core Formula (in C8, D8, etc.):** The sheet uses a large, nested `IFS` formula to handle the different period types.
    *   **Formula Structure:** `=IFS(Period="Yearly", [Yearly Logic], Period="Monthly", [Monthly Logic], Period="QTR1", [QTR1 Logic], ...)`
*   **Yearly Logic:**
    *   Uses `INDEX/MATCH` on the **Yearly Financial Summary** section of the corresponding `House template` sheet (identified by sheet name in column A) to find the intersection of the Metric (e.g., "City Taxes") and the selected Year.
*   **Monthly/Quarterly Logic:**
    *   Uses a combination of `SUMIFS`, `INDIRECT`, and `VLOOKUP` to dynamically build and sum ranges.
    *   It looks up the metric name (e.g., "City Taxes") in a `Config` sheet to find the corresponding column letter in the `House template`.
    *   It then uses `INDIRECT` to construct a valid range reference (e.g., `'House Name'!F19:F999`).
    *   Finally, `SUMIFS` sums this range if the date column matches the selected month or months (for quarters).

---

## Module 3: Google Apps Script for Documentation

**File:** `extractFormulas.gs`

### 3.1. Purpose
This script automates the process of extracting and documenting all formulas from the key sheets in the spreadsheet. It is designed to be efficient by processing a "template" sheet once and assuming other "house" sheets follow the same structure, thus avoiding redundant processing and long execution times.

### 3.2. Configuration
The script's behavior is controlled by a `CONFIG` object at the top of the file.

```javascript
const CONFIG = {
  // The name of the master template sheet for house LCs.
  templateSheetName: "House template",

  // A Regular Expression to identify individual house sheets to be skipped if the template is processed.
  // This pattern must be updated to match the specific naming convention of the house sheets.
  houseSheetNamePattern: /^(Copy of \d{4} E \d{2} ST \d?|\d{4} E \d{2} ST \d?)$/i, 

  // A list of other unique sheets that must always be processed.
  otherSheetsToProcess: ["Investors", "Certificates", "Investments Groups", "Summary", "Monthly payment"],

  // Controls where the output is sent.
  outputToNewSheet: true, // true = new sheet, false = execution log
  outputSheetName: "Formula_Documentation"
};