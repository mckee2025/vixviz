"""
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os

# 设置 Google Sheets API 凭据
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
client = gspread.authorize(creds)

# 打开 Google Sheet
sheet = client.open_by_key("1ilA5JgBX5FtG_abkXW4dl_Xnkd_b5y0wafqJRwZD3p0").get_worksheet_by_id("917564732")
data = sheet.get_all_records()

# 转换为前端需要的格式
formatted_data = []
for row in data:
    formatted_row = {
        "Date": row["Date"],
        "VX_Spot": row["VX Closing"] if row["VX Closing"] else None,
        "VIX_Spot": row["VIX Closing"] if row["VIX Closing"] else None
    }
    formatted_data.append(formatted_row)

# 确保 static/data 目录存在
os.makedirs("static/data", exist_ok=True)

# 保存为 JSON 文件
with open("static/data/vix-data.json", "w") as f:
    json.dump(formatted_data, f, ensure_ascii=False)

print("数据已提取并保存到 static/data/vix-data.json")
"""




import os
import json
import pandas as pd
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# 从环境变量加载凭据
creds_json = os.getenv('GOOGLE_CREDENTIALS')
if creds_json:
    with open('credentials.json', 'w') as f:
        f.write(creds_json)
else:
    raise ValueError("GOOGLE_CREDENTIALS environment variable not set")

scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
creds = ServiceAccountCredentials.from_json_keyfile_name('credentials.json', scope)
client = gspread.authorize(creds)

sheet = client.open('VIX_VX_Data').sheet1
data = sheet.get_all_records()

df = pd.DataFrame(data)
df.to_json('static/data/vix-data.json', orient='records', indent=2)