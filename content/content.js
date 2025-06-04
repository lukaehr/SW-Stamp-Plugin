let currentTextarea = null;
let stampPopover = null;
let stampsCache = []; // Cache für die Stempel

// --- SVG Icons (Pfade relativ zum Extension-Root) ---
// Diese müssen in manifest.json -> web_accessible_resources deklariert sein
const stampIconUrl = chrome.runtime.getURL('icons/stamp_icon.svg');

// Funktion zum Abrufen der Stempel aus dem Storage
function fetchStamps(callback) {
    chrome.storage.local.get(['stamps'], (result) => {
        stampsCache = result.stamps || [];
        if (callback) callback(stampsCache);
    });
}

// Stempel-Popover erstellen und anzeigen
function showStampPopover(textarea) {
    currentTextarea = textarea;
    if (stampPopover) {
        stampPopover.remove(); // Altes Popover entfernen
    }

    stampPopover = document.createElement('div');
    stampPopover.id = 'stamp-injector-popover';
    stampPopover.innerHTML = `<h3>Stempel wählen</h3><ul id="stamp-injector-list"></ul>`;
    document.body.appendChild(stampPopover);

    const listElement = stampPopover.querySelector('#stamp-injector-list');

    if (stampsCache.length === 0) {
        listElement.innerHTML = '<li>Keine Stempel verfügbar.</li>';
    } else {
        stampsCache.forEach(stamp => {
            const listItem = document.createElement('li');
            listItem.textContent = stamp.name;
            listItem.title = [stamp.line1, stamp.line2, stamp.line3, stamp.line4].filter(Boolean).join('\n');
            listItem.addEventListener('click', () => {
                insertStamp(stamp);
                hideStampPopover();
            });
            listElement.appendChild(listItem);
        });
    }

    // Positioniere Popover nahe am Textfeld
    const rect = textarea.getBoundingClientRect();
    stampPopover.style.top = `${window.scrollY + rect.bottom + 5}px`;
    stampPopover.style.left = `${window.scrollX + rect.left}px`;
    stampPopover.style.display = 'block';

    // Klick außerhalb des Popovers schließt es
    document.addEventListener('click', handleClickOutsidePopover, true);
}

function hideStampPopover() {
    if (stampPopover) {
        stampPopover.style.display = 'none';
        // stampPopover.remove(); // Optional: Entfernen statt verstecken
        // stampPopover = null;
    }
    document.removeEventListener('click', handleClickOutsidePopover, true);
}

function handleClickOutsidePopover(event) {
    if (stampPopover && !stampPopover.contains(event.target) && event.target.id !== 'stamp-injector-icon') {
        // Prüfe auch, ob der Klick auf das Icon selbst war, um erneutes Öffnen zu vermeiden
        const clickedOnInjectedIcon = event.target.closest && event.target.closest('.stamp-injector-icon-wrapper');
        if (!clickedOnInjectedIcon) {
           hideStampPopover();
        }
    }
}

// Stempel in das Textfeld einfügen
function insertStamp(stamp) {
    if (currentTextarea) {
        const textToInsert = [stamp.line1, stamp.line2, stamp.line3, stamp.line4]
            .filter(Boolean) // Entfernt leere optionale Zeilen
            .join('\n');

        const start = currentTextarea.selectionStart;
        const end = currentTextarea.selectionEnd;
        const text = currentTextarea.value;
        currentTextarea.value = text.substring(0, start) + textToInsert + text.substring(end);

        // Cursor nach dem eingefügten Text positionieren
        currentTextarea.selectionStart = currentTextarea.selectionEnd = start + textToInsert.length;
        currentTextarea.focus();

        // Ein Event auslösen, falls die Webseite auf Eingaben reagiert (z.B. bei React/Vue Apps)
        const event = new Event('input', { bubbles: true, cancelable: true });
        currentTextarea.dispatchEvent(event);
    }
}

// Icon zu einem Textfeld hinzufügen
function addIconToTextarea(textarea) {
    if (textarea.dataset.stampIconAdded) return; // Icon nicht doppelt hinzufügen

    const wrapper = document.createElement('div');
    wrapper.classList.add('stamp-injector-icon-wrapper');

    const icon = document.createElement('img');
    icon.src = stampIconUrl;
    icon.id = 'stamp-injector-icon'; // Eindeutige ID für eventuelle spezifische Selektion
    icon.classList.add('stamp-injector-icon');
    icon.title = 'Stempel einfügen';

    icon.addEventListener('click', (e) => {
        e.stopPropagation(); // Verhindert, dass Klick-Events der Webseite ausgelöst werden
        fetchStamps(() => { // Stempel frisch laden, bevor Popover gezeigt wird
            showStampPopover(textarea);
        });
    });

    wrapper.appendChild(icon);

    // Positionierung des Icons (relativ zum Textfeld)
    // Dies muss eventuell an das Layout der Seite angepasst werden.
    // Hier eine einfache Methode: Icon wird nach dem Textfeld platziert, wenn es ein Elternelement hat.
    if (textarea.parentElement) {
        // Stelle sicher, dass das Textarea und das Icon relativ zueinander positioniert werden können
        if (getComputedStyle(textarea.parentElement).position === 'static') {
            textarea.parentElement.style.position = 'relative';
        }
        wrapper.style.position = 'absolute';
        // Positionierung oben rechts im Textfeld (ggf. anpassen)
        const textareaStyle = getComputedStyle(textarea);
        const paddingTop = parseFloat(textareaStyle.paddingTop) || 0;
        const paddingRight = parseFloat(textareaStyle.paddingRight) || 0;

        wrapper.style.top = `${textarea.offsetTop + paddingTop + 5}px`; // 5px vom oberen Rand
        wrapper.style.right = `${paddingRight + 5}px`; // 5px vom rechten Rand innerhalb des Paddings des Textareas

        textarea.insertAdjacentElement('afterend', wrapper); // Besser: Wrapper in Parent, dann absolut positionieren
                                                            // Korrektur: Den Wrapper in den Parent des Textareas einfügen
        textarea.parentElement.appendChild(wrapper);
    }


    textarea.dataset.stampIconAdded = 'true';

    // Listener, um Icon zu entfernen, wenn Textfeld entfernt wird
    const observer = new MutationObserver(mutations => {
        if (!document.body.contains(textarea)) {
            wrapper.remove();
            observer.disconnect();
            if (currentTextarea === textarea) hideStampPopover();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}


// Beobachte DOM-Änderungen, um neue Textfelder zu finden
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Direkt hinzugefügtes Textfeld
                    if (node.matches('textarea[rows]')) { // Nur mehrzeilige
                        addIconToTextarea(node);
                    }
                    // Textfelder in hinzugefügten Sub-Bäumen
                    node.querySelectorAll('textarea[rows]').forEach(addIconToTextarea);
                }
            });
        }
    }
});


// Initiale Suche nach Textfeldern und Start des Observers
function initialize() {
    fetchStamps(); // Lade Stempel initial in den Cache
    document.querySelectorAll('textarea[rows]').forEach(addIconToTextarea);
    observer.observe(document.body, { childList: true, subtree: true });
}

// Listener für Storage-Änderungen, um den Cache zu aktualisieren
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.stamps) {
        stampsCache = changes.stamps.newValue || [];
        // Wenn Popover offen ist und sich Daten ändern, könnte man es neu rendern
        if (stampPopover && stampPopover.style.display === 'block' && currentTextarea) {
            // Einfachste Lösung: Schließen und Nutzer neu klicken lassen
            // Alternativ: Inhalt des Popovers neu aufbauen
            showStampPopover(currentTextarea);
        }
    }
});


initialize();