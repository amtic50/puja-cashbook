Deployment hints & troubleshooting:
- Private key needs to be pasted as a single-line variable in Netlify but with literal \n for newlines or use multiline support in Netlify UI.
- If functions return 500, check Cloud Console IAM & share on the sheet.
- For quick local testing, install netlify-cli and run `netlify dev` with .env.
- If you want 'Verified By' flow, we can add another function to update a row by index or id.
