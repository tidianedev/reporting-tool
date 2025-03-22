# Tool di Reporting Commissioni Mensile

Un'applicazione desktop per l'estrazione e l'analisi di dati da file JSON, XML e CSV, con funzionalità di filtraggio, statistica, invio email e esportazione dei risultati in vari formati.

![Screenshot dell'applicazione](screenshot.png)

## Caratteristiche principali

- **Facile importazione di dati**: supporto per drag & drop di file JSON, XML e CSV
- **Estrazione intelligente**: estrae automaticamente campi come descrizioni, importi, IBAN e altri dettagli
- **Filtri avanzati**: filtra i dati in base a diversi criteri (maggiore, minore, uguale, contiene)
- **Visualizzazione tabellare**: visualizza i dati estratti in una tabella ordinata
- **Esportazione multipla**: esporta i risultati in formato CSV, XLSX o PDF
- **Analisi statistica**: calcola automaticamente statistiche sui dati numerici (minimo, massimo, media, deviazione standard)
- **Visualizzazione grafica**: genera grafici per la distribuzione dei dati e le statistiche principali
- **Invio email**: invia direttamente i report via email, con supporto per diversi servizi (Gmail, Outlook, SMTP)
- **Dashboard interattiva**: visualizza i dati estratti in una dashboard con grafici avanzati

## Requisiti di sistema

- Windows 10/11 (64-bit)
- macOS 10.13 o successivo
- Ubuntu 18.04 o distribuzioni Linux equivalenti
- Minimo 4 GB RAM (consigliati 8 GB per file di grandi dimensioni)
- 120 MB di spazio su disco

## Installazione

### Windows
1. Scarica il file `Reporting-Tool-Setup-1.1.0.exe` dalla cartella delle release
2. Esegui il file di installazione e segui le istruzioni
3. L'applicazione verrà installata e sarà accessibile dal menu Start

### macOS
1. Scarica il file `Reporting-Tool-1.1.0.dmg` dalla cartella delle release
2. Apri il file DMG e trascina l'applicazione nella cartella Applicazioni
3. Avvia l'applicazione da Launchpad o dalla cartella Applicazioni

### Linux
1. Scarica il file `Reporting-Tool-1.1.0.AppImage` dalla cartella delle release
2. Rendi il file eseguibile: 
   ```bash
   chmod +x Reporting-Tool-1.1.0.AppImage
   ```
3. Esegui l'applicazione: 
   ```bash
   ./Reporting-Tool-1.1.0.AppImage
   ```

In alternativa, è possibile installare l'applicazione globalmente:
   ```bash
   sudo mv Reporting-Tool-1.1.0.AppImage /usr/local/bin/reporting-tool
   sudo chmod +x /usr/local/bin/reporting-tool
   ```

Dopo l'installazione globale, avvia l'applicazione da qualsiasi posizione:
   ```bash
   reporting-tool
   ```

## Guida all'uso

### 1. Selezione dei file
- Clicca sull'area di trascinamento o trascina direttamente uno o più file JSON, XML o CSV
- I file selezionati verranno mostrati con dimensione e nome
- Puoi anche accedere ai file recenti dal menu File

### 2. Configura i campi e i filtri
- Seleziona o deseleziona i campi da estrarre
- Opzionalmente attiva il filtro e configura i criteri
- Utilizza i preset di filtri [BETA] per salvare configurazioni frequentemente utilizzate

### 3. Elabora i file
- Clicca sul pulsante "Elabora i file"
- Attendi il completamento dell'elaborazione (visibile tramite la barra di progresso)

### 4. Esporta i risultati
- Visualizza l'anteprima dei dati estratti
- Esporta i risultati in formato CSV, XLSX o PDF
- Invia direttamente i risultati via email configurando il servizio di posta

### 5. Analisi statistica
- Seleziona il campo numerico da analizzare
- Genera statistiche e visualizza i grafici relativi ai dati
- Utilizza la dashboard interattiva per un'analisi più approfondita

## Configurazione email

1. Vai al menu "Strumenti" > "Configura Email"
2. Seleziona il servizio email (Gmail, Outlook) o configura un server SMTP personalizzato
3. Inserisci le credenziali di accesso
4. Testa la connessione prima di utilizzare la funzionalità
5. Salva la configurazione

## Risoluzione dei problemi

**Problema**: L'applicazione non riesce ad aprire i file
**Soluzione**: Verifica che i file siano validi e ben formattati nel formato corrispondente (JSON, XML, CSV)

**Problema**: I dati estratti sono incompleti
**Soluzione**: Il formato dei dati potrebbe non essere riconosciuto. Verifica che i file contengano un campo "descriptionMerchant" o simile.

**Problema**: L'invio email non funziona
**Soluzione**: Verifica la configurazione del server email e le credenziali. Alcuni provider potrebbero richiedere l'utilizzo di app password o la modifica delle impostazioni di sicurezza.

**Problema**: L'applicazione si blocca durante l'elaborazione
**Soluzione**: I file potrebbero essere troppo grandi. Prova a suddividerli in file più piccoli o aumenta la memoria disponibile.

## Informazioni di supporto

Per assistenza o per segnalare problemi, contattare:
- Email: gueaserge2@gmail.com
- Telefono: +39 3892978507

## Novità nella versione 1.1.0

- Sistema completo di invio report via email
- Esportazione in formato PDF
- Supporto per file XML e CSV
- Dashboard interattiva con grafici avanzati
- Versione beta del sistema di preset per i filtri
- Miglioramenti dell'interfaccia utente
- Ottimizzazione delle prestazioni

## Note legali

© 2025 - Tool Reporting Commissioni | Powered by Serge Guea
