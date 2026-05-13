#!/usr/bin/env node
/**
 * Sync translated content from an xlsx workbook into per-language CSV files.
 *
 * Usage: node sync-translations.js <path-to-xlsx>
 *
 * For each of the three translation tabs:
 *   1. Delete column G from the tab (in memory).
 *   2. Read F2:AD77 from the resulting sheet.
 *   3. Overwrite the same cell range in the matching language CSV.
 *   4. Write the CSV back to disk.
 *
 * The xlsx is also saved back out with column G removed from each translated tab.
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

const CSV_DIR = "public/amazon-mining-policy-scoreboard/data";

const TAB_TO_CSV = {
  "Translated english": "policy-scoreboard-data_en.csv",
  "Translated to spanish": "policy-scoreboard-data_es.csv",
  "Translated to portuguese": "policy-scoreboard-data_pt.csv",
};

// Source range in xlsx: F2:AD77 (F=col 6, AD=col 30, 1-indexed => 0-indexed 5..29 = 25 cols).
const SRC_COL_START = 5; // F
const SRC_COL_END = 29; // AD (inclusive)
const SRC_ROW_START = 1; // row 2 in 1-indexed => index 1
const SRC_ROW_END = 76; // row 77 in 1-indexed => index 76 (inclusive)

// Destination range in CSV: E2:AC77 (E=col 5, AC=col 29, 1-indexed => 0-indexed 4..28 = 25 cols).
const DST_COL_START = 4; // E
const DST_COL_END = 28; // AC (inclusive)

function readSheetAsMatrix(sheet) {
  // header:1 + defval:'' returns a 2D array including empty cells
  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    blankrows: true,
  });
}

function deleteColumnG(matrix) {
  // G is column index 6 (0-indexed). Splice it out of every row.
  return matrix.map((row) => {
    const copy = row.slice();
    if (copy.length > 6) copy.splice(6, 1);
    return copy;
  });
}

function extractRange(matrix) {
  const out = [];
  for (let r = SRC_ROW_START; r <= SRC_ROW_END; r++) {
    const row = matrix[r] || [];
    const slice = [];
    for (let c = SRC_COL_START; c <= SRC_COL_END; c++) {
      slice.push(row[c] !== undefined && row[c] !== null ? row[c] : "");
    }
    out.push(slice);
  }
  return out;
}

function overlayIntoCsv(csvRows, block) {
  // Ensure csvRows has at least SRC_ROW_END+1 rows.
  while (csvRows.length <= SRC_ROW_END) csvRows.push([]);

  for (let i = 0; i < block.length; i++) {
    const targetRowIdx = SRC_ROW_START + i;
    const targetRow = csvRows[targetRowIdx];

    // Pad the row so indices up through DST_COL_END exist.
    while (targetRow.length <= DST_COL_END) targetRow.push("");

    for (let j = 0; j < block[i].length; j++) {
      targetRow[DST_COL_START + j] = block[i][j];
    }
  }
  return csvRows;
}

function main() {
  const xlsxPath = process.argv[2];
  if (!xlsxPath) {
    console.error("Usage: yarn copy-scoreboard <path-to-xlsx>");
    process.exit(1);
  }

  const wb = XLSX.readFile(xlsxPath, { cellDates: false });

  for (const [tabName, csvFile] of Object.entries(TAB_TO_CSV)) {
    if (!wb.Sheets[tabName]) {
      console.error(`Missing tab in xlsx: "${tabName}"`);
      process.exit(1);
    }

    const csvPath = path.join(CSV_DIR, csvFile);
    if (!fs.existsSync(csvPath)) {
      console.error(`Missing CSV: ${csvPath}`);
      process.exit(1);
    }

    // 1. Read sheet, drop column G.
    const matrix = readSheetAsMatrix(wb.Sheets[tabName]);
    const trimmed = deleteColumnG(matrix);

    // Replace the sheet in the workbook with the column-G-removed version.
    wb.Sheets[tabName] = XLSX.utils.aoa_to_sheet(trimmed);

    // 2. Extract F2:AD77 from the trimmed matrix.
    const block = extractRange(trimmed);

    // 3. Load CSV, overlay the block, write back.
    const csvText = fs.readFileSync(csvPath, "utf8");
    const csvRows = parse(csvText, { relax_column_count: true });
    const merged = overlayIntoCsv(csvRows, block);
    const outCsv = stringify(merged);
    fs.writeFileSync(csvPath, outCsv, "utf8");

    console.log(`Updated ${csvPath} from tab "${tabName}"`);
  }

  // Save the xlsx with column G removed from the translated tabs.
  const modPath = xlsxPath.replace(/(\.xlsx)$/i, "_mod$1");
  XLSX.writeFile(wb, modPath);
  console.log(`Saved xlsx with column G removed: ${modPath}`);
}

main();
