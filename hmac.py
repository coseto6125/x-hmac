"""
X-HMAC Calculator - Python wrapper for Node.js HMAC module

Usage:
    from hmac import calculate_xhmac

    result = calculate_xhmac(
        path='/api/v1/messages/send',
        access_token='your_token',
        body='{"message":"Hello"}'
    )
"""

import json
import subprocess
from pathlib import Path

_BASE_DIR = Path(__file__).parent


def calculate_xhmac(
    path: str,
    access_token: str = "",
    body: str | None = None,
    token: str = "wODdrvWqmdP4Zliay-iF3cz3KZcK0ekrial868apg06TXeCo7A1hIQO0ESElHg6D",
) -> str:
    """
    計算 X-HMAC header 值

    Args:
        path: API 路徑
        access_token: Access Token (可為空)
        body: 請求 body (選填)
        token: SecureKey Token

    Returns:
        Base64 編碼的 HMAC 值
    """
    args = ["node", str(_BASE_DIR / "hmac_node.js"), path, access_token]
    if body:
        args.append(body)
    if token != "wODdrvWqmdP4Zliay-iF3cz3KZcK0ekrial868apg06TXeCo7A1hIQO0ESElHg6D":
        args.append(token)

    result = subprocess.run(args, capture_output=True, text=True, check=True)

    # 過濾掉 LTSM log，只取 JSON 輸出
    for line in result.stdout.strip().split("\n"):
        if line.startswith("{"):
            return json.loads(line)["hmac"]

    raise RuntimeError(f"Unexpected output: {result.stdout}")


if __name__ == "__main__":
    # 測試
    hmac = calculate_xhmac(path="/api/talk/thrift/Talk/TalkService/getRSAKeyInfo", access_token="", body="[1]")
    print(f"X-Hmac: {hmac}")
