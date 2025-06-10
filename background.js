const lightIcons = {
  16: 'icons/light/icon16.png',
  48: 'icons/light/icon64.png',
  128: 'icons/light/icon128.png',
};

const darkIcons = {
  16: 'icons/dark/icon16.png',
  48: 'icons/dark/icon64.png',
  128: 'icons/dark/icon128.png',
};

function updateIcon(isDarkMode) {
  // Stelle sicher, dass chrome.action und setIcon existieren
  if (chrome && chrome.action && typeof chrome.action.setIcon === 'function') {
    const iconPaths = isDarkMode ? darkIcons : lightIcons;
    chrome.action.setIcon({ path: iconPaths });
  } else {
    console.warn("chrome.action.setIcon API is not available. Cannot update icon.");
  }
}

// Neue Message-Listener-Logik für Theme-Änderungen
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === 'THEME_CHANGED') {
    updateIcon(message.isDarkMode);
    sendResponse({ success: true });
  }
  // ... ggf. weitere Nachrichten ...
});

// Setze beim Start ein Standard-Icon (z.B. Light)
updateIcon(false);