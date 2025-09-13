const { GoogleSpreadsheet } = require('google-spreadsheet')

exports.handler = async function(event, context) {
  if(event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  try{
    const body = JSON.parse(event.body)
    const SHEET_ID = process.env.SHEET_ID
    const client_email = process.env.GOOGLE_SERVICE_EMAIL
    const private_key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')

    const doc = new GoogleSpreadsheet(SHEET_ID)
    await doc.useServiceAccountAuth({ client_email, private_key })
    await doc.loadInfo()
    const sheet = doc.sheetsByIndex[0]

    const row = {
      Date: body.date || new Date().toISOString().slice(0,10),
      Type: body.type || 'Donation',
      Mode: body.mode || 'Cash',
      Particulars: body.particulars || '',
      Amount: body.amount || '',
      'Receipt/Txn ID': body.txn || '',
      'Collected By': body.collectedBy || '',
      'Verified By': ''
    }

    await sheet.addRow(row)
    return { statusCode: 200, body: JSON.stringify({ success: true }) }
  }catch(err){
    console.error(err)
    return { statusCode: 500, body: JSON.stringify({ success:false, error: String(err) }) }
  }
}
