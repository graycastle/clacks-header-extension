chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getClacksOverhead' }, (response) => {
      if (response && response.value) {
        document.getElementById('result').textContent = `X-Clacks-Overhead: ${response.value}`;
      }
    });
  });