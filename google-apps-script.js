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

    MailApp.sendEmail({
      to: data.email,
      subject: `🥭 Booking Confirmed – ${orderId} | EuropeMangoWale`,
      htmlBody: buildEmailHtml(data, orderId, total),
    });

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function buildEmailHtml(data, orderId, total) {
  const lines = [
    ['Alphonso', data.alphonso], ['Kesar', data.kesar], ['Banganpally', data.banginapally],
    ['Rasalu', data.rasalu], ['Himayat', data.himayat], ['Totapuri', data.totapuri],
  ].filter(([, qty]) => Number(qty) > 0)
   .map(([name, qty]) => `<tr><td style="font-size:14px;padding:2px 0;">${name}: ${qty} box${qty > 1 ? 'es' : ''}</td></tr>`)
   .join('');

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:20px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;">
  <tr><td style="background:#2d6a2d;padding:28px 32px;text-align:center;">
    <h1 style="margin:0;color:#fff;font-size:22px;">🥭 EuropeMangoWale</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Booking Confirmation</p>
  </td></tr>
  <tr><td style="padding:28px 32px;">
    <p style="margin:0 0 6px;font-size:15px;color:#333;"><strong>Order ID:</strong> ${orderId}</p>
    <p style="margin:0 0 6px;font-size:15px;color:#333;"><strong>Name:</strong> ${data.name}</p>
    <table cellpadding="0" cellspacing="0">${lines}</table>
    <p style="margin:6px 0;font-size:15px;color:#333;"><strong>Total:</strong> €${total}</p>
    <p style="margin:0;font-size:15px;color:#333;"><strong>Pickup:</strong> ${data.pickup}</p>
  </td></tr>
  <tr><td style="padding:0 32px 20px;">
    <div style="background:#fef3c7;border-radius:8px;padding:14px 18px;text-align:center;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#92400e;">💳 Payment Acknowledgement: Bank transfer at collection</p>
    </div>
  </td></tr>
  <tr><td style="padding:0 32px 20px;text-align:center;">
    <p style="margin:0;font-size:14px;color:#333;">See you soon, for more details on Mangoes delivery date/time, location wise point of contacts and regular updates — please join our WhatsApp community in location specific group.</p>
  </td></tr>
  <tr><td style="padding:0 32px 20px;text-align:center;">
    <p style="margin:0;font-size:14px;color:#333;">Thank you for prebooking with EuropeMangoWale!</p>
  </td></tr>

  <tr><td style="padding:0 32px 28px;">
    <div style="background:linear-gradient(135deg,#075e54 0%,#128c7e 100%);border-radius:12px;padding:20px 24px;text-align:center;">
      <p style="margin:0 0 4px;font-weight:800;font-size:15px;color:#fff;">📱 Join our WhatsApp Community</p>
      <p style="margin:0 0 14px;font-size:12px;color:rgba(255,255,255,0.85);">Fresh Mangoes delivered straight from the farm 🥭</p>
      <a href="https://chat.whatsapp.com/KTNFTGqsVouFOWSp60FBZG" style="display:inline-block;background:#25D366;color:#fff;font-weight:700;font-size:14px;padding:10px 28px;border-radius:999px;text-decoration:none;">Join Now</a>
    </div>
  </td></tr>
  <tr><td style="padding:16px 32px 24px;text-align:center;">
    <p style="margin:0 0 10px;font-size:11px;color:#888;font-style:italic;">🔒 GDPR: We collect your name, email and WhatsApp number solely to contact you and provide service updates, in accordance with EU GDPR.</p>
    <p style="margin:0;font-size:14px;color:#333;">Thank you for prebooking with EuropeMangoWale!<br>Now sit back and relax while we get your mangoes 🥭</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

