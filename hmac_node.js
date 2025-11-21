/**
 * Node.js HMAC Calculator
 *
 * 使用 jsdom 模擬瀏覽器環境，執行 ltsmSandbox.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { webcrypto } = require('crypto');
const { TextEncoder, TextDecoder } = require('util');

// 建立模擬的瀏覽器環境
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'file:///home/enor/x-hmac/index.html',
    runScripts: 'dangerously',
    resources: 'usable',
    pretendToBeVisual: true,
});

const { window } = dom;

// 注入全域物件
global.window = window;
global.document = window.document;
global.navigator = window.navigator;
global.location = window.location;
global.self = window;
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.Node = window.Node;
global.Event = window.Event;
global.CustomEvent = window.CustomEvent;
global.MessageEvent = window.MessageEvent;
global.XMLHttpRequest = window.XMLHttpRequest;
global.atob = window.atob;
global.btoa = window.btoa;
global.TextEncoder = window.TextEncoder;
global.TextDecoder = window.TextDecoder;
global.Uint8Array = window.Uint8Array;
global.ArrayBuffer = window.ArrayBuffer;
global.crypto = webcrypto;

// 載入 wasm binary
const wasmPath = path.join(__dirname, 'lib', 'ltsm.wasm');
const wasmBinary = fs.readFileSync(wasmPath);

// 注入到 window 上
window.__LTSM_WASM_BINARY__ = new Uint8Array(wasmBinary);
const LTSM_ORIGIN_1 = process.env.LTSM_ORIGIN_1;
const LTSM_ORIGIN_2 = process.env.LTSM_ORIGIN_2;
window.__LTSM_ORIGIN__ = LTSM_ORIGIN_1;
window.__LTSM_TOKENS__ = {
    [LTSM_ORIGIN_1]: process.env.SECURE_KEY_TOKEN_1,
    [LTSM_ORIGIN_2]: process.env.SECURE_KEY_TOKEN_2
};
window.TextEncoder = TextEncoder;
window.TextDecoder = TextDecoder;

// 修復 btoa 處理 binary 字串
window.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
window.atob = (str) => Buffer.from(str, 'base64').toString('binary');
Object.defineProperty(window, 'crypto', {
    value: webcrypto,
    writable: false,
    configurable: false
});

// 載入 ltsmSandbox.js
const ltsmCode = fs.readFileSync(path.join(__dirname, 'lib', 'ltsmSandbox.js'), 'utf-8');

// 透過 script 元素執行
const scriptEl = window.document.createElement('script');
scriptEl.textContent = ltsmCode;
window.document.body.appendChild(scriptEl);

// 等待 LTSM 初始化並計算 HMAC
async function calculateHmac(params) {
    const { path: apiPath, body, accessToken, token } = params;

    if (!window.LTSM) {
        throw new Error('LTSM not loaded');
    }

    return await window.LTSM.calculateHmac({
        path: apiPath,
        body,
        accessToken,
        token
    });
}

// CLI 入口
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: node hmac_node.js <path> <accessToken> [body] [token]');
        process.exit(1);
    }

    const [apiPath, accessToken, body, token] = args;

    calculateHmac({
        path: apiPath,
        accessToken,
        body: body || undefined,
        token: token || process.env.SECURE_KEY_TOKEN_1
    })
    .then(result => {
        console.log(JSON.stringify({ hmac: result }));
    })
    .catch(err => {
        console.error(JSON.stringify({ error: err.message, stack: err.stack }));
        process.exit(1);
    });
}

module.exports = { calculateHmac };
