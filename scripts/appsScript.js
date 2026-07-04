/**
 * Google Apps Script — Deploy inside the Google Sheet
 * 
 * SETUP:
 * 1. Open the spreadsheet → Extensions → Apps Script
 * 2. Replace all code in Code.gs with this file's contents
 * 3. Update DASHBOARD_SYNC_URL with your production dashboard URL
 * 4. Update SYNC_SECRET to match your .env SYNC_SECRET value
 * 5. Run setupTriggers() once manually (Run → setupTriggers)
 * 6. Authorize when prompted
 * 
 * WHAT THIS DOES:
 * - onEdit: Debounces cell edits and pushes changed rows to the dashboard within 30 seconds
 * - scheduledFullSync: Every 6 hours, pushes ALL rows to the dashboard as a full sync
 * - setupTriggers: One-time function to create the installable triggers
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION — UPDATE THESE VALUES
// ═══════════════════════════════════════════════════════════════════════════

const DASHBOARD_SYNC_URL = "https://your-dashboard-domain.com/api/sync";  // <-- UPDATE THIS
const SYNC_SECRET = "ccgs-alumni-sync-2026";  // Must match .env SYNC_SECRET
const TARGET_SHEET_GID = 1703773069;  // The specific sheet tab to monitor

// ═══════════════════════════════════════════════════════════════════════════
// ON-EDIT HANDLER (Real-time push with 30s debounce)
// ═══════════════════════════════════════════════════════════════════════════

function onEdit(e) {
  // Only trigger for the target sheet tab
  var sheet = e.source.getActiveSheet();
  if (sheet.getSheetId() !== TARGET_SHEET_GID) return;
  
  var row = e.range.getRow();
  if (row <= 1) return;  // Skip header row
  
  // Debounce: collect edited rows for 30 seconds before flushing
  var props = PropertiesService.getScriptProperties();
  var pending = JSON.parse(props.getProperty("pendingRows") || "[]");
  if (pending.indexOf(row) === -1) {
    pending.push(row);
  }
  props.setProperty("pendingRows", JSON.stringify(pending));
  
  // Remove any existing flushPendingSync triggers to reset the debounce timer
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "flushPendingSync") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
  
  // Set a new 30-second trigger
  ScriptApp.newTrigger("flushPendingSync")
    .timeBased()
    .after(30 * 1000)
    .create();
}

// ═══════════════════════════════════════════════════════════════════════════
// FLUSH PENDING EDITS (called 30 seconds after the last edit)
// ═══════════════════════════════════════════════════════════════════════════

function flushPendingSync() {
  var props = PropertiesService.getScriptProperties();
  var pending = JSON.parse(props.getProperty("pendingRows") || "[]");
  
  if (pending.length === 0) return;
  
  // Find the target sheet
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var sheet = null;
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === TARGET_SHEET_GID) {
      sheet = sheets[i];
      break;
    }
  }
  if (!sheet) return;
  
  // Read headers (first row)
  var headers = sheet.getRange(1, 1, 1, 9).getValues()[0];
  var rows = [];
  
  for (var j = 0; j < pending.length; j++) {
    var rowNum = pending[j];
    var values = sheet.getRange(rowNum, 1, 1, 9).getValues()[0];
    var rowObj = {};
    for (var k = 0; k < headers.length; k++) {
      rowObj[headers[k]] = values[k] !== undefined ? String(values[k]) : "";
    }
    rows.push(rowObj);
  }
  
  // POST to dashboard sync endpoint
  try {
    var response = UrlFetchApp.fetch(DASHBOARD_SYNC_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        secret: SYNC_SECRET,
        rows: rows,
        fullSync: false
      }),
      muteHttpExceptions: true
    });
    Logger.log("Sync response: " + response.getContentText());
  } catch (err) {
    Logger.log("Sync failed: " + err.message);
  }
  
  // Clear pending rows
  props.setProperty("pendingRows", "[]");
  
  // Clean up all flushPendingSync triggers
  var triggers = ScriptApp.getProjectTriggers();
  for (var t = 0; t < triggers.length; t++) {
    if (triggers[t].getHandlerFunction() === "flushPendingSync") {
      ScriptApp.deleteTrigger(triggers[t]);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULED FULL SYNC (every 6 hours — pushes ALL rows)
// ═══════════════════════════════════════════════════════════════════════════

function scheduledFullSync() {
  // Find the target sheet
  var sheets = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var sheet = null;
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === TARGET_SHEET_GID) {
      sheet = sheets[i];
      break;
    }
  }
  if (!sheet) {
    Logger.log("Target sheet not found");
    return;
  }
  
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    Logger.log("No data rows found");
    return;
  }
  
  var headers = data[0];
  var rows = [];
  
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    // Skip completely empty rows
    var hasData = false;
    for (var j = 0; j < row.length; j++) {
      if (row[j] !== "" && row[j] !== null && row[j] !== undefined) {
        hasData = true;
        break;
      }
    }
    if (!hasData) continue;
    
    var rowObj = {};
    for (var k = 0; k < headers.length; k++) {
      rowObj[headers[k]] = row[k] !== undefined ? String(row[k]) : "";
    }
    rows.push(rowObj);
  }
  
  // POST full dataset to dashboard
  try {
    var response = UrlFetchApp.fetch(DASHBOARD_SYNC_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        secret: SYNC_SECRET,
        rows: rows,
        fullSync: true
      }),
      muteHttpExceptions: true
    });
    Logger.log("Full sync response: " + response.getContentText());
  } catch (err) {
    Logger.log("Full sync failed: " + err.message);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SETUP TRIGGERS (Run this ONCE manually to create all triggers)
// ═══════════════════════════════════════════════════════════════════════════

function setupTriggers() {
  // Remove all existing triggers first
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    ScriptApp.deleteTrigger(existing[i]);
  }
  Logger.log("Cleared " + existing.length + " existing triggers");
  
  // 1. Installable onEdit trigger (needed for UrlFetchApp access)
  ScriptApp.newTrigger("onEdit")
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();
  Logger.log("Created onEdit trigger");
  
  // 2. Scheduled 6-hour recurring trigger
  ScriptApp.newTrigger("scheduledFullSync")
    .timeBased()
    .everyHours(6)
    .create();
  Logger.log("Created scheduledFullSync trigger (every 6 hours)");
  
  Logger.log("✅ All triggers set up successfully!");
}

// ═══════════════════════════════════════════════════════════════════════════
// MANUAL TEST (Run this to test the connection)
// ═══════════════════════════════════════════════════════════════════════════

function testConnection() {
  try {
    var response = UrlFetchApp.fetch(DASHBOARD_SYNC_URL, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        secret: SYNC_SECRET,
        rows: [{ "Alumni Name": "Test User", "School": "CCHS" }],
        fullSync: false
      }),
      muteHttpExceptions: true
    });
    Logger.log("Test response (" + response.getResponseCode() + "): " + response.getContentText());
  } catch (err) {
    Logger.log("Test failed: " + err.message);
  }
}
