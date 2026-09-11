/**
 * ガーデンライトセレクター 記録用サーバー（Google Apps Script）
 *
 * スプレッドシートに「来場者」と「見積履歴」を記録し、見積が作られたらメールで通知します。
 * 設定は下の CONFIG だけ変更すれば動きます。
 */

const CONFIG = {
  // 管理画面（/#/admin）のパスワード
  ADMIN_PASSWORD: 'takasho2024admin',
  // 見積が作られたときの通知先
  NOTIFY_EMAIL: 'izumo@takezofarm.co.jp',
  // 通知メールを送らない場合は false
  SEND_MAIL: true,
};

const SHEET_VISITORS = '来場者';
const SHEET_ESTIMATES = '見積履歴';

// ---------- シート準備 ----------
function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}
function visitorSheet_() {
  return sheet_(SHEET_VISITORS, ['ID', '氏名', '郵便番号', '初回登録日時', '最終見積日時', '見積回数', '最終見積合計']);
}
function estimateSheet_() {
  return sheet_(SHEET_ESTIMATES, ['ID', '来場者ID', '氏名', '郵便番号', '施工場所', '明細(JSON)', '合計(税別)', '作成日時']);
}

function nextId_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return 1;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues().map(function (r) { return Number(r[0]) || 0; });
  return Math.max.apply(null, ids) + 1;
}

function findVisitorRow_(sh, name, postalCode) {
  const last = sh.getLastRow();
  if (last < 2) return null;
  const rows = sh.getRange(2, 1, last - 1, 7).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][1]).trim() === name && String(rows[i][2]).trim() === postalCode) {
      return { row: i + 2, values: rows[i] };
    }
  }
  return null;
}

function upsertVisitor_(name, postalCode) {
  const sh = visitorSheet_();
  const found = findVisitorRow_(sh, name, postalCode);
  if (found) return { id: Number(found.values[0]), row: found.row };
  const id = nextId_(sh);
  sh.appendRow([id, name, postalCode, new Date(), '', 0, '']);
  return { id: id, row: sh.getLastRow() };
}

// ---------- 受け口 ----------
function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { body = {}; }
  const action = body.action;
  let result;

  try {
    if (action === 'registerVisitor') result = registerVisitor_(body);
    else if (action === 'recordEstimate') result = recordEstimate_(body);
    else if (action === 'adminLogin') result = adminLogin_(body);
    else if (action === 'adminVisitors') result = adminVisitors_(body);
    else if (action === 'adminDeleteEstimate') result = adminDeleteEstimate_(body);
    else if (action === 'adminDeleteVisitor') result = adminDeleteVisitor_(body);
    else result = { error: 'unknown action' };
  } catch (err) {
    result = { error: String(err) };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------- 各処理 ----------
function registerVisitor_(b) {
  const name = String(b.name || '').trim();
  const postalCode = String(b.postalCode || '').trim();
  if (!name || !postalCode) return { error: 'name and postalCode required' };
  upsertVisitor_(name, postalCode);
  return { ok: true };
}

function recordEstimate_(b) {
  const name = String(b.name || '').trim();
  const postalCode = String(b.postalCode || '').trim();
  const items = b.items || [];
  const total = Number(b.total) || 0;
  const now = new Date();

  const v = upsertVisitor_(name, postalCode);
  const vs = visitorSheet_();
  const count = (Number(vs.getRange(v.row, 6).getValue()) || 0) + 1;
  vs.getRange(v.row, 5, 1, 3).setValues([[now, count, total]]);

  const es = estimateSheet_();
  const id = nextId_(es);
  es.appendRow([id, v.id, name, postalCode, b.locationName || '', JSON.stringify(items), total, now]);

  if (CONFIG.SEND_MAIL && CONFIG.NOTIFY_EMAIL) {
    try { sendMail_(name, postalCode, b.locationName, items, total); } catch (err) {}
  }
  return { ok: true, estimateId: id };
}

function sendMail_(name, postalCode, locationName, items, total) {
  const tax = Math.floor(total * 0.1);
  const withTax = Math.floor(total * 1.1);
  const rows = items.map(function (i) {
    return '<tr>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #ddd;">' + (i.modelNo || '-') + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #ddd;">' + i.name + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #ddd;text-align:center;">' + i.quantity + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #ddd;text-align:right;">¥' + Number(i.price).toLocaleString() + '</td>' +
      '<td style="padding:8px 12px;border-bottom:1px solid #ddd;text-align:right;">¥' + Number(i.subtotal).toLocaleString() + '</td>' +
      '</tr>';
  }).join('');

  const html =
    '<div style="font-family:sans-serif;max-width:640px;">' +
    '<h2 style="color:#7a3a10;">ガーデンライト 見積が作成されました</h2>' +
    '<p>お名前：' + name + ' 様<br>郵便番号：〒' + postalCode +
    (locationName ? '<br>施工場所：' + locationName : '') + '</p>' +
    '<table style="width:100%;border-collapse:collapse;font-size:13px;">' +
    '<tr style="background:#f2f2f2;"><th style="padding:8px 12px;text-align:left;">型番</th>' +
    '<th style="padding:8px 12px;text-align:left;">商品名</th>' +
    '<th style="padding:8px 12px;">数量</th><th style="padding:8px 12px;text-align:right;">単価</th>' +
    '<th style="padding:8px 12px;text-align:right;">小計</th></tr>' + rows + '</table>' +
    '<p style="margin-top:16px;">小計（税別）：¥' + total.toLocaleString() +
    '<br>消費税：¥' + tax.toLocaleString() +
    '<br><b>合計（税込）：¥' + withTax.toLocaleString() + '</b></p>' +
    '<p style="color:#888;font-size:12px;">※工事費・配線費用は含まれていません。</p></div>';

  MailApp.sendEmail({
    to: CONFIG.NOTIFY_EMAIL,
    subject: '【見積】' + name + ' 様（〒' + postalCode + '）',
    htmlBody: html,
  });
}

// ---------- 管理画面 ----------
function token_() {
  return Utilities.base64EncodeWebSafe(CONFIG.ADMIN_PASSWORD + '|takezofarm');
}
function checkToken_(t) {
  return t && t === token_();
}

function adminLogin_(b) {
  if (String(b.password) === CONFIG.ADMIN_PASSWORD) return { token: token_() };
  return { error: 'invalid password' };
}

function adminVisitors_(b) {
  if (!checkToken_(b.token)) return { error: 'unauthorized' };

  const vs = visitorSheet_();
  const es = estimateSheet_();
  const vLast = vs.getLastRow();
  const eLast = es.getLastRow();

  const estimatesByVisitor = {};
  if (eLast >= 2) {
    es.getRange(2, 1, eLast - 1, 8).getValues().forEach(function (r) {
      const vid = Number(r[1]);
      if (!estimatesByVisitor[vid]) estimatesByVisitor[vid] = [];
      estimatesByVisitor[vid].push({
        id: Number(r[0]),
        visitorId: vid,
        locationName: r[4] || null,
        items: typeof r[5] === 'string' ? r[5] : JSON.stringify(r[5]),
        total: Number(r[6]) || 0,
        createdAt: r[7] ? new Date(r[7]).toISOString() : null,
      });
    });
  }

  const visitors = [];
  if (vLast >= 2) {
    vs.getRange(2, 1, vLast - 1, 7).getValues().forEach(function (r) {
      const id = Number(r[0]);
      const history = (estimatesByVisitor[id] || []).sort(function (a, b2) {
        return (b2.createdAt || '').localeCompare(a.createdAt || '');
      });
      visitors.push({
        id: id,
        name: String(r[1]),
        postalCode: String(r[2]),
        registeredAt: r[3] ? new Date(r[3]).toISOString() : null,
        lastEstimateAt: r[4] ? new Date(r[4]).toISOString() : null,
        estimateCount: Number(r[5]) || 0,
        lastEstimateItems: history.length ? history[0].items : null,
        lastEstimateTotal: r[6] === '' ? null : Number(r[6]),
        estimateHistory: history,
      });
    });
  }
  visitors.sort(function (a, b2) {
    return String(b2.registeredAt || '').localeCompare(String(a.registeredAt || ''));
  });
  return { visitors: visitors };
}

function deleteRowById_(sh, id) {
  const last = sh.getLastRow();
  if (last < 2) return false;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = ids.length - 1; i >= 0; i--) {
    if (Number(ids[i][0]) === Number(id)) { sh.deleteRow(i + 2); return true; }
  }
  return false;
}

function adminDeleteEstimate_(b) {
  if (!checkToken_(b.token)) return { error: 'unauthorized' };
  deleteRowById_(estimateSheet_(), b.estimateId);
  return { ok: true };
}

function adminDeleteVisitor_(b) {
  if (!checkToken_(b.token)) return { error: 'unauthorized' };
  const es = estimateSheet_();
  const last = es.getLastRow();
  if (last >= 2) {
    const rows = es.getRange(2, 1, last - 1, 2).getValues();
    for (let i = rows.length - 1; i >= 0; i--) {
      if (Number(rows[i][1]) === Number(b.visitorId)) es.deleteRow(i + 2);
    }
  }
  deleteRowById_(visitorSheet_(), b.visitorId);
  return { ok: true };
}
