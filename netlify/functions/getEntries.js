const { GoogleSpreadsheet } = require('google-spreadsheet')

exports.handler = async function(event, context) {
  try{
    const SHEET_ID = process.env.SHEET_ID
    const client_email = process.env.GOOGLE_SERVICE_EMAIL
    const private_key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')

    const doc = new GoogleSpreadsheet(SHEET_ID)
    await doc.useServiceAccountAuth({ client_email, private_key })
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]
    const rows = await sheet.getRows()
    const mapped = rows.map(r=>({
      Date: r.Date || r._rawData[0] || '',
      Type: r.Type || r._rawData[1] || '',
      Mode: r.Mode || r._rawData[2] || '',
      Particulars: r.Particulars || r._rawData[3] || '',
      Amount: r.Amount || r._rawData[4] || '',
      'Receipt/Txn ID': r['Receipt/Txn ID'] || r._rawData[5] || '',
      'Collected By': r['Collected By'] || r._rawData[6] || '',
      'Verified By': r['Verified By'] || r._rawData[7] || ''
    }))
    return { statusCode: 200, body: JSON.stringify({ rows: mapped }) }
  }catch(err){
    console.error(err)
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) }
  }
}
