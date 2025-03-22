# Tool di Reporting Commissioni Mensile

Un'applicazione desktop per l'estrazione e l'analisi di dati da file JSON, con funzionalità di filtraggio, statistica e esportazione dei risultati.

![Screenshot dell'applicazione](screenshot.png)

## Caratteristiche principali

- **Facile importazione di dati**: supporto per drag & drop di file JSON
- **Estrazione intelligente**: estrae automaticamente campi come descrizioni, importi, IBAN e altri dettagli
- **Filtri avanzati**: filtra i dati in base a diversi criteri (maggiore, minore, uguale, contiene)
- **Visualizzazione tabellare**: visualizza i dati estratti in una tabella ordinata
- **Esportazione flessibile**: esporta i risultati in formato CSV o XLSX
- **Analisi statistica**: calcola automaticamente statistiche sui dati numerici (minimo, massimo, media, deviazione standard)
- **Visualizzazione grafica**: genera grafici per la distribuzione dei dati e le statistiche principali

## Requisiti di sistema

- Windows 10/11 (64-bit)
- macOS 10.13 o successivo
- Ubuntu 18.04 o distribuzioni Linux equivalenti

## Installazione

### Windows
1. Scarica il file `Reporting-Tool-Setup-x.x.x.exe` dalla cartella delle release
2. Esegui il file di installazione e segui le istruzioni
3. L'applicazione verrà installata e sarà accessibile dal menu Start

### macOS
1. Scarica il file `Reporting-Tool-x.x.x.dmg` dalla cartella delle release
2. Apri il file DMG e trascina l'applicazione nella cartella Applicazioni
3. Avvia l'applicazione da Launchpad o dalla cartella Applicazioni

### Linux
1. Scarica il file `Reporting-Tool-x.x.x.AppImage` dalla cartella delle release
2. Rendi il file eseguibile: `chmod +x Reporting-Tool-x.x.x.AppImage`
3. Esegui l'applicazione: `./Reporting-Tool-x.x.x.AppImage`

## Guida all'uso

### 1. Selezione dei file
- Clicca sull'area di trascinamento o trascina direttamente uno o più file JSON
- I file selezionati verranno mostrati con dimensione e nome

### 2. Configura i campi e i filtri
- Seleziona o deseleziona i campi da estrarre
- Opzionalmente attiva il filtro e configura i criteri

### 3. Elabora i file
- Clicca sul pulsante "Elabora i file JSON"
- Attendi il completamento dell'elaborazione (visibile tramite la barra di progresso)

### 4. Esporta i risultati
- Visualizza l'anteprima dei dati estratti
- Esporta i risultati in formato CSV o XLSX

### 5. Analisi statistica
- Seleziona il campo numerico da analizzare
- Genera statistiche e visualizza i grafici relativi ai dati

## Risoluzione dei problemi

**Problema**: L'applicazione non riesce ad aprire i file JSON
**Soluzione**: Verifica che i file JSON siano validi e ben formattati

**Problema**: I dati estratti sono incompleti
**Soluzione**: Il formato dei dati nei file JSON potrebbe non essere riconosciuto. Verifica che i file contengano un campo "descriptionMerchant" o simile.

**Problema**: L'applicazione si blocca durante l'elaborazione
**Soluzione**: I file potrebbero essere troppo grandi. Prova a suddividerli in file più piccoli.

## Informazioni di supporto

Per assistenza o per segnalare problemi, contattare il supporto tecnico all'indirizzo gueaserge2@gmail.com.

## Note legali nmwr rphm rnhd sdjg

© 2025 - Tool Reporting Commissioni | Powered by Serge Guea
