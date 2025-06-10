document.addEventListener('DOMContentLoaded', () => {
    // Views
    const listView = document.getElementById('listView');
    const formView = document.getElementById('formView');

    // List View Elements
    const stampListDiv = document.getElementById('stampList');
    const showAddFormBtn = document.getElementById('showAddFormBtn');
    const exportStampsBtn = document.getElementById('exportStampsBtn');
    const importStampsBtn = document.getElementById('importStampsBtn');
    const importFileInput = document.getElementById('importFile');

    // Form View Elements
    const formTitle = document.getElementById('formTitle');
    const backToListBtn = document.getElementById('backToListBtn');
    const saveStampBtn = document.getElementById('saveStampBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const stampNameInput = document.getElementById('stampName');
    const stampLinesInput = document.getElementById('stampLines');
    const stampIdInput = document.getElementById('stampId');

    // General
    const toastNotification = document.getElementById('toastNotification');
    let stamps = [];

    // --- SVG Icons (Platzhalter für Code, falls benötigt) ---
/*     const iconEdit = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 19h1.425l9.7-9.7l-1.425-1.425L5 17.575V19ZM20.725 8.9l-2.625-2.625L19.525 4.85q.525-.525 1.238-.525q.712 0 1.237.525l.15.15L20.725 8.9Z"></path></svg>`;
 */    const iconEdit = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
<path d="M11.4001 18.1612L11.4001 18.1612L18.796 10.7653C17.7894 10.3464 16.5972 9.6582 15.4697 8.53068C14.342 7.40298 13.6537 6.21058 13.2348 5.2039L5.83882 12.5999L5.83879 12.5999C5.26166 13.1771 4.97307 13.4657 4.7249 13.7838C4.43213 14.1592 4.18114 14.5653 3.97634 14.995C3.80273 15.3593 3.67368 15.7465 3.41556 16.5208L2.05445 20.6042C1.92743 20.9852 2.0266 21.4053 2.31063 21.6894C2.59466 21.9734 3.01478 22.0726 3.39584 21.9456L7.47918 20.5844C8.25351 20.3263 8.6407 20.1973 9.00498 20.0237C9.43469 19.8189 9.84082 19.5679 10.2162 19.2751C10.5343 19.0269 10.823 18.7383 11.4001 18.1612Z"/>
<path d="M20.8482 8.71306C22.3839 7.17735 22.3839 4.68748 20.8482 3.15178C19.3125 1.61607 16.8226 1.61607 15.2869 3.15178L14.3999 4.03882C14.4121 4.0755 14.4246 4.11268 14.4377 4.15035C14.7628 5.0875 15.3763 6.31601 16.5303 7.47002C17.6843 8.62403 18.9128 9.23749 19.85 9.56262C19.8875 9.57563 19.9245 9.58817 19.961 9.60026L20.8482 8.71306Z" />
</svg>`;
/*     const iconDelete = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21H7Zm2-4h2V8H9v9Zm4 0h2V8h-2v9Z"></path></svg>`;
 */    const iconDelete = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
<path d="M2.75 6.16667C2.75 5.70644 3.09538 5.33335 3.52143 5.33335L6.18567 5.3329C6.71502 5.31841 7.18202 4.95482 7.36214 4.41691C7.36688 4.40277 7.37232 4.38532 7.39185 4.32203L7.50665 3.94993C7.5769 3.72179 7.6381 3.52303 7.72375 3.34536C8.06209 2.64349 8.68808 2.1561 9.41147 2.03132C9.59457 1.99973 9.78848 1.99987 10.0111 2.00002H13.4891C13.7117 1.99987 13.9056 1.99973 14.0887 2.03132C14.8121 2.1561 15.4381 2.64349 15.7764 3.34536C15.8621 3.52303 15.9233 3.72179 15.9935 3.94993L16.1083 4.32203C16.1279 4.38532 16.1333 4.40277 16.138 4.41691C16.3182 4.95482 16.8778 5.31886 17.4071 5.33335H19.9786C20.4046 5.33335 20.75 5.70644 20.75 6.16667C20.75 6.62691 20.4046 7 19.9786 7H3.52143C3.09538 7 2.75 6.62691 2.75 6.16667Z"/>
<path d="M11.6068 21.9998H12.3937C15.1012 21.9998 16.4549 21.9998 17.3351 21.1366C18.2153 20.2734 18.3054 18.8575 18.4855 16.0256L18.745 11.945C18.8427 10.4085 18.8916 9.6402 18.45 9.15335C18.0084 8.6665 17.2628 8.6665 15.7714 8.6665H8.22905C6.73771 8.6665 5.99204 8.6665 5.55047 9.15335C5.10891 9.6402 5.15777 10.4085 5.25549 11.945L5.515 16.0256C5.6951 18.8575 5.78515 20.2734 6.66534 21.1366C7.54553 21.9998 8.89927 21.9998 11.6068 21.9998Z"/>
</svg>`;

/*     const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 22q-.825 0-1.412-.587Q3 20.825 3 20V6.5q0-.925.638-1.563Q4.275 4.3 5.2 4.3h1.1V3q0-.425.288-.712Q6.875 2 7.3 2h9.4q.425 0 .713.288Q17.7 3 17.7 3v1.3h1.1q.925 0 1.563.638Q21 5.575 21 6.5V20q0 .825-.587 1.413Q19.825 22 19 22H5Zm0-2h14V6.5q0-.2-.15-.35Q18.7 6 18.5 6H17V4H7v2H5.5q-.2 0-.35.15Q5 6.3 5 6.5V20ZM7 18h10V8H7v10Zm-2 0V6.5V20V6.5V20Z"></path></svg>`;
 */    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
<path d="M15.24 2H11.3458C9.58159 1.99999 8.18418 1.99997 7.09054 2.1476C5.96501 2.29953 5.05402 2.61964 4.33559 3.34096C3.61717 4.06227 3.29833 4.97692 3.14701 6.10697C2.99997 7.205 2.99999 8.60802 3 10.3793V16.2169C3 17.725 3.91995 19.0174 5.22717 19.5592C5.15989 18.6498 5.15994 17.3737 5.16 16.312L5.16 11.3976L5.16 11.3024C5.15993 10.0207 5.15986 8.91644 5.27828 8.03211C5.40519 7.08438 5.69139 6.17592 6.4253 5.43906C7.15921 4.70219 8.06404 4.41485 9.00798 4.28743C9.88877 4.16854 10.9887 4.1686 12.2652 4.16867L12.36 4.16868H15.24L15.3348 4.16867C16.6113 4.1686 17.7088 4.16854 18.5896 4.28743C18.0627 2.94779 16.7616 2 15.24 2Z"/>
<path d="M6.6001 11.3974C6.6001 8.67119 6.6001 7.3081 7.44363 6.46118C8.28716 5.61426 9.64481 5.61426 12.3601 5.61426H15.2401C17.9554 5.61426 19.313 5.61426 20.1566 6.46118C21.0001 7.3081 21.0001 8.6712 21.0001 11.3974V16.2167C21.0001 18.9429 21.0001 20.306 20.1566 21.1529C19.313 21.9998 17.9554 21.9998 15.2401 21.9998H12.3601C9.64481 21.9998 8.28716 21.9998 7.44363 21.1529C6.6001 20.306 6.6001 18.9429 6.6001 16.2167V11.3974Z"/>
</svg>`;


    // --- View Management ---
    function showListView() {
        listView.style.display = 'block';
        formView.style.display = 'none';
        loadStamps(); // Stempel neu laden und rendern
    }

    function showFormView(stamp = null) {
        listView.style.display = 'none';
        formView.style.display = 'block';

        if (stamp) { // Edit existing stamp
            formTitle.textContent = 'Stempel bearbeiten';
            stampIdInput.value = stamp.id;
            stampNameInput.value = stamp.name;
            stampLinesInput.value = stamp.lines || '';
        } else { // Add new stamp
            formTitle.textContent = 'Neuen Stempel erstellen';
            stampIdInput.value = '';
            // Reset form fields
            stampNameInput.value = '';
            stampLinesInput.value = '';
        }
        stampNameInput.focus();
    }

    // --- Toast Notification Logic ---
    function showToast(message) {
        toastNotification.textContent = message;
        toastNotification.classList.add('show');
        setTimeout(() => {
            toastNotification.classList.remove('show');
        }, 3000);
    }

    // --- Load Stamps ---
    function loadStamps() {
        if (!chrome.storage || !chrome.storage.local) {
            showToast('Fehler: chrome.storage ist nicht verfügbar. Bitte als Chrome Extension ausführen.');
            return;
        }
        chrome.storage.local.get(['stamps'], (result) => {
            stamps = (result.stamps || []).map(migrateStampToLines);
            renderStamps();
        });
    }

    // --- Render Stamps ---
    function renderStamps() {
        stampListDiv.innerHTML = '';
        if (stamps.length === 0) {
            stampListDiv.innerHTML = '<p class="empty-state">Noch keine Stempel gespeichert. Füge einen neuen Stempel hinzu!</p>';
            return;
        }
        stamps.forEach((stamp) => { // 'index' nicht mehr benötigt für ID
            const stampEl = document.createElement('div');
            stampEl.classList.add('stamp-item');
            stampEl.dataset.id = stamp.id;

            const fullStampText = (stamp.lines || '').trim();

            stampEl.innerHTML = `
                <div class="stamp-header">
                    <span class="stamp-name">${stamp.name}</span>
                    <div class="stamp-actions">
                        <button class="action-btn copy-btn" title="In Zwischenablage kopieren">${iconCopy}</button>
                        <button class="action-btn edit-btn" title="Stempel bearbeiten">${iconEdit}</button>
                        <button class="action-btn delete-btn" title="Stempel löschen">${iconDelete}</button>
                    </div>
                </div>
                <div class="stamp-content" title="Klicken zum Kopieren">${fullStampText.replace(/\n/g, '<br>')}</div>
            `;

            stampEl.querySelector('.stamp-content').addEventListener('click', () => {
                copyToClipboard(fullStampText, stamp.name);
            });
            stampEl.querySelector('.copy-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                copyToClipboard(fullStampText, stamp.name);
            });
            stampEl.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const stampToEdit = stamps.find(s => s.id === stamp.id);
                if (stampToEdit) showFormView(stampToEdit);
            });
            stampEl.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm(`Möchtest du den Stempel "${stamp.name}" wirklich löschen?`)) {
                    deleteStamp(stamp.id);
                }
            });
            stampListDiv.appendChild(stampEl);
        });
    }

    // --- Copy to Clipboard ---
    function copyToClipboard(text, stampName) {
        navigator.clipboard.writeText(text).then(() => {
            showToast(`Stempel "${stampName}" kopiert!`);
        }).catch(err => {
            console.error('Fehler beim Kopieren: ', err);
            showToast('Fehler beim Kopieren.');
        });
    }

    // --- Save Stamp ---
    saveStampBtn.addEventListener('click', () => {
        const id = stampIdInput.value;
        const name = stampNameInput.value.trim();
        const lines = stampLinesInput.value.replace(/\r\n/g, '\n').trim();

        if (!name || !lines) {
            showToast('Name und Stempeltext sind Pflichtfelder.');
            return;
        }

        const newStamp = { id: id || Date.now().toString(), name, lines };

        let updatedStamps;
        if (id) { // Update
            updatedStamps = stamps.map(s => s.id === id ? newStamp : s);
        } else { // Add
            updatedStamps = [...stamps, newStamp];
        }
        stamps = updatedStamps; // Lokalen Cache aktualisieren

        chrome.storage.local.set({ stamps: updatedStamps }, () => {
            showToast(id ? 'Stempel aktualisiert!' : 'Stempel gespeichert!');
            showListView();
        });
    });

    // --- Delete Stamp ---
    function deleteStamp(id) {
        const updatedStamps = stamps.filter(s => s.id !== id);
        stamps = updatedStamps; // Lokalen Cache aktualisieren
        chrome.storage.local.set({ stamps: updatedStamps }, () => {
            showToast('Stempel gelöscht!');
            renderStamps(); // Nur neu rendern, wenn in Listenansicht
        });
    }

    // --- Export Stempel ---
    exportStampsBtn.addEventListener('click', () => {
        if (stamps.length === 0) {
            showToast("Keine Stempel zum Exportieren vorhanden.");
            return;
        }
        const jsonString = JSON.stringify(stamps, null, 2); // null, 2 für Pretty Print
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stempel_export_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Stempel exportiert!");
    });

    // --- Import Stempel ---
    importStampsBtn.addEventListener('click', () => {
        importFileInput.click(); // Verstecktes File-Input auslösen
    });

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (!Array.isArray(importedData) || !importedData.every(isValidStampImport)) {
                    showToast("Ungültige JSON-Datei oder falsches Format.");
                    return;
                }

                // Migration: Konvertiere ggf. alte Stempelstruktur zu neuer Struktur
                const migrated = importedData.map(migrateStampToLines);

                if (confirm(`Möchtest du wirklich alle vorhandenen Stempel durch die Stempel aus der Datei "${file.name}" ersetzen?`)) {
                    stamps = migrated;
                    chrome.storage.local.set({ stamps: migrated }, () => {
                        showToast(`${migrated.length} Stempel importiert!`);
                        if (listView.style.display === 'block') {
                            loadStamps(); // Neu laden und rendern, wenn Listenansicht aktiv
                        }
                    });
                }
            } catch (error) {
                console.error("Fehler beim Importieren: ", error);
                showToast("Fehler beim Lesen der JSON-Datei.");
            } finally {
                importFileInput.value = ''; // Input zurücksetzen für erneuten Import derselben Datei
            }
        };
        reader.readAsText(file);
    });

    // Migration: Wandelt alte Stempel mit line1-line4 in das neue lines-Feld um
    function migrateStampToLines(stamp) {
        if (typeof stamp.lines === 'string') {
            return stamp;
        }
        // Fallback für alte Struktur
        const linesArr = [stamp.line1, stamp.line2, stamp.line3, stamp.line4].filter(Boolean);
        return {
            id: stamp.id,
            name: stamp.name,
            lines: linesArr.join('\n')
        };
    }

    // Für Import: Akzeptiere beide Formate (alt und neu)
    function isValidStampImport(stamp) {
        return stamp && typeof stamp.name === 'string' &&
            typeof stamp.id === 'string' &&
            (
                typeof stamp.lines === 'string' ||
                (typeof stamp.line1 === 'string' && typeof stamp.line2 === 'string' && typeof stamp.line3 === 'string')
            );
    }

    // --- Event Listeners für View-Wechsel ---
    showAddFormBtn.addEventListener('click', () => showFormView(null));
    backToListBtn.addEventListener('click', showListView);
    cancelEditBtn.addEventListener('click', showListView); // "Abbrechen" im Formular führt auch zur Liste

    // --- Theme Detection & Icon Update ---
    function notifyBackgroundAboutTheme() {
        if (window.matchMedia) {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            chrome.runtime.sendMessage({ type: 'THEME_CHANGED', isDarkMode: isDark });
        }
    }

    // Beim Laden und bei Theme-Wechsel melden
    notifyBackgroundAboutTheme();
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', notifyBackgroundAboutTheme);
    }

    // --- Initial Load ---
    showListView(); // Starte mit der Listenansicht
});