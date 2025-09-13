import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export async function handler(event, context) {
  try {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.SHEET_ID, { auth });

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
    console.error('Error in getEntries:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message, data: [] }),
    };
  }
}
