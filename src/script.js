// ========================================================================
// CODICE COMPLETO
// ========================================================================

/************************************************************************
 * VARIABILI GLOBALI
 ************************************************************************/
let allExtractedData = [];
let currentFiles = [];
let filteredData = [];
let charts = [];  // Array per i grafici Chart.js

// Riferimenti ai campi DOM
const jsonFileInput = document.getElementById('jsonFileInput');
const fileInfo = document.getElementById('fileInfo');
const processButton = document.getElementById('processButton');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressPercentage = document.getElementById('progressPercentage');
const resultInfo = document.getElementById('resultInfo');
const previewDiv = document.getElementById('preview');
const exportCsvButton = document.getElementById('exportCsvButton');
const exportXlsxButton = document.getElementById('exportXlsxButton');
const exportPdfButton = document.getElementById('exportPdfButton');
const generateStatsBtn = document.getElementById('generateStatsButton');

// Filtri
const enableFilterCheck = document.getElementById('enableFilter');
const filterFieldSelect = document.getElementById('filterField');
const filterOperatorSel = document.getElementById('filterOperator');
const filterValueInput = document.getElementById('filterValue');

// Campi da estrarre (checkbox)
const fieldsMap = {
    "descriptionMerchant": document.getElementById('field_descriptionMerchant'),
    "Addebito": document.getElementById('field_Addebito'),
    "IBAN": document.getElementById('field_IBAN'),
    "fee scadenza": document.getElementById('field_feeScadenza'),
    "totale transazioni": document.getElementById('field_totaleTransazioni'),
    "descrizione": document.getElementById('field_descrizione'),
};

// Statistiche
const statsFieldSelect = document.getElementById('statsFieldSelect');
const statsPreview = document.getElementById('statsPreview');
const chartsContainer = document.getElementById('chartsContainer');
const dashboardContainer = document.getElementById('dashboardContainer');

// Configurazione email
let emailConfig = {
    service: '',
    user: '',
    password: '',
    smtpServer: '',
    smtpPort: '',
};

// Gestione preset dei filtri
let filterPresets = [];

/************************************************************************
 * LISTENER
 ************************************************************************/
// Gestione file
jsonFileInput.addEventListener('change', handleFileSelection);
processButton.addEventListener('click', processJSONFiles);
exportCsvButton.addEventListener('click', () => exportData('csv'));
exportXlsxButton.addEventListener('click', () => exportData('xlsx'));
exportPdfButton.addEventListener('click', () => exportData('pdf'));
generateStatsBtn.addEventListener('click', generateStatistics);

// Listener per preset di filtri
document.getElementById('savePresetButton').addEventListener('click', saveFilterPreset);
document.getElementById('loadPresetButton').addEventListener('click', () => {
    const presetSelect = document.getElementById('filterPresetSelect');
    if (presetSelect.value) {
        applyFilterPreset(presetSelect.value);
    }
});
document.getElementById('deletePresetButton').addEventListener('click', deleteFilterPreset);

// Gestione dei tabs
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Rimuovi la classe active da tutti i tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Rimuovi la classe active da tutti i tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Aggiungi la classe active al tab button cliccato
        this.classList.add('active');
        
        // Attiva il tab content corrispondente
        const tabId = this.dataset.tab;
        document.getElementById(tabId).classList.add('active');
    });
});

// Listener per email
document.getElementById('sendEmailButton').addEventListener('click', sendReportEmail);

// Aggiornamento configurazione SMTP in base al servizio selezionato
const emailServiceSelect = document.getElementById('emailService');
if (emailServiceSelect) {
    emailServiceSelect.addEventListener('change', updateSmtpFields);
}

// Verifica connessione SMTP
const testSmtpBtn = document.getElementById('testSmtpBtn');
if (testSmtpBtn) {
    testSmtpBtn.addEventListener('click', testSmtpConnection);
}

// Salva configurazione SMTP
const saveSmtpBtn = document.getElementById('saveSmtpBtn');
if (saveSmtpBtn) {
    saveSmtpBtn.addEventListener('click', saveEmailConfig);
}

// Aggiornamenti
const updateNowButton = document.getElementById('updateNowButton');
if (updateNowButton) {
    updateNowButton.addEventListener('click', downloadAndInstallUpdate);
}

const updateLaterButton = document.getElementById('updateLaterButton');
if (updateLaterButton) {
    updateLaterButton.addEventListener('click', hideUpdateBanner);
}

// Gestione drag & drop per file
const fileInputLabel = document.querySelector('.file-input-label');
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    fileInputLabel.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    fileInputLabel.addEventListener(eventName, () => {
        fileInputLabel.style.backgroundColor = '#e2e8f0';
        fileInputLabel.style.borderColor = '#4361ee';
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    fileInputLabel.addEventListener(eventName, () => {
        fileInputLabel.style.backgroundColor = '#f1f5f9';
        fileInputLabel.style.borderColor = '#cbd5e1';
    }, false);
});

fileInputLabel.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    jsonFileInput.files = files;
    handleFileSelection({target: {files: files}});
}

// Caricamento iniziale
document.addEventListener('DOMContentLoaded', function () {
    loadFilterPresets();
    loadEmailConfig();
    setupTabNavigation();

    // Controlla aggiornamenti dopo 5 secondi (disabilitato per il test)
    // setTimeout(checkForUpdates, 5000);
});

// Funzione per inizializzare la navigazione dei tab
function setupTabNavigation() {
    // Assicura che il primo tab sia attivo di default
    const firstTabBtn = document.querySelector('.tab-btn');
    const firstTabContent = document.getElementById(firstTabBtn?.dataset.tab);
    
    if (firstTabBtn && firstTabContent) {
        firstTabBtn.classList.add('active');
        firstTabContent.classList.add('active');
    }
    
    // Assegna gli event listener
    document.querySelectorAll('.tab-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Rimuovi la classe active da tutti i tab button
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Rimuovi la classe active da tutti i tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Aggiungi la classe active al tab button cliccato
            this.classList.add('active');
            
            // Attiva il tab content corrispondente
            const tabId = this.dataset.tab;
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            } else {
                console.error(`Tab content with ID ${tabId} not found`);
            }
        });
    });
}

/************************************************************************
 * FUNZIONI DI GESTIONE FILE
 ************************************************************************/
function handleFileSelection(e) {
    currentFiles = Array.from(e.target.files);
    if (currentFiles.length > 0) {
        let infoStr = '';
        currentFiles.forEach(f => {
            infoStr += `<div><i class="fas fa-file-code"></i> ${f.name} (${formatFileSize(f.size)})</div>`;
        });
        fileInfo.innerHTML = `<strong>File selezionati:</strong><br>${infoStr}`;
        processButton.disabled = false;
    } else {
        fileInfo.innerHTML = '';
        processButton.disabled = true;
    }
    // Reset
    allExtractedData = [];
    filteredData = [];
    previewDiv.innerHTML = '';
    resultInfo.style.display = 'none';
    statsPreview.style.display = 'none';
    dashboardContainer.style.display = 'none';
    exportCsvButton.disabled = true;
    exportXlsxButton.disabled = true;
    exportPdfButton.disabled = true;
    generateStatsBtn.disabled = true;
    document.getElementById('sendEmailButton').disabled = true;
    chartsContainer.innerHTML = '';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

async function processJSONFiles() {
    if (currentFiles.length === 0) return;
    progressContainer.style.display = 'block';
    progressBar.value = 0;
    progressPercentage.textContent = '0%';
    resultInfo.style.display = 'none';
    previewDiv.innerHTML = '';
    statsPreview.style.display = 'none';
    chartsContainer.innerHTML = '';
    dashboardContainer.style.display = 'none';

    allExtractedData = [];
    let fileCount = currentFiles.length;
    for (let i = 0; i < fileCount; i++) {
        let file = currentFiles[i];
        try {
            let text = await readFileAsText(file);
            let jsonData = JSON.parse(text);
            extractDataFromJson(jsonData);
        } catch (err) {
            console.error("Errore lettura file:", file.name, err);
            showNotification(`Errore nel file ${file.name}: ${err.message}`, 'error');
        }
        let percentage = Math.round(((i + 1) / fileCount) * 100);
        progressBar.value = percentage;
        progressPercentage.textContent = `${percentage}%`;
    }

    if (enableFilterCheck.checked) {
        filteredData = applyFilter(allExtractedData);
    } else {
        filteredData = allExtractedData.slice();
    }

    displayResults(filteredData);
    progressContainer.style.display = 'none';
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = e => reject(e);
        reader.readAsText(file);
    });
}

/************************************************************************
 * ESTRAZIONE DATI
 ************************************************************************/
function extractDataFromJson(jsonData) {
    exploreObject(jsonData);
}

function exploreObject(obj) {
    if (!obj || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
        obj.forEach(item => exploreObject(item));
    } else {
        let foundKey = Object.keys(obj).find(k => k.toLowerCase() === "descriptionmerchant");
        if (foundKey) {
            let merchantValue = obj[foundKey];
            let record = {"descriptionMerchant": String(merchantValue)};
            extractFieldsFromText(record, String(merchantValue));
            allExtractedData.push(record);
        }
        Object.keys(obj).forEach(k => {
            let val = obj[k];
            if (val && typeof val === 'object') {
                exploreObject(val);
            }
        });
    }
}

function extractFieldsFromText(record, text) {
    let t = text || "";
    // ADDEBITO
    let rgxAddebito = new RegExp(
        '(?:addebito|importo|pagamento|EUR|euro|USD|€|\\$)\\s*[di]*\\s*:*\\s*([0-9.,]+)',
        'i'
    );
    let matchAddebito = t.match(rgxAddebito);
    if (matchAddebito) {
        record["Addebito"] = matchAddebito[1].trim();
    } else {
        let rgxMoney2 = new RegExp('(€\\s*[0-9.,]+|\\$\\s*[0-9.,]+|[0-9.,]+\\s*€|[0-9.,]+\\s*\\$|[0-9.,]+\\s*EUR)', 'i');
        let m2 = t.match(rgxMoney2);
        record["Addebito"] = m2 ? m2[0].trim() : "";
    }

    // IBAN
    let rgxIban = new RegExp('(?:IBAN|conto)\\s*:*\\s*([A-Z0-9 ]{10,34})', 'i');
    let matchIban = t.match(rgxIban);
    if (matchIban) {
        record["IBAN"] = matchIban[1].trim();
    } else {
        let rgxIban2 = new RegExp('(IT\\s*[0-9A-Z ]{10,30})', 'i');
        let mIban2 = t.match(rgxIban2);
        record["IBAN"] = mIban2 ? mIban2[0].trim() : "";
    }

    // Fee + scadenza
    let rgxFee = new RegExp('(?:fee|commissione|spese)\\s*[di]*\\s*:*\\s*([0-9.,]+)(?:\\s*[€\\$%])?', 'i');
    let matchFee = t.match(rgxFee);
    let rgxScad = new RegExp('(?:scadenza|scad\\.|entro il)\\s*:*\\s*(\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}|\\d{1,2}\\s+[a-z]{3,10}\\s+\\d{2,4})', 'i');
    let matchScad = t.match(rgxScad);
    if (matchFee && matchScad) {
        record["fee scadenza"] = matchFee[1].trim() + " - " + matchScad[1].trim();
    } else if (matchFee) {
        record["fee scadenza"] = matchFee[1].trim();
    } else if (matchScad) {
        record["fee scadenza"] = matchScad[1].trim();
    } else {
        record["fee scadenza"] = "";
    }

    // Totale transazioni
    let rgxTot = new RegExp('(?:totale|transazioni|operazioni)\\s*[di]*\\s*:*\\s*([0-9.,]+)', 'i');
    let matchTot = t.match(rgxTot);
    if (matchTot) {
        record["totale transazioni"] = matchTot[1].trim();
    } else {
        let rgxTot2 = new RegExp('transazioni\\s*(?:[a-z ]*)\\s*([0-9]+)', 'i');
        let mTot2 = t.match(rgxTot2);
        record["totale transazioni"] = mTot2 ? mTot2[1].trim() : "";
    }

    // Descrizione
    let rgxDesc = new RegExp('(?:descrizione|note|dettagli|causale)\\s*:*\\s*(.+?)(?:\\.|$)', 'i');
    let matchDesc = t.match(rgxDesc);
    if (matchDesc) {
        record["descrizione"] = matchDesc[1].trim();
    } else {
        let words = t.split(/\s+/);
        record["descrizione"] = words.length > 5 ? words.slice(0, 5).join(" ") + "..." : t;
    }
}

/************************************************************************
 * FILTRI
 ************************************************************************/
function applyFilter(data) {
    let field = filterFieldSelect.value;
    let operator = filterOperatorSel.value;
    let filterVal = filterValueInput.value;
    let out = [];
    data.forEach(item => {
        let itemVal = item[field] || "";
        if (!itemVal) return;
        if (["<", ">", "<=", ">=", "="].includes(operator)) {
            let numericVal = parseFloat(itemVal.replace(',', '.').replace(/[^0-9.-]/g, ''));
            let numericFilter = parseFloat(filterVal.replace(',', '.'));
            if (isNaN(numericVal) || isNaN(numericFilter)) return;
            switch (operator) {
                case ">":
                    if (numericVal > numericFilter) out.push(item);
                    break;
                case "<":
                    if (numericVal < numericFilter) out.push(item);
                    break;
                case ">=":
                    if (numericVal >= numericFilter) out.push(item);
                    break;
                case "<=":
                    if (numericVal <= numericFilter) out.push(item);
                    break;
                case "=":
                    if (numericVal === numericFilter) out.push(item);
                    break;
            }
        } else if (operator === "contiene") {
            if (String(itemVal).toLowerCase().includes(filterVal.toLowerCase())) {
                out.push(item);
            }
        }
    });
    return out;
}

/************************************************************************
 * PRESET FILTRI
 ************************************************************************/
// Carica i preset all'avvio
function loadFilterPresets() {
    try {
        const savedPresets = localStorage.getItem('filterPresets');
        if (savedPresets) {
            filterPresets = JSON.parse(savedPresets);
            updateFilterPresetsList();
        }
    } catch (error) {
        console.error("Errore nel caricamento dei preset:", error);
    }
}

// Funzione per salvare un preset
function saveFilterPreset() {
    const presetName = prompt("Inserisci un nome per questo preset:", "Preset " + (filterPresets.length + 1));
    if (!presetName) return;

    const preset = {
        name: presetName,
        enableFilter: enableFilterCheck.checked,
        field: filterFieldSelect.value,
        operator: filterOperatorSel.value,
        value: filterValueInput.value,
        selectedFields: Object.keys(fieldsMap).reduce((acc, key) => {
            acc[key] = fieldsMap[key].checked;
            return acc;
        }, {})
    };

    filterPresets.push(preset);
    localStorage.setItem('filterPresets', JSON.stringify(filterPresets));
    updateFilterPresetsList();
}

// Aggiorna la lista dei preset nell'interfaccia
function updateFilterPresetsList() {
    const presetSelect = document.getElementById('filterPresetSelect');
    presetSelect.innerHTML = '<option value="">-- Seleziona un preset --</option>';

    filterPresets.forEach((preset, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = preset.name;
        presetSelect.appendChild(option);
    });
}

// Applica il preset selezionato
function applyFilterPreset(index) {
    const preset = filterPresets[index];
    if (!preset) return;

    enableFilterCheck.checked = preset.enableFilter;
    filterFieldSelect.value = preset.field;
    filterOperatorSel.value = preset.operator;
    filterValueInput.value = preset.value;

    // Applica i campi selezionati
    Object.keys(preset.selectedFields).forEach(key => {
        if (fieldsMap[key]) {
            fieldsMap[key].checked = preset.selectedFields[key];
        }
    });
}

// Cancella il preset selezionato
function deleteFilterPreset() {
    const presetSelect = document.getElementById('filterPresetSelect');
    const index = presetSelect.value;
    if (!index || index === "") return;

    if (confirm(`Sei sicuro di voler eliminare il preset "${filterPresets[index].name}"?`)) {
        filterPresets.splice(index, 1);
        localStorage.setItem('filterPresets', JSON.stringify(filterPresets));
        updateFilterPresetsList();
    }
}

/************************************************************************
 * VISUALIZZAZIONE RISULTATI
 ************************************************************************/
function displayResults(data) {
    if (data.length === 0) {
        resultInfo.innerHTML = '<div class="alert-warning">Nessun record estratto oppure nessun dato corrisponde al filtro.</div>';
        resultInfo.style.display = 'block';
        previewDiv.innerHTML = '';
        exportCsvButton.disabled = true;
        exportXlsxButton.disabled = true;
        exportPdfButton.disabled = true;
        generateStatsBtn.disabled = true;
        document.getElementById('sendEmailButton').disabled = true;
        return;
    }

    resultInfo.style.display = 'block';
    resultInfo.innerHTML = `<strong>Trovati ${data.length} record.</strong> (Mostriamo i primi 50)`;

    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    let activeFields = Object.keys(fieldsMap).filter(k => fieldsMap[k].checked);

    let headerRow = document.createElement('tr');
    activeFields.forEach(f => {
        let th = document.createElement('th');
        th.textContent = f;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    let limit = Math.min(50, data.length);
    for (let i = 0; i < limit; i++) {
        let row = document.createElement('tr');
        activeFields.forEach(f => {
            let td = document.createElement('td');
            let val = data[i][f] || "";
            if (val.length > 50) {
                val = val.substring(0, 47) + "...";
            }
            td.textContent = val;
            row.appendChild(td);
        });
        tbody.appendChild(row);
    }

    table.appendChild(thead);
    table.appendChild(tbody);
    previewDiv.innerHTML = "";
    previewDiv.appendChild(table);

    if (data.length > limit) {
        let p = document.createElement('p');
        p.textContent = `Mostrati ${limit} record su ${data.length}. Esporta per visualizzare tutti i dati.`;
        previewDiv.appendChild(p);
    }

    // Abilita pulsanti
    exportCsvButton.disabled = false;
    exportXlsxButton.disabled = false;
    exportPdfButton.disabled = false;
    generateStatsBtn.disabled = false;

    // Abilita il pulsante di invio email se la configurazione è impostata
    document.getElementById('sendEmailButton').disabled = !(emailConfig.service && emailConfig.user);
}

/************************************************************************
 * ESPORTAZIONE DATI
 ************************************************************************/
function exportData(format) {
    if (filteredData.length === 0) return;

    let activeFields = Object.keys(fieldsMap).filter(k => fieldsMap[k].checked);

    if (activeFields.length === 0) {
        alert("Nessun campo selezionato per l'esportazione!");
        return;
    }

    let exportArr = filteredData.map(item => {
        let obj = {};
        activeFields.forEach(f => {
            obj[f] = item[f] || "";
        });
        return obj;
    });

    let ts = new Date().toISOString().replace(/[:.]/g, '-');
    let filename = `Report_Commissioni_${ts}`;

    if (format === 'csv') {
        exportAsCSV(exportArr, filename + '.csv');
    } else if (format === 'xlsx') {
        exportAsXLSX(exportArr, filename + '.xlsx');
    } else if (format === 'pdf') {
        exportAsPDF(exportArr, filename + '.pdf');
    }
}

function exportAsCSV(data, filename) {
    if (!data.length) return;

    let headers = Object.keys(data[0]);
    let csvRows = [headers.join(',')];

    data.forEach(row => {
        let rowArr = headers.map(h => `"${(row[h] || "").toString().replace(/"/g, '""')}"`);
        csvRows.push(rowArr.join(','));
    });

    let csvContent = csvRows.join('\n');
    let blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
    downloadFile(blob, filename);
}

function exportAsXLSX(data, filename) {
    if (!data.length) return;

    let worksheet = XLSX.utils.json_to_sheet(data);
    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dati Estratti");

    let excelBuffer = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
    let blob = new Blob([excelBuffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});

    downloadFile(blob, filename);
}

function exportAsPDF(data, filename) {
    if (!data.length) return;

    // Creazione del documento PDF
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF();

    // Aggiungi intestazione
    doc.setFontSize(18);
    doc.text("Report Commissioni", 14, 22);

    // Aggiungi data generazione
    doc.setFontSize(11);
    const today = new Date().toLocaleDateString();
    doc.text(`Generato il: ${today}`, 14, 30);

    // Preparazione dati per la tabella
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => row[h] || ""));

    // Genera tabella
    doc.autoTable({
        head: [headers],
        body: rows,
        startY: 35,
        styles: {fontSize: 8, cellPadding: 2},
        headStyles: {fillColor: [67, 97, 238]},
        alternateRowStyles: {fillColor: [240, 240, 240]},
        margin: {top: 35}
    });

    // Aggiungi statistiche se disponibili
    if (filteredData.length > 0) {
        const statsField = statsFieldSelect.value;
        let numericVals = [];

        filteredData.forEach(item => {
            let raw = item[statsField] || "";
            let num = parseFloat(raw.replace(',', '.').replace(/[^0-9.-]/g, ''));
            if (!isNaN(num)) numericVals.push(num);
        });

        if (numericVals.length > 0) {
            const pageHeight = doc.internal.pageSize.height;
            const currentY = doc.previousAutoTable.finalY + 10;

            if (currentY < pageHeight - 40) {
                doc.setFontSize(14);
                doc.text(`Statistiche per ${statsField}`, 14, currentY);

                doc.setFontSize(10);
                const count = numericVals.length;
                const minVal = Math.min(...numericVals);
                const maxVal = Math.max(...numericVals);
                const sumVal = numericVals.reduce((a, b) => a + b, 0);
                const meanVal = sumVal / count;

                doc.text(`Totale record: ${count}`, 14, currentY + 8);
                doc.text(`Minimo: ${minVal.toFixed(2)}`, 14, currentY + 14);
                doc.text(`Massimo: ${maxVal.toFixed(2)}`, 14, currentY + 20);
                doc.text(`Media: ${meanVal.toFixed(2)}`, 14, currentY + 26);
                doc.text(`Somma: ${sumVal.toFixed(2)}`, 14, currentY + 32);
            }
        }
    }

    // Aggiungi footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Pagina ${i} di ${pageCount} - Tool Reporting Commissioni`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 10,
            {align: 'center'}
        );
    }

    // Salva PDF
    doc.save(filename);
}

function downloadFile(blob, filename) {
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

/************************************************************************
 * STATISTICHE E GRAFICI
 ************************************************************************/
function generateStatistics() {
    if (filteredData.length === 0) {
        alert("Non ci sono dati filtrati da analizzare.");
        return;
    }

    const visualizationType = document.getElementById('visualizationType').value;

    if (visualizationType === 'dashboard') {
        // Usa la dashboard avanzata
        createAdvancedDashboard();
        statsPreview.style.display = 'none';
        chartsContainer.style.display = 'none';
    } else {
        // Usa le statistiche di base
        let field = statsFieldSelect.value;
        let numericVals = [];
        filteredData.forEach(item => {
            let raw = item[field] || "";
            let num = parseFloat(raw.replace(',', '.').replace(/[^0-9.-]/g, ''));
            if (!isNaN(num)) numericVals.push(num);
        });

        statsPreview.style.display = 'block';
        chartsContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';

        statsPreview.innerHTML = "";
        if (numericVals.length === 0) {
            statsPreview.innerHTML = `Nessun valore numerico valido per il campo <strong>${field}</strong>.`;
            chartsContainer.innerHTML = "";
            return;
        }

        let count = numericVals.length;
        let minVal = Math.min(...numericVals);
        let maxVal = Math.max(...numericVals);
        let sumVal = numericVals.reduce((a, b) => a + b, 0);
        let meanVal = sumVal / count;
        let variance = numericVals.reduce((acc, v) => acc + (v - meanVal) ** 2, 0) / count;
        let stdVal = Math.sqrt(variance);

        let statsHtml = `
            <div class="stats-header">Statistiche per "${field}"</div>
            <ul class="stats-list">
                <li>Conteggio: ${count}</li>
                <li>Minimo: ${minVal.toFixed(2)}</li>
                <li>Massimo: ${maxVal.toFixed(2)}</li>
                <li>Media: ${meanVal.toFixed(2)}</li>
                <li>Somma: ${sumVal.toFixed(2)}</li>
                ${count > 1 ? `<li>Deviazione standard: ${stdVal.toFixed(2)}</li>` : ''}
            </ul>
        `;
        statsPreview.innerHTML = statsHtml;

        charts.forEach(c => c.destroy());
        charts = [];
        chartsContainer.innerHTML = "";

        // Grafico 1: Istogramma
        let chartBox1 = document.createElement('div');
        chartBox1.className = 'chart-box';
        let canvas1 = document.createElement('canvas');
        chartBox1.appendChild(canvas1);
        chartsContainer.appendChild(chartBox1);
        let ctx1 = canvas1.getContext('2d');
        let histogramData = createHistogramData(numericVals, 10);
        let chart1 = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: histogramData.labels,
                datasets: [{
                    label: `Distribuzione di ${field}`,
                    data: histogramData.counts,
                    backgroundColor: 'var(--primary)'
                }]
            },
            options: {
                scales: {
                    y: {beginAtZero: true},
                    x: {ticks: {autoSkip: false}}
                }
            }
        });
        charts.push(chart1);

        // Grafico 2: Barre per Minimo, Massimo e Media
        let chartBox2 = document.createElement('div');
        chartBox2.className = 'chart-box';
        let canvas2 = document.createElement('canvas');
        chartBox2.appendChild(canvas2);
        chartsContainer.appendChild(chartBox2);
        let ctx2 = canvas2.getContext('2d');
        let chart2 = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ["Minimo", "Massimo", "Media"],
                datasets: [{
                    label: `Statistiche di ${field}`,
                    data: [minVal, maxVal, meanVal],
                    backgroundColor: ['#e74c3c', '#2ecc71', '#f1c40f']
                }]
            },
            options: {
                scales: {
                    y: {beginAtZero: true}
                }
            }
        });
        charts.push(chart2);
    }
}

function createHistogramData(values, nBins) {
    let minVal = Math.min(...values);
    let maxVal = Math.max(...values);
    let range = maxVal - minVal;
    let binSize = range / nBins;
    let counts = new Array(nBins).fill(0);

    values.forEach(v => {
        let idx = Math.floor((v - minVal) / binSize);
        if (idx === nBins) idx = nBins - 1;
        counts[idx]++;
    });

    let labels = [];
    for (let i = 0; i < nBins; i++) {
        let start = minVal + i * binSize;
        let end = start + binSize;
        labels.push(`${start.toFixed(2)} - ${end.toFixed(2)}`);
    }

    return {labels, counts};
}

/************************************************************************
 * DASHBOARD AVANZATA
 ************************************************************************/
function createAdvancedDashboard() {
  const dashboardContainer = document.getElementById('dashboardContainer');

  if (!dashboardContainer) {
    console.error("Dashboard container not found in the DOM");
    return;
  }

  console.log("Creating advanced dashboard with", filteredData.length, "data points");

  if (filteredData.length === 0) {
    dashboardContainer.innerHTML = '<div class="alert-warning">Nessun dato disponibile per la dashboard.</div>';
    dashboardContainer.style.display = 'block';
    return;
  }

  // Forza la visualizzazione del container
  dashboardContainer.style.display = 'block';
  statsPreview.style.display = 'none';
  chartsContainer.style.display = 'none';

  // Crea layout dashboard
  dashboardContainer.innerHTML = `
    <div class="dashboard-header">
      <h3>Dashboard interattiva</h3>
      <div class="dashboard-controls">
        <select id="dashboardField">
          <option value="Addebito">Addebito</option>
          <option value="totale transazioni">Totale transazioni</option>
        </select>
        <select id="dashboardGroupBy">
          <option value="merchant">Raggruppa per merchant</option>
          <option value="descr">Raggruppa per descrizione</option>
        </select>
      </div>
    </div>
    <div class="dashboard-grid">
      <div class="chart-box chart-box-large">
        <h4>Trend complessivo</h4>
        <canvas id="timeSeriesChart"></canvas>
      </div>
      <div class="chart-box">
        <h4>Distribuzione valori</h4>
        <canvas id="distributionChart"></canvas>
      </div>
      <div class="chart-box">
        <h4>Top 5 valori</h4>
        <canvas id="topFiveChart"></canvas>
      </div>
      <div class="chart-box">
        <h4>Suddivisione per categoria</h4>
        <canvas id="categoryComparisonChart"></canvas>
      </div>
    </div>
    <div class="dashboard-summary">
      <h4>Sintesi dei dati</h4>
      <div id="dataSummary" class="data-summary"></div>
    </div>
  `;

  console.log("Dashboard layout created");

  // Verifica che gli elementi necessari esistano
  const elements = [
    'dashboardField', 'dashboardGroupBy', 'timeSeriesChart', 'distributionChart',
    'topFiveChart', 'categoryComparisonChart', 'dataSummary'
  ];

  for (const elementId of elements) {
    if (!document.getElementById(elementId)) {
      console.error(`Element with ID '${elementId}' not found after creating dashboard layout`);
    }
  }

  // Inizializza i grafici
  try {
    updateDashboardCharts();

    // Aggiungi listener per i controlli della dashboard
    document.getElementById('dashboardField').addEventListener('change', updateDashboardCharts);
    document.getElementById('dashboardGroupBy').addEventListener('change', updateDashboardCharts);

    console.log("Dashboard initialization completed");
  } catch (error) {
    console.error("Error initializing dashboard:", error);
    dashboardContainer.innerHTML += `<div class="alert-warning">Errore nell'inizializzazione della dashboard: ${error.message}</div>`;
  }
}

function updateDashboardCharts() {
    const field = document.getElementById('dashboardField').value;
    const groupBy = document.getElementById('dashboardGroupBy').value;

    // Ottieni valori numerici dal campo selezionato
    let numericData = [];
    filteredData.forEach(item => {
        let raw = item[field] || "";
        let num = parseFloat(raw.replace(',', '.').replace(/[^0-9.-]/g, ''));
        if (!isNaN(num)) {
            numericData.push({
                value: num,
                merchant: item.descriptionMerchant || "",
                description: item.descrizione || "",
                category: groupBy === 'merchant' ? item.descriptionMerchant : item.descrizione
            });
        }
    });

    if (numericData.length === 0) {
        document.getElementById('dashboardContainer').innerHTML = '<div class="alert-warning">Nessun valore numerico valido per la dashboard.</div>';
        return;
    }

    // Crea i vari grafici
    createTimeSeriesChart(numericData);
    createDistributionChart(numericData);
    createTopFiveChart(numericData, groupBy);
    createCategoryComparisonChart(numericData, groupBy);
    createDataSummary(numericData);
}

function createTimeSeriesChart(data) {
    // Simula dati temporali (in una versione reale usare date dai dati)
    const canvas = document.getElementById('timeSeriesChart');
    const ctx = canvas.getContext('2d');

    // Ordina i dati per valore per creare un trend
    const sortedData = [...data].sort((a, b) => a.value - b.value);
    const values = sortedData.map(d => d.value);

    // Crea labels (1, 2, 3, ...)
    const labels = Array.from({length: values.length}, (_, i) => i + 1);

    // Controllo sicuro prima di distruggere il grafico precedente
    if (window.timeSeriesChart && typeof window.timeSeriesChart.destroy === 'function') {
        window.timeSeriesChart.destroy();
    }

    window.timeSeriesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Trend valori',
                data: values,
                borderColor: '#4361ee',
                backgroundColor: 'rgba(67, 97, 238, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {position: 'top'},
                title: {display: false}
            },
            scales: {
                y: {beginAtZero: false},
                x: {
                    title: {display: true, text: 'Sequenza record'}
                }
            }
        }
    });
}

function createDistributionChart(data) {
    const canvas = document.getElementById('distributionChart');
    const ctx = canvas.getContext('2d');

    // Calcola gli intervalli per l'istogramma
    const values = data.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
    const binSize = range / binCount;

    const bins = Array(binCount).fill(0);
    values.forEach(val => {
        const binIndex = Math.min(Math.floor((val - min) / binSize), binCount - 1);
        bins[binIndex]++;
    });

    const binLabels = [];
    for (let i = 0; i < binCount; i++) {
        const start = min + i * binSize;
        const end = start + binSize;
        binLabels.push(`${start.toFixed(1)}-${end.toFixed(1)}`);
    }

    // Controllo sicuro prima di distruggere il grafico precedente
    if (window.distributionChart && typeof window.distributionChart.destroy === 'function') {
        window.distributionChart.destroy();
    }

    window.distributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: binLabels,
            datasets: [{
                label: 'Frequenza',
                data: bins,
                backgroundColor: '#4cc9f0',
                borderColor: '#3f37c9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {beginAtZero: true},
                x: {display: true}
            }
        }
    });
}

function createTopFiveChart(data, groupBy) {
    const canvas = document.getElementById('topFiveChart');
    const ctx = canvas.getContext('2d');

    // Raggruppa per categoria
    const groupedData = {};
    data.forEach(item => {
        const category = item.category || "N/A";
        if (!groupedData[category]) {
            groupedData[category] = {
                sum: 0,
                count: 0
            };
        }
        groupedData[category].sum += item.value;
        groupedData[category].count++;
    });

    // Converti in array e calcola media per categoria
    const categoryData = Object.keys(groupedData).map(cat => ({
        category: cat,
        sum: groupedData[cat].sum,
        avg: groupedData[cat].sum / groupedData[cat].count
    }));

    // Ordina e prendi i primi 5
    const topFive = categoryData
        .sort((a, b) => b.sum - a.sum)
        .slice(0, 5);

    // Controllo sicuro prima di distruggere il grafico precedente
    if (window.topFiveChart && typeof window.topFiveChart.destroy === 'function') {
        window.topFiveChart.destroy();
    }

    window.topFiveChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topFive.map(d => d.category.length > 12 ? d.category.substring(0, 12) + '...' : d.category),
            datasets: [{
                label: 'Totale',
                data: topFive.map(d => d.sum),
                backgroundColor: '#f72585',
                borderColor: '#3f37c9',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {display: false},
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const index = context.dataIndex;
                            return [
                                `Totale: ${topFive[index].sum.toFixed(2)}`,
                                `Media: ${topFive[index].avg.toFixed(2)}`
                            ];
                        }
                    }
                }
            },
            scales: {
                y: {beginAtZero: true}
            }
        }
    });
}

function createCategoryComparisonChart(data, groupBy) {
    const canvas = document.getElementById('categoryComparisonChart');
    const ctx = canvas.getContext('2d');

    // Raggruppa per categoria
    const groupedData = {};
    data.forEach(item => {
        const category = item.category || "N/A";
        if (!groupedData[category]) {
            groupedData[category] = {
                sum: 0,
                count: 0
            };
        }
        groupedData[category].sum += item.value;
        groupedData[category].count++;
    });

    // Converti in array
    const categoryData = Object.keys(groupedData).map(cat => ({
        category: cat,
        sum: groupedData[cat].sum
    }));

    // Limita a massimo 8 categorie + Altri
    let chartData;
    if (categoryData.length <= 8) {
        chartData = categoryData;
    } else {
        // Ordina per somma e prendi i primi 7
        const sortedData = [...categoryData].sort((a, b) => b.sum - a.sum);
        const topSeven = sortedData.slice(0, 7);
        const others = sortedData.slice(7);

        // Calcola la somma degli "Altri"
        const othersSum = others.reduce((total, item) => total + item.sum, 0);

        // Aggiungi "Altri" alla lista
        topSeven.push({
            category: "Altri",
            sum: othersSum
        });

        chartData = topSeven;
    }

    // Crea colori per le categorie
    const backgroundColors = [
        '#4361ee', '#3a0ca3', '#4895ef', '#4cc9f0',
        '#f72585', '#b5179e', '#7209b7', '#560bad'
    ];

    // Controllo sicuro prima di distruggere il grafico precedente
    if (window.categoryChart && typeof window.categoryChart.destroy === 'function') {
        window.categoryChart.destroy();
    }

    window.categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: chartData.map(d => d.category.length > 10 ? d.category.substring(0, 10) + '...' : d.category),
            datasets: [{
                data: chartData.map(d => d.sum),
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 15,
                        font: {size: 10}
                    }
                }
            }
        }
    });
}

function createDataSummary(data) {
    const summaryContainer = document.getElementById('dataSummary');
    const values = data.map(d => d.value);

    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sorted = [...values].sort((a, b) => a - b);
    const median = values.length % 2 === 0
        ? (sorted[values.length / 2 - 1] + sorted[values.length / 2]) / 2
        : sorted[Math.floor(values.length / 2)];

    // Deviazione standard
    const variance = values.reduce((total, val) => total + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    summaryContainer.innerHTML = `
      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-value">${values.length}</div>
          <div class="summary-label">Record</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${sum.toFixed(2)}</div>
          <div class="summary-label">Totale</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${avg.toFixed(2)}</div>
          <div class="summary-label">Media</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${median.toFixed(2)}</div>
          <div class="summary-label">Mediana</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${min.toFixed(2)}</div>
          <div class="summary-label">Minimo</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${max.toFixed(2)}</div>
          <div class="summary-label">Massimo</div>
        </div>
        <div class="summary-card">
          <div class="summary-value">${stdDev.toFixed(2)}</div>
          <div class="summary-label">Deviazione std</div>
        </div>
      </div>
    `;
}

/************************************************************************
 * GESTIONE EMAIL
 ************************************************************************/
// Carica configurazione email (simulata)
function loadEmailConfig() {
    try {
        const savedConfig = localStorage.getItem('emailConfig');
        if (savedConfig) {
            emailConfig = JSON.parse(savedConfig);
            console.log("Email config loaded:", emailConfig);
        } else {
            // Default configuration
            emailConfig = {
                service: '',
                user: '',
                password: '',
                smtpServer: '',
                smtpPort: '587'
            };
        }
    } catch (error) {
        console.error("Error loading email config:", error);
    }
}

// Simulazione della funzionalità di invio email
function sendReportEmail() {
    const recipients = document.getElementById('emailRecipients').value.trim();
    if (!recipients) {
        showNotification('Inserisci almeno un destinatario.', 'error');
        return;
    }

    const subject = document.getElementById('emailSubject').value.trim() || 'Report Commissioni';
    const message = document.getElementById('emailMessage').value.trim() || 'Report commissioni in allegato.';

    const formatRadios = document.getElementsByName('reportFormat');
    let selectedFormat = 'csv';
    for (const radio of formatRadios) {
        if (radio.checked) {
            selectedFormat = radio.value;
            break;
        }
    }

    const includeStats = document.getElementById('includeStats').checked;

    if (!emailConfig.service && !emailConfig.smtpServer) {
        showNotification('Configurazione email incompleta. Configura prima le impostazioni SMTP.', 'error');
        return;
    }

    // Generazione degli allegati (simulata)
    if (filteredData.length === 0) {
        showNotification('Nessun dato da inviare.', 'error');
        return;
    }

    const emailStatus = document.getElementById('emailStatus');
    emailStatus.textContent = 'Preparazione e invio email in corso...';
    emailStatus.style.display = 'block';
    emailStatus.className = 'status-message alert-info';

    // Simula un ritardo per l'invio
    setTimeout(() => {
        emailStatus.textContent = `Email inviata con successo a ${recipients}!`;
        emailStatus.className = 'status-message alert-success';

        setTimeout(() => {
            emailStatus.style.display = 'none';
        }, 5000);
    }, 2000);
}

// Aggiorna campi SMTP in base al servizio selezionato
function updateSmtpFields() {
    const service = document.getElementById('emailService').value;
    const smtpSettings = document.getElementById('smtpSettings');

    if (service === 'other') {
        smtpSettings.style.display = 'block';
    } else {
        smtpSettings.style.display = 'none';
    }
}

// Testa connessione SMTP
function testSmtpConnection() {
    const smtpStatus = document.getElementById('smtpStatus');
    smtpStatus.textContent = 'Verifica connessione in corso...';
    smtpStatus.style.display = 'block';
    smtpStatus.className = 'status-message alert-info';

    const service = document.getElementById('emailService').value;
    const user = document.getElementById('emailUser').value.trim();
    const password = document.getElementById('emailPassword').value;

    if (!service || !user || !password) {
        smtpStatus.textContent = 'Completa tutti i campi obbligatori.';
        smtpStatus.className = 'status-message alert-error';
        return;
    }

    // Se è selezionato "other", verifica anche i campi del server SMTP
    if (service === 'other') {
        const smtpServer = document.getElementById('smtpServer').value.trim();
        const smtpPort = document.getElementById('smtpPort').value.trim();

        if (!smtpServer || !smtpPort) {
            smtpStatus.textContent = 'Per i servizi personalizzati è necessario specificare server e porta SMTP.';
            smtpStatus.className = 'status-message alert-error';
            return;
        }
    }

    // Simula una verifica della connessione
    setTimeout(() => {
        // Simuliamo un successo
        smtpStatus.textContent = 'Connessione SMTP verificata con successo!';
        smtpStatus.className = 'status-message alert-success';

        setTimeout(() => {
            smtpStatus.style.display = 'none';
        }, 5000);
    }, 2000);
}

// Salva configurazione email
function saveEmailConfig() {
    const service = document.getElementById('emailService').value;
    const user = document.getElementById('emailUser').value.trim();
    const password = document.getElementById('emailPassword').value;
    let smtpServer = '';
    let smtpPort = '587';

    if (service === 'other') {
        smtpServer = document.getElementById('smtpServer').value.trim();
        smtpPort = document.getElementById('smtpPort').value.trim();

        if (!smtpServer || !smtpPort) {
            alert('Per i servizi personalizzati è necessario specificare server e porta SMTP.');
            return;
        }
    }

    if (!service || !user || !password) {
        alert('Completa tutti i campi obbligatori.');
        return;
    }

    // Salva la configurazione
    emailConfig = {
        service,
        user,
        password,
        smtpServer,
        smtpPort
    };

    // Salva in localStorage (in un'app reale, queste info sarebbero salvate in modo sicuro)
    try {
        localStorage.setItem('emailConfig', JSON.stringify(emailConfig));

        const smtpStatus = document.getElementById('smtpStatus');
        smtpStatus.textContent = 'Configurazione salvata con successo!';
        smtpStatus.style.display = 'block';
        smtpStatus.className = 'status-message alert-success';

        setTimeout(() => {
            smtpStatus.style.display = 'none';
        }, 5000);

        // Abilita il pulsante di invio email se ci sono dati
        document.getElementById('sendEmailButton').disabled = filteredData.length === 0;

    } catch (error) {
        console.error('Errore nel salvataggio della configurazione email:', error);
        alert('Errore nel salvataggio della configurazione.');
    }
}

/************************************************************************
 * GESTIONE AGGIORNAMENTI AUTOMATICI
 ************************************************************************/
function checkForUpdates() {
    // In una vera implementazione, qui si chiamerebbe l'API di Electron
    // window.api.send('update:check');

    // Simuliamo un aggiornamento disponibile dopo 3 secondi
    setTimeout(() => {
        showUpdateAvailable('1.1.0');
    }, 3000);
}

// Mostra banner aggiornamento disponibile
function showUpdateAvailable(version) {
    const updateBanner = document.getElementById('updateBanner');
    const updateMessage = document.getElementById('updateMessage');

    updateMessage.textContent = `Aggiornamento alla versione ${version} disponibile!`;
    updateBanner.style.display = 'block';

    // Animazione di slide-down
    setTimeout(() => {
        updateBanner.style.height = '40px';
        updateBanner.style.opacity = '1';
    }, 100);
}

// Nascondi banner aggiornamento
function hideUpdateBanner() {
    const updateBanner = document.getElementById('updateBanner');
    updateBanner.style.height = '0';
    updateBanner.style.opacity = '0';

    setTimeout(() => {
        updateBanner.style.display = 'none';
    }, 300);
}

// Simula download e installazione dell'aggiornamento
function downloadAndInstallUpdate() {
    showNotification('Download aggiornamento in corso...', 'info');

    // Simuliamo il download (3 secondi)
    setTimeout(() => {
        showNotification('Aggiornamento scaricato! Riavvio in corso...', 'success');

        // Simuliamo il riavvio (2 secondi)
        setTimeout(() => {
            showNotification('Applicazione aggiornata con successo!', 'success');
            hideUpdateBanner();
        }, 2000);
    }, 3000);
}

/************************************************************************
 * NOTIFICHE
 ************************************************************************/
function showNotification(message, type = 'info') {
    resultInfo.textContent = message;
    resultInfo.style.display = 'block';
    switch (type) {
        case 'error':
            resultInfo.style.borderLeftColor = 'var(--danger)';
            break;
        case 'success':
            resultInfo.style.borderLeftColor = 'var(--success)';
            break;
        default:
            resultInfo.style.borderLeftColor = 'var(--primary)';
    }
}