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
    const backToListBtn = document.getElementById('backToListBtn'); // Neuer Button
    const saveStampBtn = document.getElementById('saveStampBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn'); // Wird jetzt zum "Zurück zur Liste" Button
    const stampNameInput = document.getElementById('stampName');
    const stampLine1Input = document.getElementById('stampLine1');
    const stampLine2Input = document.getElementById('stampLine2');
    const stampLine3Input = document.getElementById('stampLine3');
    const stampLine4Input = document.getElementById('stampLine4');
    const stampIdInput = document.getElementById('stampId');

    // General
    const toastNotification = document.getElementById('toastNotification');
    let stamps = [];

    // --- SVG Icons (Platzhalter für Code, falls benötigt) ---
    const iconEdit = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 19h1.425l9.7-9.7l-1.425-1.425L5 17.575V19ZM20.725 8.9l-2.625-2.625L19.525 4.85q.525-.525 1.238-.525q.712 0 1.237.525l.15.15L20.725 8.9Z"></path></svg>`;
    const iconDelete = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 21q-.825 0-1.412-.587Q5 19.825 5 19V6H4V4h5V3h6v1h5v2h-1v13q0 .825-.587 1.413Q17.825 21 17 21H7Zm2-4h2V8H9v9Zm4 0h2V8h-2v9Z"></path></svg>`;
    const iconCopy = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 22q-.825 0-1.412-.587Q3 20.825 3 20V6.5q0-.925.638-1.563Q4.275 4.3 5.2 4.3h1.1V3q0-.425.288-.712Q6.875 2 7.3 2h9.4q.425 0 .713.288Q17.7 3 17.7 3v1.3h1.1q.925 0 1.563.638Q21 5.575 21 6.5V20q0 .825-.587 1.413Q19.825 22 19 22H5Zm0-2h14V6.5q0-.2-.15-.35Q18.7 6 18.5 6H17V4H7v2H5.5q-.2 0-.35.15Q5 6.3 5 6.5V20ZM7 18h10V8H7v10Zm-2 0V6.5V20V6.5V20Z"></path></svg>`;

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
            stampLine1Input.value = stamp.line1;
            stampLine2Input.value = stamp.line2;
            stampLine3Input.value = stamp.line3;
            stampLine4Input.value = stamp.line4 || '';
        } else { // Add new stamp
            formTitle.textContent = 'Neuen Stempel erstellen';
            stampIdInput.value = '';
            // Reset form fields
            stampNameInput.value = '';
            stampLine1Input.value = '';
            stampLine2Input.value = '';
            stampLine3Input.value = '';
            stampLine4Input.value = '';
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
        chrome.storage.local.get(['stamps'], (result) => {
            stamps = result.stamps || [];
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

            const fullStampText = [stamp.line1, stamp.line2, stamp.line3, stamp.line4].filter(Boolean).join('\n');

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
        const line1 = stampLine1Input.value.trim();
        const line2 = stampLine2Input.value.trim();
        const line3 = stampLine3Input.value.trim();
        const line4 = stampLine4Input.value.trim();

        if (!name || !line1 || !line2 || !line3) {
            showToast('Name und die ersten 3 Zeilen sind Pflichtfelder.');
            return;
        }

        const newStamp = { id: id || Date.now().toString(), name, line1, line2, line3, line4 };

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
                if (!Array.isArray(importedData) || !importedData.every(isValidStamp)) {
                    showToast("Ungültige JSON-Datei oder falsches Format.");
                    return;
                }

                // Import-Strategie: Ersetzen nach Bestätigung
                if (confirm(`Möchtest du wirklich alle vorhandenen Stempel durch die Stempel aus der Datei "${file.name}" ersetzen?`)) {
                    stamps = importedData;
                    chrome.storage.local.set({ stamps: importedData }, () => {
                        showToast(`${importedData.length} Stempel importiert!`);
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

    function isValidStamp(stamp) {
        return stamp && typeof stamp.name === 'string' &&
               typeof stamp.line1 === 'string' &&
               typeof stamp.line2 === 'string' &&
               typeof stamp.line3 === 'string' &&
               (typeof stamp.line4 === 'string' || typeof stamp.line4 === 'undefined' || stamp.line4 === null) && // line4 is optional
               typeof stamp.id === 'string'; // id ist wichtig
    }


    // --- Event Listeners für View-Wechsel ---
    showAddFormBtn.addEventListener('click', () => showFormView(null));
    backToListBtn.addEventListener('click', showListView);
    cancelEditBtn.addEventListener('click', showListView); // "Abbrechen" im Formular führt auch zur Liste

    // --- Initial Load ---
    showListView(); // Starte mit der Listenansicht
});