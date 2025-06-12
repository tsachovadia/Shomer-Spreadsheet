// File: Code.gs (Version 7 - Final & Corrected)

// Configuration settings
const CONFIG = {
  paymentColumn: 'C', // The column for the actual payment amount ('Payments recieved')
  notesColumn: 'N',   // The column for notes
  dateColumn: 'B'     // The column for the date in 'Mmm-yyyy' format
};

/**
 * Runs when the spreadsheet is opened and creates a custom menu.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Payment Management')
    .addItem('Enter New Payment', 'showPaymentDialog')
    .addToUi();
}

/**
 * Displays the HTML dialog for entering a new payment.
 */
function showPaymentDialog() {
  const html = HtmlService.createHtmlOutputFromFile('PaymentDialog')
    .setWidth(450)
    .setHeight(550); // Restored original height
  SpreadsheetApp.getUi().showModalDialog(html, 'Enter New Payment');
}

/**
 * Returns a list of all property names.
 */
function getPropertiesList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const monthlyPaymentSheetName = 'Monthly payment';
  const sheet = ss.getSheetByName(monthlyPaymentSheetName);
  if (!sheet) return ["Error: 'Monthly payment' sheet not found"];
  
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    
    const range = sheet.getRange(`A2:A${lastRow}`);
    const values = range.getValues();
    const properties = values
      .map(row => row[0])
      .filter(String)
      .filter(prop => prop.toLowerCase().trim() !== 'property');
    return properties;
  } catch (e) {
    return [`Error reading data: ${e.message}`];
  }
}

/**
 * Returns the "Property Owes" amount from the 'Monthly payment' sheet.
 */
function getPropertyOwesAmount(propertyName) {
  // This function remains unchanged
  const monthlyPaymentSheetName = 'Monthly payment';
  const owesColumn = 'N';

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(monthlyPaymentSheetName);
    if (!sheet) return "'Monthly payment' sheet not found";
    
    const propertyNamesRange = sheet.getRange(`A2:A${sheet.getLastRow()}`);
    const match = propertyNamesRange.createTextFinder(propertyName).findNext();
    
    if (match) {
      const row = match.getRow();
      const owesAmount = sheet.getRange(`${owesColumn}${row}`).getValue();
      return (typeof owesAmount === 'number') ? `₪${owesAmount.toFixed(2)}` : (owesAmount || "Not specified");
    } else {
      return "Property not found in table";
    }
  } catch (e) {
    return "Error calculating amount";
  }
}

/**
 * Processes and saves the payment, and appends notes.
 */
function processPayment(paymentData) {
  const { propertyName, paymentDate, amount, notes, overwrite } = paymentData;
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const propertySheet = ss.getSheetByName(propertyName); 
    if (!propertySheet) {
      return { status: 'error', message: `Property sheet named '${propertyName}' not found.` };
    }
    
    // Find Target Row
    const dateRange = propertySheet.getRange(`${CONFIG.dateColumn}19:${CONFIG.dateColumn}${propertySheet.getLastRow()}`);
    const dateValues = dateRange.getValues();
    let targetRow = -1;
    for (let i = 0; i < dateValues.length; i++) {
      if (dateValues[i][0] == paymentDate) {
        targetRow = i + 19;
        break;
      }
    }
    if (targetRow === -1) {
      return { status: 'error', message: `Could not find row for date ${paymentDate} in this property's sheet.` };
    }
    
    const paymentCell = propertySheet.getRange(`${CONFIG.paymentColumn}${targetRow}`);
    const existingPayment = paymentCell.getDisplayValue();
    
    // Check for existing payment without overwrite flag
    if (existingPayment && !overwrite) {
      return { 
        status: 'exists', 
        message: `Payment already exists: ${existingPayment}. Do you want to overwrite it?`
      };
    }
    
    // --- Update Payment Cell ---
    paymentCell.setFormula('=' + amount);
    
    // --- Append Notes if provided ---
    if (notes) {
      const notesCell = propertySheet.getRange(`${CONFIG.notesColumn}${targetRow}`);
      const existingNotes = notesCell.getValue().toString().trim();
      const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy");
      const noteToAdd = `(${timestamp}) ${notes}`;
      const updatedNotes = existingNotes ? `${existingNotes}\n${noteToAdd}` : noteToAdd;
      notesCell.setValue(updatedNotes);
    }
    
    SpreadsheetApp.flush();
    return { status: 'success', message: 'Payment applied successfully!' };

  } catch (e) {
    Logger.log(e);
    return { status: 'error', message: `A general error occurred: ${e.message}` };
  }
}