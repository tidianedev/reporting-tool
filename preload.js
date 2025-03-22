// preload.js
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Espone funzionalità sicure di Electron e Node.js all'applicazione
contextBridge.exposeInMainWorld('electronAPI', {
  // Funzionalità per il sistema di file
  fileSystem: {
    // Salva un file in una posizione scelta dall'utente
    saveFile: async (content, defaultPath, fileTypes) => {
      try {
        const result = await ipcRenderer.invoke('dialog:saveFile', {
          defaultPath,
          fileTypes
        });

        if (result.canceled) return { success: false, message: 'Operazione annullata.' };

        fs.writeFileSync(result.filePath, content);
        return {
          success: true,
          filePath: result.filePath,
          message: 'File salvato con successo.'
        };
      } catch (error) {
        return {
          success: false,
          message: `Errore durante il salvataggio: ${error.message}`
        };
      }
    },

    // Legge un file JSON
    readJsonFile: (filePath) => {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        return { success: true, data: JSON.parse(content) };
      } catch (error) {
        return {
          success: false,
          message: `Errore durante la lettura del file: ${error.message}`
        };
      }
    }
  },

  // Informazioni di sistema
  system: {
    // Ottiene le informazioni sul sistema operativo
    getOsInfo: () => {
      return {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
        userInfo: os.userInfo().username,
        tempDir: os.tmpdir()
      };
    },

    // Ottiene il percorso della cartella documenti dell'utente
    getDocumentsPath: () => {
      return path.join(os.homedir(), 'Documents');
    }
  },

  // Gestione applicazione
  app: {
    // Ottiene la versione dell'applicazione
    getVersion: async () => {
      return await ipcRenderer.invoke('app:getVersion');
    },

    // Ottiene il percorso dell'applicazione
    getAppPath: async () => {
      return await ipcRenderer.invoke('app:getPath');
    },

    // Apre un link esterno nel browser predefinito
    openExternalLink: (url) => {
      ipcRenderer.send('open:externalLink', url);
    },

    // Minimizza la finestra dell'applicazione
    minimizeWindow: () => {
      ipcRenderer.send('window:minimize');
    },

    // Massimizza o ripristina la finestra dell'applicazione
    maximizeWindow: () => {
      ipcRenderer.send('window:maximize');
    },

    // Chiude l'applicazione
    closeWindow: () => {
      ipcRenderer.send('window:close');
    }
  }
});

// Ascoltatori di eventi DOM
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM completamente caricato');

  // Qui puoi inserire codice che deve essere eseguito quando il DOM è caricato
  // ma prima che vengano caricate le risorse esterne (immagini, stylesheet, ecc.)
});

// Per comunicare messaggi di log al processo principale (utile per debug)
contextBridge.exposeInMainWorld('logger', {
  log: (message) => {
    ipcRenderer.send('log:message', message);
  },
  error: (message) => {
    ipcRenderer.send('log:error', message);
  }
});

// Espone funzionalità specifiche per l'applicazione di reporting
contextBridge.exposeInMainWorld('reportingTool', {
  // Salva il report in formato CSV
  saveCsvReport: async (data, defaultFilename) => {
    return await ipcRenderer.invoke('report:saveCsv', { data, defaultFilename });
  },

  // Salva il report in formato XLSX
  saveXlsxReport: async (data, defaultFilename) => {
    return await ipcRenderer.invoke('report:saveXlsx', { data, defaultFilename });
  },

  // Funzione per ottenere i file recenti
  getRecentFiles: async () => {
    return await ipcRenderer.invoke('app:getRecentFiles');
  },

  // Funzione per aggiungere un file alla lista dei recenti
  addRecentFile: (filePath) => {
    ipcRenderer.send('app:addRecentFile', filePath);
  }
});