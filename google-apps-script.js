// ── Mango Wala – Google Apps Script ─────────────────────────────────────────
// Deploy as a Web App (Execute as: Me, Who has access: Anyone)
// Paste this entire file into your Apps Script editor and redeploy.

const PRICES = { alphonso: 32, kesar: 32, banginapally: 34, rasalu: 35, himayat: 40, totapuri: 35 };

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ── Write to Google Sheet ──────────────────────────────────────────────
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Order ID', 'Name', 'Email', 'Phone',
        'Alphonso Boxes', 'Kesar Boxes', 'Banganpally Boxes', 'Rasalu Boxes', 'Himayat Boxes', 'Totapuri Boxes',
        'Pickup Location', 'Comments', 'Total (€)'
      ]);
    }

    // ── Generate unique sequential order ID server-side ────────────────────
    const dataRows = sheet.getLastRow() - 1; // subtract header row
    const orderNum = 1001 + dataRows;
    const orderId  = 'MANBAT-01-' + orderNum;
    data.orderId   = orderId;

    const total = Number(data.alphonso)     * PRICES.alphonso
                + Number(data.kesar)        * PRICES.kesar
                + Number(data.banginapally) * PRICES.banginapally
                + Number(data.rasalu)       * PRICES.rasalu
                + Number(data.himayat)      * PRICES.himayat
                + Number(data.totapuri)     * PRICES.totapuri;

    sheet.appendRow([
      data.timestamp,
      data.orderId,
      data.name,
      data.email,
      data.phone,
      data.alphonso     || 0,
      data.kesar        || 0,
      data.banginapally || 0,
      data.rasalu       || 0,
      data.himayat      || 0,
      data.totapuri     || 0,
      data.pickup,
      data.comments || '',
      total,
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

