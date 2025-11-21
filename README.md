# X-HMAC Calculator

LINE Chrome Extension X-HMAC 計算工具，使用 LTSM WebAssembly 模組。

## 檔案結構

```
x-hmac/
├── README.md
├── package.json
├── hmac_node.js        # Node.js HMAC 計算器
├── hmac.py             # Python wrapper
├── lib/
│   ├── ltsmSandbox.js  # LTSM JavaScript 模組
│   └── ltsm.wasm       # LTSM WebAssembly
└── web/
    └── index.html      # 瀏覽器測試頁面
```

## 安裝

```bash
npm install
```

## 使用方式

### 1. Node.js CLI

```bash
node hmac_node.js <path> <accessToken> [body] [token]
```

**參數：**
- `path`: API 路徑 (必填)
- `accessToken`: Access Token (可為空)
- `body`: 請求 body (選填)
- `token`: SecureKey Token (選填)

**範例：**

```bash
node hmac_node.js /api/v1/messages/send '' '{"message":"Hello"}'
```

**輸出：**

```json
{"hmac":"VkY9XesqqEckKx0gPiBdyUMrG64n33gtCUsPSrp29dM="}
```

### 2. Node.js 程式引用

```javascript
const { calculateHmac } = require('./hmac_node.js');

const result = await calculateHmac({
    path: '/api/v1/messages/send',
    accessToken: '',
    body: '{"message":"Hello"}'
});
```

### 3. Python 引用

```python
from hmac import calculate_xhmac

hmac = calculate_xhmac(
    path='/api/talk/thrift/Talk/TalkService/getRSAKeyInfo',
    access_token='',
    body='[1]'
)
print(hmac)  # WSzrQJU4krJdw4LvJcvc52D0JJUoaT043WrqtOTHfG0=
```

**參數：**
- `path`: API 路徑 (必填)
- `access_token`: Access Token (可為空，預設 `""`)
- `body`: 請求 body (選填)
- `token`: SecureKey Token (選填)

### 4. 瀏覽器測試頁面

```bash
# 啟動 HTTP Server
python3 -m http.server 8080

# 開啟瀏覽器
# http://localhost:8080/web/
```

**使用步驟：**

1. 在 Console 設定 origin 和 tokens：
   ```javascript
   window.__LTSM_ORIGIN__ = 'your-origin';
   window.__LTSM_TOKENS__ = { 'your-origin': 'your-token' };
   ```

2. 填入 Path、Body (Access Token 可為空)

3. 點擊「計算 HMAC」

## 設定

複製 `.env.example` 為 `.env` 並填入 SecureKey Tokens：

```bash
cp .env.example .env
```

```env
# SecureKey Tokens (Base64 encoded, 64 characters)
SECURE_KEY_TOKEN_1=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SECURE_KEY_TOKEN_2=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 技術細節

**HMAC 計算流程：**

1. `SecureKey.loadToken(token)` → SecureKey
2. SHA-256(`3.7.1`) → versionHash
3. SHA-256(`accessToken`) → tokenHash
4. `SecureKey.deriveKey(versionHash, tokenHash)` → HMAC key
5. HMAC-SHA256(`path + body`) → Base64
