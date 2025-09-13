const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const formData = JSON.parse(event.body);

    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SHEET_ID, { auth });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      Date: formData.date,
      Type: formData.type,
      Mode: formData.mode,
      Amount: formData.amount,
      Remarks: formData.remarks,
    });

    return { statusCode: 200, body: JSON.stringify({ message: "Entry added" }) };
  } catch (err) {
    console.error('Error in addEntry:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
