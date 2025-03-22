// il modulo per la gestione dei file e le informazioni di sistema sono stati spostati nel processo principale.
// Questo è necessario per garantire che le operazioni di file system siano sicure e che le informazioni di sistema siano protette da accessi non autorizzati.

const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Gestione configurazione dell'applicazione
const appConfig = {
  recentFiles: [],
  maxRecentFiles: 10,
  configPath: path.join(app.getPath('userData'), 'config.json'),

  // Carica la configurazione
  load() {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        this.recentFiles = data.recentFiles || [];
        this.maxRecentFiles = data.maxRecentFiles || 10;
      }
    } catch (error) {
      console.error('Errore nel caricamento della configurazione:', error);
    }
  },

  // Salva la configurazione
  save() {
    try {
      const data = {
        recentFiles: this.recentFiles,
        maxRecentFiles: this.maxRecentFiles
      };
      fs.writeFileSync(this.configPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
      console.error('Errore nel salvataggio della configurazione:', error);
    }
  },

  // Aggiunge un file alla lista dei recenti
  addRecentFile(filePath) {
    // Rimuove il file se già presente
    this.recentFiles = this.recentFiles.filter(path => path !== filePath);

    // Aggiunge il file all'inizio della lista
    this.recentFiles.unshift(filePath);

    // Mantiene solo il numero massimo di file recenti
    if (this.recentFiles.length > this.maxRecentFiles) {
      this.recentFiles = this.recentFiles.slice(0, this.maxRecentFiles);
    }

    this.save();
  }
};

// Carica la configurazione all'avvio
appConfig.load();

// Finestra principale dell'applicazione
let mainWindow;

// Crea la finestra principale
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, 'icons/icon.png'),
    show: false, // Non mostrare la finestra fino a quando non è pronta
    backgroundColor: '#f5f7fa' // Colore di sfondo durante il caricamento
  });

  // Carica il file HTML
  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));

  // Evento quando la finestra è pronta per essere mostrata
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Opzionale: applica effetto di fade-in
    mainWindow.webContents.executeJavaScript('document.body.style.opacity = "0"; setTimeout(() => { document.body.style.transition = "opacity 400ms ease"; document.body.style.opacity = "1"; }, 100);');
  });

  // Evento chiusura finestra
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Crea il menu dell'applicazione
  createAppMenu();
}

// Crea il menu dell'applicazione
function createAppMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    // Menu File
    {
      label: 'File',
      submenu: [
        {
          label: 'Apri JSON...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const { canceled, filePaths } = await dialog.showOpenDialog({
              properties: ['openFile', 'multiSelections'],
              filters: [
                { name: 'JSON', extensions: ['json'] }
              ]
            });

            if (!canceled && filePaths.length > 0) {
              filePaths.forEach(filePath => {
                appConfig.addRecentFile(filePath);
              });

              // Invia i file selezionati alla finestra
              mainWindow.webContents.send('files:opened', filePaths);
            }
          }
        },
        {
          label: 'File recenti',
          submenu: [
            {
              label: 'Nessun file recente',
              enabled: false
            }
          ]
        },
        { type: 'separator' },
        {
          label: 'Esporta come CSV',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow.webContents.send('app:exportCsv');
          }
        },
        {
          label: 'Esporta come XLSX',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => {
            mainWindow.webContents.send('app:exportXlsx');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },

    // Menu Modifica
    {
      label: 'Modifica',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },

    // Menu Visualizza
    {
      label: 'Visualizza',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },

    // Menu Aiuto
    {
      role: 'help',
      submenu: [
        {
          label: 'Guida utente',
          click: async () => {
            await shell.openExternal('https://tuodominio.com/guida');
          }
        },
        {
          label: 'Informazioni su',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              title: 'Informazioni',
              message: 'Tool di Reporting Commissioni Mensile',
              detail: `Versione: ${app.getVersion()}\n© 2025 - Tool Reporting Commissioni | Powered by Serge Guea`,
              type: 'info',
              buttons: ['Chiudi'],
              defaultId: 0
            });
          }
        }
      ]
    }
  ];

  updateRecentFilesMenu(template);

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Aggiorna il menu dei file recenti
function updateRecentFilesMenu(template) {
  const recentFilesMenu = template[0].submenu[1].submenu;

  if (appConfig.recentFiles.length > 0) {
    recentFilesMenu.length = 0; // Svuota il sottomenu

    appConfig.recentFiles.forEach((filePath, index) => {
      if (fs.existsSync(filePath)) {
        const fileName = path.basename(filePath);
        recentFilesMenu.push({
          label: `${index + 1}. ${fileName}`,
          click: () => {
            mainWindow.webContents.send('files:opened', [filePath]);
          }
        });
      }
    });

    recentFilesMenu.push({ type: 'separator' });
    recentFilesMenu.push({
      label: 'Cancella file recenti',
      click: () => {
        appConfig.recentFiles = [];
        appConfig.save();
        updateRecentFilesMenu(template);
        Menu.setApplicationMenu(Menu.buildFromTemplate(template));
      }
    });
  } else {
    recentFilesMenu.length = 0;
    recentFilesMenu.push({
      label: 'Nessun file recente',
      enabled: false
    });
  }
}

// Quando l'app è pronta
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // Su macOS è comune ricreare una finestra quando
    // l'icona del dock viene cliccata e non ci sono altre finestre aperte
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Gestione dei canali IPC (comunicazione tra processi)
  setupIpcHandlers();
});

// Chiude l'app quando tutte le finestre sono chiuse (eccetto su macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Configurazione dei gestori IPC
function setupIpcHandlers() {
  // Dialogo per salvare file
  ipcMain.handle('dialog:saveFile', async (event, options) => {
    const { defaultPath, fileTypes } = options;

    const result = await dialog.showSaveDialog({
      defaultPath: defaultPath || 'export.csv',
      filters: fileTypes || [
        { name: 'CSV', extensions: ['csv'] },
        { name: 'Excel', extensions: ['xlsx'] },
        { name: 'Tutti i file', extensions: ['*'] }
      ],
      properties: ['createDirectory', 'showOverwriteConfirmation']
    });

    return {
      canceled: result.canceled,
      filePath: result.filePath
    };
  });

  // Ottiene la versione dell'app
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  // Ottiene il percorso dell'app
  ipcMain.handle('app:getPath', () => {
    return app.getAppPath();
  });

  // Ottiene i file recenti
  ipcMain.handle('app:getRecentFiles', () => {
    return appConfig.recentFiles;
  });

  // Aggiunge un file alla lista dei recenti
  ipcMain.on('app:addRecentFile', (event, filePath) => {
    appConfig.addRecentFile(filePath);
    // Aggiorna il menu con i file recenti aggiornati
    const template = Menu.getApplicationMenu().items.map(item => {
      return { ...item };
    });
    updateRecentFilesMenu(template);
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  });

  // Apre un link esterno
  ipcMain.on('open:externalLink', (event, url) => {
    shell.openExternal(url);
  });

  // Gestione finestra
  ipcMain.on('window:minimize', () => {
    if (mainWindow) mainWindow.minimize();
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.restore();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window:close', () => {
    if (mainWindow) mainWindow.close();
  });

  // Messaggi di log
  ipcMain.on('log:message', (event, message) => {
    console.log('Renderer Log:', message);
  });

  ipcMain.on('log:error', (event, message) => {
    console.error('Renderer Error:', message);
  });

  // Gestione dei report
  ipcMain.handle('report:saveCsv', async (event, { data, defaultFilename }) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: defaultFilename || 'Report_Commissioni.csv',
        filters: [
          { name: 'CSV', extensions: ['csv'] }
        ],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      });

      if (result.canceled) return { success: false, message: 'Operazione annullata.' };

      fs.writeFileSync(result.filePath, data, 'utf8');
      return { success: true, filePath: result.filePath };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  ipcMain.handle('report:saveXlsx', async (event, { data, defaultFilename }) => {
    try {
      const result = await dialog.showSaveDialog({
        defaultPath: defaultFilename || 'Report_Commissioni.xlsx',
        filters: [
          { name: 'Excel', extensions: ['xlsx'] }
        ],
        properties: ['createDirectory', 'showOverwriteConfirmation']
      });

      if (result.canceled) return { success: false, message: 'Operazione annullata.' };

      // Qui il data dovrebbe essere un buffer
      fs.writeFileSync(result.filePath, data);
      return { success: true, filePath: result.filePath };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });
}