// Config
const SPREADSHEET_ID = '1dMpnv4KoKcZfuhd8WoIS8hrG39hLW5Ldh38BTMSvkJk';
const PORTAL_USERS_SHEET_NAME = '[DB] Portal_Users';

/**
 * Main entry point for the Web App. This function acts as a router.
 * It reads the 'action' parameter from the request and calls the appropriate function.
 * @param {Object} e - The event parameter from the HTTP request.
 * @returns {ContentService.TextOutput} - The JSON response.
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    let response;

    switch (action) {
      case 'login':
        response = loginUser(e.parameter.email, e.parameter.password);
        break;
      case 'getUserDashboard':
        response = getUserDashboard(e.parameter.email);
        break;
      case 'getGroupDetails':
        response = getGroupDetails(e.parameter.groupId);
        break;
      default:
        response = { error: "Invalid action specified." };
    }
    
    return createJsonResponse(response);
  } catch (error) {
    Logger.log(error);
    return createJsonResponse({ error: `An error occurred: ${error.message}` });
  }
}

/**
 * Creates a JSON response with appropriate headers for CORS.
 * @param {Object} data - The data object to be converted to JSON.
 * @returns {ContentService.TextOutput}
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- API Functions (Stubs for now) ---

/**
 * Fetches dashboard data for a specific investor.
 * @param {string} email - The email of the investor to look up.
 * @returns {Object} - The dashboard data.
 */
function getUserDashboard(email) {
  if (!email) {
    throw new Error("Email parameter is required.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // 1. Find the investor's sheet name from the Portal_Users sheet
  const usersSheet = ss.getSheetByName(PORTAL_USERS_SHEET_NAME);
  if (!usersSheet) {
    throw new Error(`Sheet '${PORTAL_USERS_SHEET_NAME}' not found.`);
  }
  const usersData = usersSheet.getDataRange().getValues();
  let investorSheetName = '';
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === email) {
      investorSheetName = usersData[i][1];
      break;
    }
  }

  if (!investorSheetName) {
    throw new Error('Investor not found.');
  }

  // 2. Get data from the specific investor's sheet
  const investorSheet = ss.getSheetByName(investorSheetName);
  if (!investorSheet) {
    throw new Error(`Investor sheet '${investorSheetName}' not found.`);
  }

  const fullName = investorSheet.getRange('B2').getValue();
  const currentBalance = investorSheet.getRange('K5').getValue();
  const qPayment = investorSheet.getRange('L5').getValue();
  const investmentGroupId = investorSheet.getRange('M5').getValue();
  
  // 3. Calculate total investment by summing column C
  const investmentColumn = investorSheet.getRange('C5:C').getValues();
  const totalInvestment = investmentColumn.reduce((sum, row) => sum + (parseFloat(row[0]) || 0), 0);

  // 4. Calculate next payment date
  const nextPaymentDate = getNextPaymentDate();

  return {
    fullName: fullName,
    totalInvestment: totalInvestment,
    currentBalance: currentBalance,
    nextPaymentAmount: qPayment,
    nextPaymentDate: nextPaymentDate,
    investmentGroupId: investmentGroupId
  };
}

/**
 * Fetches details for a specific investment group.
 * @param {string} groupId - The ID of the group (e.g., "SG1").
 * @returns {Object} - The group details.
 */
function getGroupDetails(groupId) {
  if (!groupId) {
    throw new Error("groupId parameter is required.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const groupSheet = ss.getSheetByName(groupId);

  if (!groupSheet) {
    throw new Error(`Group sheet '${groupId}' not found.`);
  }

  // Fetching data as per the blueprint
  const partnershipLink = groupSheet.getRange("B2").getValue();
  
  const investorsDataRange = groupSheet.getRange("A5:C").getValues();
  const investorMix = [];
  for (let i = 0; i < investorsDataRange.length; i++) {
    if (investorsDataRange[i][0]) { // If investor name is not empty
      investorMix.push({
        investor: investorsDataRange[i][0],
        currentBalance: investorsDataRange[i][1],
        percentage: investorsDataRange[i][2]
      });
    } else {
      break; // Stop when an empty row is found
    }
  }

  const assetsDataRange = groupSheet.getRange("E5:F").getValues();
  const associatedAssets = [];
  for (let i = 0; i < assetsDataRange.length; i++) {
    if (assetsDataRange[i][0]) { // If property name is not empty
      associatedAssets.push({
        property: assetsDataRange[i][0],
        currentUPB: assetsDataRange[i][1]
      });
    } else {
      break; // Stop when an empty row is found
    }
  }

  return {
    groupName: groupId,
    partnershipAgreementLink: partnershipLink,
    investorMix: investorMix,
    associatedAssets: associatedAssets
  };
}

/**
 * Calculates the next quarterly payment date based on today's date.
 * Payment dates are Jan 1, Apr 1, Jul 1, Oct 1.
 */
function getNextPaymentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (0=Jan, 1=Feb, ...)

  if (month < 3) { // Jan, Feb, Mar -> Next payment is Apr 1
    return `${year}-04-01`;
  } else if (month < 6) { // Apr, May, Jun -> Next payment is Jul 1
    return `${year}-07-01`;
  } else if (month < 9) { // Jul, Aug, Sep -> Next payment is Oct 1
    return `${year}-10-01`;
  } else { // Oct, Nov, Dec -> Next payment is Jan 1 of next year
    return `${year + 1}-01-01`;
  }
}

function loginUser(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required.");
  }
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usersSheet = ss.getSheetByName(PORTAL_USERS_SHEET_NAME);
  if (!usersSheet) {
    throw new Error(`Sheet '${PORTAL_USERS_SHEET_NAME}' not found.`);
  }

  const usersData = usersSheet.getDataRange().getValues();
  const passwordHash = computeSha256Hash(password);

  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === email) {
      const storedHash = usersData[i][3]; // Assuming password hash is in column D
      if (storedHash === passwordHash) {
        // In a real app, return a session token. For now, just confirm success.
        return { 
          status: "success",
          user: {
            email: usersData[i][0],
            sheetName: usersData[i][1],
            investorId: usersData[i][2]
          }
        };
      }
    }
  }

  throw new Error("Invalid email or password.");
}

/**
 * Computes the SHA-256 hash of a string.
 * @param {string} input The string to hash.
 * @return {string} The hexadecimal representation of the hash.
 */
function computeSha256Hash(input) {
  const anArray = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  let str = '';
  for (let i = 0; i < anArray.length; i++) {
    let hex = (anArray[i] < 0 ? anArray[i] + 256 : anArray[i]).toString(16);
    str += (hex.length === 1 ? '0' : '') + hex;
  }
  return str;
}

/**
 * A utility function to help you generate password hashes from the Apps Script editor.
 * To use it:
 * 1. Enter a password string as the argument.
 * 2. In the Apps Script editor, select "testHash" from the function dropdown.
 * 3. Click "Run".
 * 4. Check the Execution Log (View > Logs) to see the generated hash.
 * 5. Copy this hash into the '[DB] Portal_Users' sheet in the 'PasswordHash' column.
 */
function testHash() {
  const password = "REPLACE_WITH_YOUR_PASSWORD"; // <-- Change this password
  const hash = computeSha256Hash(password);
  Logger.log(`Password: ${password}`);
  Logger.log(`SHA-256 Hash: ${hash}`);
} 