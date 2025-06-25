const outputEl = document.getElementById('output');
const cmdForm = document.getElementById('cmdForm');
const cmdInput = document.getElementById('cmdInput');
const modeSelect = document.getElementById('modeSelect');
const methodSelect = document.getElementById('methodSelect');

// 出力関数
function printOutput(text, isCommand = false) {
  outputEl.textContent += (isCommand ? '> ' : '') + text + '\n';
  outputEl.scrollTop = outputEl.scrollHeight;
}

// Caesar暗号（13文字ずらし）
function caesar(str, shift = 13) {
  return str.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode((c.charCodeAt(0) - base + shift + 26) % 26 + base);
  });
}

// SHA-256ハッシュ
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 擬似Shift_JIS文字化け（UTF-8→文字化け風変換）
function fakeShiftJIS(text) {
  return Array.from(text)
    .map(c => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join(' ');
}

// 解析モード
function analyzeText(text) {
  const stats = {
    length: text.length,
    ascii: [...text].filter(c => c.charCodeAt(0) < 128).length,
    nonAscii: [...text].filter(c => c.charCodeAt(0) >= 128).length,
    digits: (text.match(/[0-9]/g) || []).length,
    letters: (text.match(/[a-zA-Z]/g) || []).length,
    symbols: (text.match(/[^a-zA-Z0-9\s]/g) || []).length,
  };
  return `📊 解析結果：
文字数: ${stats.length}
英字: ${stats.letters} / 数字: ${stats.digits} / 記号: ${stats.symbols}
ASCII: ${stats.ascii} / 非ASCII: ${stats.nonAscii}`;
}

// メイン処理
cmdForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const mode = modeSelect.value;
  const method = methodSelect.value;
  const input = cmdInput.value.trim();
  if (!input) return;

  printOutput(input, true);

  try {
    if (mode === 'encode') {
      switch (method) {
        case 'base64':
          printOutput('Base64 → ' + btoa(input));
          break;
        case 'caesar':
          printOutput('Caesar(13) → ' + caesar(input));
          break;
        case 'sha256':
          const hashed = await sha256(input);
          printOutput('SHA-256 → ' + hashed);
          break;
        case 'sjis':
          printOutput('SJIS風文字化け → ' + fakeShiftJIS(input));
          break;
        default:
          printOutput(`❓ 未対応のエンコード方式: ${method}`);
      }
    } else if (mode === 'decode') {
      switch (method) {
        case 'base64':
          try {
            printOutput('Base64復号 → ' + atob(input));
          } catch {
            printOutput('⚠️ Base64の形式が正しくありません');
          }
          break;
        case 'caesar':
          printOutput('Caesar復号 → ' + caesar(input, -13));
          break;
        default:
          printOutput(`❓ 未対応のデコード方式: ${method}`);
      }
    } else if (mode === 'analyze') {
      printOutput(analyzeText(input));
    } else {
      printOutput('❗ 不明なモードです');
    }
  } catch (err) {
    printOutput('⚠️ エラー: ' + err.message);
  }

  cmdInput.value = '';
});
