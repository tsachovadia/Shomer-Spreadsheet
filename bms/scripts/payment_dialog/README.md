# Project: Payment Entry Dialog

This project contains the Google Apps Script code for a "Payment Entry Dialog" used within the BMS Google Sheet.

## 1. Purpose

The goal of this tool is to provide a user-friendly and controlled way for an operator (e.g., an employee) to enter new payment information into the system. It abstracts away the complexity of finding the correct sheet and row, reduces the chance of manual errors, and ensures data is entered in a consistent format.

## 2. How It Works

The system is composed of two files:
- `code.gs`: The server-side logic that runs on Google's servers.
- `PaymentDialog.html`: The client-side user interface that the user sees.

### Workflow:
1.  **Initiation:** The user clicks on the custom menu "Payment Management" -> "Enter New Payment" in the Google Sheet. This is triggered by the `onOpen()` function.
2.  **Dialog Display:** The `showPaymentDialog()` function is called, which displays the `PaymentDialog.html` file as a modal dialog.
3.  **Data Population:** The HTML file, upon loading, calls back to `code.gs` to run `getPropertiesList()`. This function fetches all the property names from the "Monthly payment" sheet to populate a dropdown menu.
4.  **User Interaction:**
    - The user selects a property from the list.
    - The dialog likely calls `getPropertyOwesAmount()` to display any outstanding balance to the user.
    - The user selects a payment date.
    - The dialog calls `getExistingData()` to check if a payment for that property and date already exists, potentially warning the user.
    - The user enters a payment amount and optional notes.
5.  **Submission:** The user clicks "Submit". The HTML side gathers all the data into a single `paymentData` object.
6.  **Processing:** The `paymentData` object is sent to the `processPayment()` function in `code.gs`.
    - This function performs final server-side validation.
    - It locates the correct property sheet and the correct row based on the date.
    - It enters the amount into the payment column (`C`) and appends the timestamped notes to the notes column (`N`).
    - It returns a success or error message, which is then displayed to the user in the dialog.

## 3. Maintenance & Improvements

- **Adding a Property:** To make a new property appear in the dialog's dropdown, it must be added manually to the list of properties in the "Monthly payment" sheet (Column A).
- **Changing Target Columns:** The columns for payment (`C`) and notes (`N`) are defined in the `CONFIG` object at the top of `code.gs` and can be easily changed there.
- **UI Changes:** All visual and layout changes should be made in `PaymentDialog.html`.
- **Future Improvements:** Consider creating a more robust logging system for failed payments. 