import os
import json
import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# 直接读取 credentials.json
with open('credentials.json', 'r') as f:
    creds_json = f.read()

with open('credentials.json', 'w') as f:
    f.write(creds_json)

scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
client = gspread.authorize(creds)

# 使用正确的名称和 Worksheet ID
spreadsheet = client.open('VIX and VX data')
sheet = spreadsheet.get_worksheet_by_id('917564732')  # 修正为 get_worksheet_by_id

data = sheet.get_all_records()

df = pd.DataFrame(data)
df.to_json('static/data/vix-data.json', orient='records', indent=2)