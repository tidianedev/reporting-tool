// emailService.js
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class EmailService {
  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'email-config.json');
    this.config = this.loadConfig();
    this.transporter = null;

    // Inizializza il transporter se la configurazione esiste
    if (this.config && (this.config.smtp ||
        (this.config.service && this.config.user && this.config.password))) {
      this.initTransporter();
    }
  }

  /**
   * Carica la configurazione email dal file locale
   * @returns {Object} La configurazione email o un oggetto vuoto
   */
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
      }
    } catch (error) {
      console.error('Errore nel caricamento della configurazione email:', error);
    }
    return {
      service: '',
      user: '',
      password: '',
      smtp: {
        host: '',
        port: 587,
        secure: false,
        user: '',
        password: '',
        from: ''
      }
    };
  }

  /**
   * Salva la configurazione email nel file locale
   * @param {Object} config - La configurazione da salvare
   * @returns {Object} Risultato dell'operazione
   */
  saveConfig(config) {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf8');
      this.config = config;
      this.initTransporter();
      return { success: true };
    } catch (error) {
      console.error('Errore nel salvataggio della configurazione email:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Inizializza il transporter nodemailer con la configurazione
   */
  initTransporter() {
    try {
      let transportConfig;

      if (this.config.service && this.config.service !== 'other') {
        // Configurazione basata sul servizio (Gmail, Outlook, ecc.)
        transportConfig = {
          service: this.config.service,
          auth: {
            user: this.config.user,
            pass: this.config.password
          }
        };
      } else if (this.config.smtp && this.config.smtp.host) {
        // Configurazione SMTP personalizzata
        transportConfig = {
          host: this.config.smtp.host,
          port: this.config.smtp.port || 587,
          secure: this.config.smtp.secure || false,
          auth: {
            user: this.config.smtp.user || this.config.user,
            pass: this.config.smtp.password || this.config.password
          },
          tls: {
            rejectUnauthorized: false // Per alcuni server aziendali potrebbe essere necessario
          }
        };
      } else {
        console.error('Configurazione email non valida');
        return;
      }

      this.transporter = nodemailer.createTransport(transportConfig);
    } catch (error) {
      console.error('Errore nell\'inizializzazione del transporter:', error);
      this.transporter = null;
    }
  }

  /**
   * Verifica la connessione SMTP
   * @returns {Promise<Object>} Risultato della verifica
   */
  async verifyConnection() {
    if (!this.transporter) {
      return { success: false, message: 'Transporter non inizializzato' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Connessione verificata con successo' };
    } catch (error) {
      console.error('Errore nella verifica della connessione SMTP:', error);
      return {
        success: false,
        message: error.message || 'Errore nella verifica della connessione'
      };
    }
  }

  /**
   * Invia un'email con allegati
   * @param {Object} options - Opzioni per l'email
   * @param {string} options.to - Destinatario
   * @param {string} options.subject - Oggetto dell'email
   * @param {string} options.text - Testo dell'email (plain text)
   * @param {string} options.html - Testo dell'email (HTML)
   * @param {Array} options.attachments - Array di oggetti allegato
   * @returns {Promise<Object>} Risultato dell'invio
   */
  async sendEmail(options) {
    if (!this.transporter) {
      return {
        success: false,
        message: 'Configurazione email non disponibile'
      };
    }

    const { to, subject, text, html, attachments = [] } = options;

    if (!to || !subject || (!text && !html)) {
      return {
        success: false,
        message: 'Parametri email mancanti (destinatario, oggetto o corpo)'
      };
    }

    try {
      // Determina l'indirizzo del mittente
      let from;
      if (this.config.service) {
        from = this.config.user;
      } else if (this.config.smtp) {
        from = this.config.smtp.from || this.config.smtp.user || this.config.user;
      }

      const mailOptions = {
        from,
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        text,
        html,
        attachments
      };

      const info = await this.transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        info
      };
    } catch (error) {
      console.error('Errore nell\'invio dell\'email:', error);
      return {
        success: false,
        message: error.message || 'Errore nell\'invio dell\'email',
        error
      };
    }
  }

  /**
   * Invia un report generato come allegato email
   * @param {Object} options - Opzioni per l'invio del report
   * @param {string} options.to - Destinatario
   * @param {string} options.subject - Oggetto dell'email
   * @param {string} options.message - Messaggio personalizzato
   * @param {string} options.filePath - Percorso del file da allegare
   * @param {string} options.fileName - Nome del file da mostrare nell'allegato
   * @returns {Promise<Object>} Risultato dell'invio
   */
  async sendReport(options) {
    const { to, subject, message, filePath, fileName } = options;

    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        message: 'File non trovato: ' + filePath
      };
    }

    const attachment = {
      filename: fileName || path.basename(filePath),
      path: filePath
    };

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #4361ee;">Report Commissioni</h2>
        <p>Data di generazione: ${formattedDate}</p>
        <p>${message || 'In allegato il report delle commissioni richiesto.'}</p>
        <p>Il report è stato generato automaticamente dal Tool di Reporting Commissioni Mensile.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          © 2025 - Tool Reporting Commissioni | Powered by <b>Serge Guea</b>
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: subject || 'Report Commissioni - ' + formattedDate,
      text: message || 'In allegato il report delle commissioni richiesto.',
      html: htmlContent,
      attachments: [attachment]
    });
  }

  /**
   * Invia un report direttamente dai dati estratti
   * @param {Object} options - Opzioni per l'invio
   * @param {string|Array} options.to - Destinatario o array di destinatari
   * @param {string} options.subject - Oggetto dell'email
   * @param {string} options.message - Messaggio personalizzato
   * @param {Array} options.data - I dati estratti
   * @param {string} options.format - Formato del report ('csv' o 'xlsx')
   * @param {boolean} options.includeStats - Se includere le statistiche
   * @param {string} options.statsHtml - HTML delle statistiche da includere
   * @returns {Promise<Object>} Risultato dell'invio
   */
  async sendReportFromData(options) {
    const { to, subject, message, data, format = 'csv', includeStats, statsHtml } = options;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        message: 'Dati non validi o vuoti'
      };
    }

    try {
      const tempDir = path.join(app.getPath('temp'), 'commissioni-reports');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

      let filePath;
      let fileName;

      if (format === 'csv') {
        fileName = `Report_Commissioni_${timestamp}.csv`;
        filePath = path.join(tempDir, fileName);

        // Genera il contenuto CSV
        const headers = Object.keys(data[0]);
        const csvContent = [headers.join(',')];

        data.forEach(row => {
          const values = headers.map(header => {
            const val = row[header] || '';
            return `"${val.toString().replace(/"/g, '""')}"`;
          });
          csvContent.push(values.join(','));
        });

        fs.writeFileSync(filePath, csvContent.join('\n'), 'utf8');
      } else if (format === 'xlsx') {
        // Utilizziamo XLSX già presente nell'applicazione
        const XLSX = require('xlsx');
        fileName = `Report_Commissioni_${timestamp}.xlsx`;
        filePath = path.join(tempDir, fileName);

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Dati Estratti');

        XLSX.writeFile(workbook, filePath);
      } else {
        return {
          success: false,
          message: 'Formato non supportato'
        };
      }

      // Prepara il corpo dell'email con statistiche se richiesto
      const formattedDate = now.toLocaleDateString('it-IT');

      let htmlBody = `
        <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4361ee;">Report Commissioni</h2>
          <p>Data di generazione: ${formattedDate}</p>
          ${message ? `<p>${message}</p>` : ''}
          <p>In allegato trovi il report delle commissioni in formato ${format.toUpperCase()}.</p>
      `;

      // Aggiungi statistiche se richiesto
      if (includeStats && statsHtml) {
        htmlBody += `
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <h3 style="color: #4361ee; margin-top: 0;">Statistiche</h3>
            ${statsHtml}
          </div>
        `;
      }

      // Chiudi il corpo dell'email
      htmlBody += `
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #666;">
            Questo report è stato generato automaticamente dal Tool di Reporting Commissioni Mensile.<br>
            © 2025 - Tool Reporting Commissioni | Powered by <b>Serge Guea</b>
          </p>
        </div>
      `;

      // Invia il report come allegato
      const result = await this.sendEmail({
        to,
        subject: subject || `Report Commissioni - ${formattedDate}`,
        text: message || 'In allegato il report delle commissioni richiesto.',
        html: htmlBody,
        attachments: [
          {
            filename: fileName,
            path: filePath
          }
        ]
      });

      // Elimina il file temporaneo dopo l'invio (asincrono)
      setTimeout(() => {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File temporaneo eliminato: ${filePath}`);
          }
        } catch (err) {
          console.warn('Errore nella pulizia del file temporaneo:', err);
        }
      }, 5000);

      return result;
    } catch (error) {
      console.error('Errore nella generazione e invio del report:', error);
      return {
        success: false,
        message: error.message || 'Errore nella generazione e invio del report'
      };
    }
  }
}

module.exports = new EmailService();