// ── Mango Wala – Google Apps Script ─────────────────────────────────────────
// Deploy as a Web App (Execute as: Me, Who has access: Anyone)
// Paste this entire file into your Apps Script editor and redeploy.

const PRICES = { alphonso: 32, kesar: 32, banginapally: 34, rasalu: 35, himayat: 40 };

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // ── Write to Google Sheet ──────────────────────────────────────────────
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp', 'Order ID', 'Name', 'Email', 'Phone',
        'Alphonso Boxes', 'Kesar Boxes', 'Banganpally Boxes', 'Rasalu Boxes', 'Himayat Boxes',
        'Pickup Location', 'Comments', 'Total (€)'
      ]);
    }

    // ── Generate unique sequential order ID server-side ────────────────────
    const dataRows = sheet.getLastRow() - 1; // subtract header row
    const orderNum = 1001 + dataRows;
    const orderId  = 'MAN-BAT-01-' + orderNum;
    data.orderId   = orderId;

    const total = Number(data.alphonso)     * PRICES.alphonso
                + Number(data.kesar)        * PRICES.kesar
                + Number(data.banginapally) * PRICES.banginapally
                + Number(data.rasalu)       * PRICES.rasalu
                + Number(data.himayat)      * PRICES.himayat;

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
      data.pickup,
      data.comments || '',
      total,
    ]);

    // ── Send confirmation email to customer ────────────────────────────────
    sendConfirmationEmail(data, total);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success', orderId: data.orderId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendConfirmationEmail(data, total) {
  const subject = `Order Confirmed – ${data.orderId} | EuropeMangoWale 🥭`;

  const varieties = [
    { key: 'alphonso',     label: 'Alphonso',     price: PRICES.alphonso     },
    { key: 'kesar',        label: 'Kesar',        price: PRICES.kesar        },
    { key: 'banginapally', label: 'Banganpally',  price: PRICES.banginapally },
    { key: 'rasalu',       label: 'Rasalu',       price: PRICES.rasalu       },
    { key: 'himayat',      label: 'Himayat',      price: PRICES.himayat      },
  ];

  const itemRows = varieties
    .filter(v => Number(data[v.key]) > 0)
    .map((v, i) => {
      const qty = Number(data[v.key]);
      const bg  = i % 2 === 0 ? '' : 'background:#fef9ee;';
      return `<tr style="${bg}">
        <td style="padding:10px 16px;color:#92400e;font-weight:600;">${v.label} Boxes</td>
        <td style="padding:10px 16px;">${qty} × €${v.price} = <strong>€${qty * v.price}</strong></td>
      </tr>`;
    })
    .join('');

  const commentsRow = data.comments
    ? `<tr>
         <td style="padding:10px 16px;color:#92400e;font-weight:600;">Comments</td>
         <td style="padding:10px 16px;">${data.comments}</td>
       </tr>`
    : '';

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fffbf0;padding:32px;border-radius:12px;">

      <h1 style="margin:0 0 4px;color:#d97706;text-align:center;font-size:28px;">🥭 EuropeMangoWale</h1>
      <p style="text-align:center;color:#78716c;margin:0 0 28px;">Fresh Mangoes - Straight from the farm</p>

      <h2 style="color:#333;text-align:center;margin:0 0 20px;">Booking Confirmed!</h2>

      <!-- Order ID badge -->
      <div style="background:#fff;border-radius:8px;padding:16px 20px;margin-bottom:20px;border-left:4px solid #d97706;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        <p style="margin:0;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Order ID</p>
        <p style="margin:6px 0 0;font-size:22px;font-weight:700;color:#d97706;letter-spacing:2px;">${data.orderId}</p>
      </div>

      <!-- Order details table -->
      <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);margin-bottom:20px;">
        <tr style="background:#fef3c7;">
          <td style="padding:10px 16px;color:#92400e;font-weight:600;">Customer</td>
          <td style="padding:10px 16px;">${data.name}</td>
        </tr>
        ${itemRows}
        <tr style="background:#fef3c7;">
          <td style="padding:10px 16px;color:#92400e;font-weight:600;">Total</td>
          <td style="padding:10px 16px;font-size:18px;font-weight:700;">€${total}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;color:#92400e;font-weight:600;">Pickup Location</td>
          <td style="padding:10px 16px;">${data.pickup}</td>
        </tr>
        <tr style="background:#fef3c7;">
          <td style="padding:10px 16px;color:#92400e;font-weight:600;">Phone</td>
          <td style="padding:10px 16px;">${data.phone}</td>
        </tr>
        ${commentsRow}
      </table>

      <!-- Payment note -->
      <div style="background:#fef3c7;border-radius:8px;padding:14px 18px;text-align:center;margin-bottom:24px;">
        <p style="margin:0;color:#92400e;font-weight:600;">💳 Payment Acknowledgement & GDPR: Bank transfer at collection</p>
      </div>
        <p style="text-align:center;color:#57534e;font-size:12px;line-height:1.6;margin:0 0 20px;">
          * We collect your name, email and WhatsApp number to contact you and provide our service updates only, and we process this data in accordance with the EU GDPR, ensuring it is used only for this purpose.
        </p>

      <p style="text-align:center;color:#78716c;font-size:14px;line-height:1.6;">
        Thank you for prebooking with EuropeMangoWale!<br>
        Now sit back &amp; relax while we get your Mango's.<br><br>
        See you soon, for regular updates please join our WhatsApp Community! 🥭
      </p>

      <p style="text-align:center;background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:10px 16px;font-size:12px;color:#856404;">
        📬 <strong>Can't find this email?</strong> Please check your <strong>Junk / Spam</strong> folder and mark it as "Not Spam".
      </p>

      <!-- WhatsApp Community -->
      <div style="background:#e7f9e7;border-radius:8px;padding:16px 20px;text-align:center;margin-top:8px;">
        <p style="margin:0 0 8px;color:#1a7a1a;font-weight:700;font-size:15px;">📲 Join our WhatsApp Community</p>
        <p style="margin:0 0 12px;color:#4a4a4a;font-size:13px;">Fresh Mangoes delivered straight from the farm 🥭</p>
        <a href="https://chat.whatsapp.com/KTNFTGqsVouFOWSp60FBZG"
           style="display:inline-block;background:#25D366;color:#fff;font-weight:700;font-size:14px;padding:10px 24px;border-radius:999px;text-decoration:none;">
          Join Now
        </a>
      </div>

    </div>
  `;

  MailApp.sendEmail({
    to:       data.email,
    subject:  subject,
    htmlBody: htmlBody,
    name:     'EuropeMangoWale',
  });
}
