import { GoogleSpreadsheet } from "google-spreadsheet";
console.log('google-spreadsheet version:', require('google-spreadsheet/package.json').version);  
export async function handler(event, context) {
  try {
    const doc = new GoogleSpreadsheet(process.env.SHEET_ID);

    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });

    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const data = rows.map(r => ({
      date: r.Date,
      type: r.Type,
      mode: r.Mode,
      amount: r.Amount,
      remarks: r.Remarks,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message, data: [] }),
    };
  }
}
