const SPREADSHEET_ID = '1dMpnv4KoKcZfuhd8WoIS8hrG39hLW5Ldh38BTMSvkJk';
const PORTAL_USERS_SHEET_NAME = '[DB] Portal_Users';

/**
 * Main entry point for the Web App. This function acts as a router.
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    let response;

    switch (action) {
      case 'isAuthorized':
        response = isUserAuthorized(e.parameter.email);
        break;
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
        break;
    }
    
    return createJsonResponse(response);
  } catch (error) {
    Logger.log(error);
    return createJsonResponse({ error: `An error occurred: ${error.message}` });
  }
}

/**
 * Creates a JSON response.
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Checks if a user's email exists in the portal users sheet.
 */
function isUserAuthorized(email) {
  if (!email) {
    throw new Error("Email parameter is required for authorization check.");
  }
  
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usersSheet = ss.getSheetByName(PORTAL_USERS_SHEET_NAME);
  if (!usersSheet) throw new Error(`Sheet '${PORTAL_USERS_SHEET_NAME}' not found.`);

  const usersData = usersSheet.getDataRange().getValues();

  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === email) {
      return { isAuthorized: true };
    }
  }

  return { isAuthorized: false };
}

function getUserDashboard(email) {
  if (!email) {
    throw new Error("Email parameter is required.");
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  const usersSheet = ss.getSheetByName(PORTAL_USERS_SHEET_NAME);
  if (!usersSheet) throw new Error(`Sheet '${PORTAL_USERS_SHEET_NAME}' not found.`);
  
  const usersData = usersSheet.getDataRange().getValues();
  let investorSheetName = '';
  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === email) {
      investorSheetName = usersData[i][1];
      break;
    }
  }

  if (!investorSheetName) throw new Error('Investor not found.');

  const investorSheet = ss.getSheetByName(investorSheetName);
  if (!investorSheet) throw new Error(`Investor sheet '${investorSheetName}' not found.`);

  const fullName = investorSheet.getRange('B2').getValue();
  const currentBalance = investorSheet.getRange('K5').getValue();
  const qPayment = investorSheet.getRange('L5').getValue();
  const investmentGroupId = investorSheet.getRange('M5').getValue();
  
  const ledgerRange = investorSheet.getRange('A4:F'); 
  const rawLedgerData = ledgerRange.getValues();
  const ledgerHeaders = rawLedgerData.shift(); // Remove header row
  
  const fullLedgerData = rawLedgerData.map(row => {
    // Stop if the row is empty (based on the date column)
    if (!row[0]) return null;

    return {
      date: row[0],
      openingBalance: row[1],
      deposit: row[2],
      withdrawal: row[3],
      interest: row[4],
      endingBalance: row[5]
    };
  }).filter(Boolean); // Filter out null values for empty rows

  const nextPaymentDate = getNextPaymentDate();

  return {
    fullName: fullName,
    currentBalance: currentBalance,
    nextPaymentAmount: qPayment,
    nextPaymentDate: nextPaymentDate,
    investmentGroupId: investmentGroupId,
    ledgerData: fullLedgerData // The new, full ledger data
  };
}

function getGroupDetails(groupId) {
    if (!groupId) throw new Error("groupId parameter is required.");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const groupSheet = ss.getSheetByName(groupId);

    if (!groupSheet) throw new Error(`Group sheet '${groupId}' not found.`);

    // Create a map of investor names to emails for efficient lookup
    const usersSheet = ss.getSheetByName(PORTAL_USERS_SHEET_NAME);
    if (!usersSheet) throw new Error(`Sheet '${PORTAL_USERS_SHEET_NAME}' not found.`);
    const usersData = usersSheet.getDataRange().getValues();
    const emailMap = usersData.reduce((map, row) => {
      // Assuming email is in col 0 and investor sheet name (used as name) is in col 1
      map[row[1]] = row[0];
      return map;
    }, {});

    const partnershipLink = groupSheet.getRange("B2").getValue();
    const collateralRatio = groupSheet.getRange("F2").getDisplayValue();
    const totalFunds = parseFloat(String(groupSheet.getRange("D2").getValue()).replace(/[^0-9.-]+/g,"")) || 0;
    
    const investorsDataRange = groupSheet.getRange("A5:C").getValues();
    const investorMix = [];
    for (let i = 0; i < investorsDataRange.length; i++) {
        if (!investorsDataRange[i][0]) {
            break; 
        }
        const investorName = investorsDataRange[i][0];
        investorMix.push({
            investor: investorName,
            email: emailMap[investorName] || null, // Add email from the map
            currentBalance: investorsDataRange[i][1],
            percentage: investorsDataRange[i][2]
        });
    }

    const assetsDataRange = groupSheet.getRange("E5:F").getValues();
    const associatedAssets = [];
    for (let i = 0; i < assetsDataRange.length; i++) {
        if (assetsDataRange[i][0]) {
            associatedAssets.push({
                property: assetsDataRange[i][0],
                currentUPB: assetsDataRange[i][1]
            });
        } else {
            break;
        }
    }

    return {
        groupName: groupId,
        partnershipAgreementLink: partnershipLink,
        collateralCoverageRatio: collateralRatio,
        totalFunds: totalFunds,
        investorMix: investorMix,
        associatedAssets: associatedAssets
    };
}

function getNextPaymentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  if (month < 3) return `${year}-04-01`;
  if (month < 6) return `${year}-07-01`;
  if (month < 9) return `${year}-10-01`;
  return `${year + 1}-01-01`;
}

function loginUser(email, password) {
  if (!email || !password) throw new Error("Email and password are required.");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const usersSheet = ss.getSheetByName(PORTAL_USERS_SHEET_NAME);
  if (!usersSheet) throw new Error(`Sheet '${PORTAL_USERS_SHEET_NAME}' not found.`);

  const usersData = usersSheet.getDataRange().getValues();
  const passwordHash = computeSha256Hash(password);

  for (let i = 1; i < usersData.length; i++) {
    if (usersData[i][0] === email) {
      const storedHash = usersData[i][3];
      if (storedHash === passwordHash) {
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

function computeSha256Hash(input) {
  const anArray = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  let str = '';
  for (let i = 0; i < anArray.length; i++) {
    let hex = (anArray[i] < 0 ? anArray[i] + 256 : anArray[i]).toString(16);
    str += (hex.length === 1 ? '0' : '') + hex;
  }
  return str;
}

function testHash() {
  const password = "REPLACE_WITH_YOUR_PASSWORD";
  const hash = computeSha256Hash(password);
  Logger.log(`Password: ${password}`);
  Logger.log(`SHA-256 Hash: ${hash}`);
}
 