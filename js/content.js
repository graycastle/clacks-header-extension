// Function to create a toast notification
function createToast(message, domain) {
    // Create a new div element for the toast
    const toast = document.createElement('div');
    toast.id = 'clacks-toast';

    console.log('Creating toast notification for:', message, domain)

    // Set the inner HTML of the toast

    toast.innerHTML = `
        <div class="clacks-toast-content" style="margin-bottom: 0.5rem">
            <div class="clacks-section">
                <p>
                    <span class="clacks-deco">/////////////////////////////////////\<br /></span>
                    <span class="clacks-title">CLACKS GNU OVERHEAD DETECTED:</span><br />
                    <span class="clacks-name">${message}</span><br />
                    <span class="clacks-deco">/////////////////////////////////////\<br /></span>
                </p>
            </div>
            <div class="clacks-section">
                <p style="margin-bottom: 0 !important;"> Keeping their name forever alive. As long as their name is still passed along the Clacks, Death cannot have them.</p>
            </div>
        </div>
        <div class="clacks-toast-content" style="flex-direction: row; justify-content: end; gap: 0.5rem;">
            <a href="https://www.graycastlepress.com/clacks-memorial-header" class="clacks-button-blue clacks-button-link clacks-about-button">About</a>
            <button class="clacks-button-blue clacks-suppress-button">Mute on Current Website (30 Days)</button>
            <button class="clacks-button-red clacks-toast-close">X</button>
        </div>
    `;

    // Append the toast to the document body
    document.body.appendChild(toast);

    // Slide the toast in after a delay
    setTimeout(() => {
        toast.style.right = '20px';
    }, 500);

    // Add event listener to close button
    const closeButton = toast.querySelector('.clacks-toast-close');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(toast);
        chrome.runtime.sendMessage({ action: 'suppressClacks', domain: domain });
    });

    // Add event listener to suppress button
    const suppressButton = toast.querySelector('.clacks-suppress-button');
    suppressButton.addEventListener('click', () => {
        // Send a message to the background script to suppress Clacks for the current domain
        chrome.runtime.sendMessage({ action: 'suppressClacks', domain: domain });
        document.body.removeChild(toast);
    });

    // Automatically remove the toast after 5 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.style.right = '-400px';
        }

        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 500);

    }, 10000);
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // If the action is 'showClacksOverhead', create a toast notification
    if (request.action === 'showClacksOverhead') {
        createToast(request.value, request.domain);
    }
});