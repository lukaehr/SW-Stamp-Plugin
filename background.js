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

function checkThemeAndSetIcon(source) {
  console.log(`checkThemeAndSetIcon called from: ${source}`);
  try {
    if (typeof self !== 'undefined' && self.matchMedia && typeof self.matchMedia === 'function') {
      const isDarkMode = self.matchMedia('(prefers-color-scheme: dark)').matches;
      console.log(`Theme check (${source}): ${isDarkMode ? 'Dark' : 'Light'} mode detected.`);
      updateIcon(isDarkMode);
      return true; // Erfolg
    } else {
      console.warn(`self.matchMedia is not available in checkThemeAndSetIcon (called from ${source}). Defaulting to light icons.`);
      updateIcon(false); // Fallback
      return false; // Fehler
    }
  } catch (e) {
    console.error(`Error in checkThemeAndSetIcon (called from ${source}):`, e);
    updateIcon(false); // Fallback im Fehlerfall
    return false; // Fehler
  }
}

// Event-Handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension event:", details.reason, "(e.g., install, update).");
  checkThemeAndSetIcon("onInstalled");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("Browser startup event.");
  checkThemeAndSetIcon("onStartup");
});

// Funktion zur Initialisierung der Theme-Erkennung und des Listeners
function initializeThemeDetectionLogic() {
  console.log("Attempting to initialize theme detection logic (global scope execution)...");
  
  // Prüfe, ob matchMedia direkt beim Start des Scripts verfügbar ist
  if (typeof self !== 'undefined' && self.matchMedia && typeof self.matchMedia === 'function') {
    console.log("self.matchMedia IS available at initial script execution. Setting up listener.");
    
    const mediaQuery = self.matchMedia('(prefers-color-scheme: dark)');
    
    if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', (event) => {
        console.log("System theme changed (event listener triggered).");
        updateIcon(event.matches);
      });
      // Führe einen initialen Check durch, nachdem der Listener eingerichtet wurde.
      // Dies ist wichtig für den Fall, dass der SW neu startet, ohne onInstalled/onStartup auszulösen.
      console.log("Performing initial theme check after setting up listener.");
      checkThemeAndSetIcon("initializeThemeDetectionLogic_listenerSetup");
    } else {
      console.warn("mediaQuery.addEventListener is not available. Dynamic updates might not work.");
      // Dennoch einen initialen Check durchführen.
      checkThemeAndSetIcon("initializeThemeDetectionLogic_noAddEventListener");
    }
  } else {
    // Dieser Pfad wird laut deiner Fehlermeldung getroffen.
    console.warn("self.matchMedia IS NOT available when initializeThemeDetectionLogic() is called. Defaulting icon. Dynamic updates will likely not work.");
    updateIcon(false); // Setze ein Standard-Icon
  }
}

// Führe die Initialisierungslogik aus, wenn der Service Worker startet.
// Dies geschieht bei jedem Start/Neustart des Workers.
initializeThemeDetectionLogic();