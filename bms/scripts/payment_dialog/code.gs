// File: Code.gs (Version 8 - Definitive UI Logic)

// Configuration settings
const CONFIG = {
  paymentColumn: 'C',
  notesColumn: 'N',
  dateColumn: 'B'
};

/**
 * Creates the custom menu when the spreadsheet is opened.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Payment Management')
    .addItem('Enter New Payment', 'showPaymentDialog')
    .addToUi();
}

/**
 * Displays the HTML dialog.
 */
function showPaymentDialog() {
  const html = HtmlService.createHtmlOutputFromFile('PaymentDialog')
    .setWidth(450)
    .setHeight(550);
  SpreadsheetApp.getUi().showModalDialog(html, 'Enter New Payment');
}

/**
 * Returns a filtered list of property names from the 'Monthly payment' sheet.
 */
function getPropertiesList() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const monthlyPaymentSheetName = 'Monthly payment';
  const sheet = ss.getSheetByName(monthlyPaymentSheetName);
  if (!sheet) return ["Error: 'Monthly payment' sheet not found"];
  
  try {
    const range = sheet.getRange(`A2:A${sheet.getLastRow()}`);
    const values = range.getValues();
    return values
      .map(row => row[0])
      .filter(String)
      .filter(prop => prop.toLowerCase().trim() !== 'property');
  } catch (e) {
    return [`Error: ${e.message}`];
  }
}

/**
 * Returns the "Property Owes" amount.
 */
function getPropertyOwesAmount(propertyName) {
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
      // NOTE: Changed from Shekel (₪) to Dollar ($)
      return (typeof owesAmount === 'number') ? `$${owesAmount.toFixed(2)}` : (owesAmount || "Not specified");
    } else {
      return "Property not found";
    }
  } catch (e) {
    return "Error calculating amount";
  }
}

/**
 * Gets all existing data (payment and notes) for a given property and date in one go.
 * @returns {object} An object with existingPayment and existingNotes properties.
 */
function getExistingData(propertyName, paymentDate) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(propertyName);
    if (!sheet) return { error: `Sheet '${propertyName}' not found.` };

    const dateRange = sheet.getRange(`${CONFIG.dateColumn}19:${CONFIG.dateColumn}${sheet.getLastRow()}`);
    const dateValues = dateRange.getValues();
    
    for (let i = 0; i < dateValues.length; i++) {
      if (dateValues[i][0] == paymentDate) {
        const targetRow = i + 19;
        const paymentValue = sheet.getRange(`${CONFIG.paymentColumn}${targetRow}`).getDisplayValue();
        const notesValue = sheet.getRange(`${CONFIG.notesColumn}${targetRow}`).getValue().toString().trim();
        return {
          existingPayment: paymentValue || null,
          existingNotes: notesValue || null
        };
      }
    }
    return { existingPayment: null, existingNotes: null }; // No matching date found
  } catch (e) {
    return { error: `Error: ${e.message}` };
  }
}

/**
 * Processes payment and appends notes.
 */
function processPayment(paymentData) {
  const { propertyName, paymentDate, amount, notes, overwrite } = paymentData;
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const propertySheet = ss.getSheetByName(propertyName); 
    if (!propertySheet) {
      return { status: 'error', message: `Property sheet named '${propertyName}' not found.` };
    }
    
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
      return { status: 'error', message: `Could not find row for date ${paymentDate}.` };
    }
    
    // --- Update Payment Cell ---
    const paymentCell = propertySheet.getRange(`${CONFIG.paymentColumn}${targetRow}`);
    // Check for existing payment on the server side as a final validation
    const existingPayment = paymentCell.getDisplayValue();
    if (existingPayment && !overwrite) {
      return { 
        status: 'exists', 
        message: `Payment already exists: ${existingPayment}. Do you want to overwrite it?`
      };
    }
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