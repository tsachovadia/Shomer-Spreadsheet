/**
 * Import necessary modules from the Firebase Functions SDK.
 */
const { HttpsError } = require("firebase-functions/v2/https");
const { beforeUserCreated } = require("firebase-functions/v2/identity");
const logger = require("firebase-functions/logger");

// IMPORTANT: Replace this placeholder with the actual URL of your deployed Google Apps Script.
// This URL is obtained after you deploy your Apps Script project as a Web App.
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw8PaMFe_Ksfguw7pKloVPL0MKfk48m91_XBj6LVzFbxkKIZUBLD3DinzasMoTPVcom/exec";

/**
 * A Cloud Function that triggers before a user is created in Firebase Authentication.
 * This function checks an external Google Apps Script to see if the user's email
 * is on an authorized list in a Google Sheet.
 */
exports.blockUnauthorizedUsers = beforeUserCreated(async (event) => {
  const user = event.data;
  const userEmail = user.email;

  // Ensure the user has an email address.
  if (!userEmail) {
    logger.log(`Sign-up attempt without an email. UID: ${user.uid}`);
    throw new HttpsError('invalid-argument', 'Email is required to sign up.');
  }

  logger.log(`Starting authorization check for email: ${userEmail}`);

  // Construct the URL for the authorization check.
  const authCheckUrl = `${APPS_SCRIPT_URL}?action=isAuthorized&email=${encodeURIComponent(userEmail)}`;

  try {
    // Call the Google Apps Script Web App.
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(authCheckUrl);
    const data = await response.json();

    logger.log(`Received authorization response for ${userEmail}:`, data);

    // If the script confirms the user is authorized, allow creation.
    if (data.isAuthorized) {
      logger.log(`Authorization successful for ${userEmail}. Allowing user creation.`);
      return;
    } else {
      // If the user is not authorized, block creation by throwing an error.
      logger.log(`Authorization failed for ${userEmail}. Blocking user creation.`);
      throw new HttpsError('permission-denied', 'This email address is not authorized to create an account.');
    }
  } catch (error) {
    // If any error occurs during the fetch (e.g., script is down, network issues),
    // we block the user by default for security.
    logger.error(`Error during authorization check for ${userEmail}:`, error);
    throw new HttpsError('internal', 'Could not verify authorization. Please try again later.');
  }
});

