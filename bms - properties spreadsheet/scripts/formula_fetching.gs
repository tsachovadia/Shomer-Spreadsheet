/**
 * FORMULA-DOC MAKER  v3
 * ▸ שומר כל נוסחה כ"טקסט קשיח": "'=…"
 * ▸ מוכן ל-CSV / Python / Excel בלי אוטו-Eval
 */

const CONFIG = {
  templateSheetName: 'House template',
  houseSheetNamePattern: /^(Copy of \d{4} E \d{2} ST \d?|\d{4} E \d{2} ST \d?)$/i,
  otherSheetsToProcess: ['Summary', 'Monthly payment', '411 E 112 St'],
  outputSheetName: 'Formula_Documentation'
};

/* ───────────────────────────────────────── MAIN ────────────────────────────── */

function extractAllFormulas() {
  const ss     = SpreadsheetApp.getActiveSpreadsheet();
  const out    = [['Sheet Name','Cell','Formula (text)']];
  let templateHandled = false;

  // 1) template ראשון
  const tpl = ss.getSheetByName(CONFIG.templateSheetName);
  if (tpl) { collect(tpl, tpl.getName() + ' (TEMPLATE)', out); templateHandled = true; }

  // 2) רשימה מפורשת
  CONFIG.otherSheetsToProcess.forEach(n => {
    if (n === CONFIG.templateSheetName) return;
    const sh = ss.getSheetByName(n); if (sh) collect(sh, sh.getName(), out);
  });

  // 3) גיליונות "בית" אם אין תבנית
  if (!templateHandled) {
    ss.getSheets().forEach(sh => {
      const n = sh.getName();
      if (CONFIG.houseSheetNamePattern.test(n) &&
          n !== CONFIG.templateSheetName &&
          !CONFIG.otherSheetsToProcess.includes(n)) {
        collect(sh, n, out);
      }
    });
  }

  // 4) כתיבה
  writePlain(ss, CONFIG.outputSheetName, out);
  console.log(`✔︎ exported ${out.length-1} formulas`);
}

/* ─────────────────────────── helpers ─────────────────────────── */

function collect(sheet, label, master) {
  const rows = sheet.getLastRow(), cols = sheet.getLastColumn();
  if (!rows || !cols) return;

  const formulas = sheet.getRange(1,1,rows,cols).getFormulas();  // ‎=A1+A2
  for (let r = 0; r < rows; r++) {
    const row = formulas[r]; if (!row.some(Boolean)) continue;
    for (let c = 0; c < cols; c++) {
      const f = row[c];
      if (f) master.push([ label,
                           sheet.getRange(r+1,c+1).getA1Notation(),
                           `"\'${f}"` ]);    // "'=SUM…" ← טקסט מוחלט
    }
  }
}

function writePlain(ss, name, values) {
  let sh = ss.getSheetByName(name);
  sh ? sh.clearContents() : sh = ss.insertSheet(name);

  sh.getRange(1,1,values.length,values[0].length).setValues(values);
  // הופך את עמודת הנוסחאות ל-Plain-text
  sh.getRange(1,3,values.length,1).setNumberFormat('@');
}