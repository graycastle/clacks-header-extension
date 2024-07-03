const tabHeaders = new Map();

/**
 * Listener function to capture the response headers and store the X-Clacks-Overhead value in tabHeaders map.
 * @param {Object} details - Details of the web request.
 */
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    // Check if the tabId is already present in tabHeaders map
    if (tabHeaders.has(details.tabId)) {
      return;
    }

    // Find the X-Clacks-Overhead header in the response headers
    const xClacksOverhead = details.responseHeaders.find(
      header => header.name.toLowerCase() === 'x-clacks-overhead'
    );

    // If X-Clacks-Overhead header is found, store the value in tabHeaders map
    if (xClacksOverhead) {
      tabHeaders.set(details.tabId, xClacksOverhead.value);
    }
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

/**
 * Listener function to capture the tab update event and send a message to the content script.
 * @param {number} tabId - The ID of the updated tab.
 * @param {Object} changeInfo - Information about the tab update.
 * @param {Object} tab - The updated tab object.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Check if the tab update is complete
  if (changeInfo.status === 'complete') {
    // Get the X-Clacks-Overhead header value from tabHeaders map
    const headerValue = tabHeaders.get(tabId);
    // If the header value exists, send a message to the content script
    if (headerValue) {
      checkCookieAndSendMessage(tab.url, tabId, headerValue);
      // Remove the tabId from tabHeaders map
      tabHeaders.delete(tabId);
    }
  }
});

/**
 * Listener function to remove the tabId from tabHeaders map when a tab is removed.
 * @param {number} tabId - The ID of the removed tab.
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  tabHeaders.delete(tabId);
});

/**
 * Function to check if the 'clacks_suppress' cookie exists and send a message to the content script.
 * @param {string} url - The URL of the tab.
 * @param {number} tabId - The ID of the tab.
 * @param {string} headerValue - The value of the X-Clacks-Overhead header.
 */
function checkCookieAndSendMessage(url, tabId, headerValue) {
  const domain = new URL(url).hostname;
  chrome.cookies.get({url: url, name: 'clacks_suppress'}, (cookie) => {
    if (!cookie) {

      let message = headerValue.toString();

      chrome.tabs.sendMessage(tabId, {
        action: 'showClacksOverhead',
        value: message,
        domain: domain
      }).catch(error => console.log("Error sending message:", error));
    }
  });
}

/**
 * Listener function to handle messages from the content script.
 * @param {Object} request - The message request.
 * @param {Object} sender - The sender of the message.
 * @param {Function} sendResponse - The function to send a response back to the content script.
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Check if the action is to suppress Clacks Overhead
  if (request.action === 'suppressClacks') {
    // Calculate the expiration date for the cookie (30 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    // Set the cookie with the specified parameters
    chrome.cookies.set({
      url: `https://${request.domain}`,
      name: 'clacks_suppress',
      value: 'true',
      expirationDate: expirationDate.getTime() / 1000,
      secure: true,
      httpOnly: true
    }, (cookie) => {
      // Log any errors that occur during cookie setting
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    });
  }
});