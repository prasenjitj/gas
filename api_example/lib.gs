/**
 * format unix timestamp to formated datetime.
 * @param {int} unix timestamp.
 * @returns {String} ormated datetime string.
 */
function formatDateTime(unixtimestamp) {
  return Utilities.formatDate(new Date(unixtimestamp * 1000), "GMT+5:30", "MM-dd-yyyy HH:mm:ss");
}
/**
 * Coverts array item into an object.
 * @param {Array} array An array of records.
 * @returns {Array.<Object>} Array of objects.
 */
function convertData(array) {
  return array.map((item) => ({
    mobile: item.notes.Mobile,
    subscription_id: item.id,
    plan_id: item.plan_id,
    subscription_link: item.short_url,
    customer_id: item.customer_id,
    created: formatDateTime(item.created_at),
    next_due: formatDateTime(item.charge_at),
    status: item.status,
  }));
}

function clearSheet_(spreadsheetId, range) {
  SpreadsheetApp.openById(spreadsheetId).getRange(range).clearContent();
}
/**
 * Appends data to a specific sheet in a Google Spreadsheet.
 *
 * @param {string} spreadsheetId - The ID of the Google Spreadsheet.
 * @param {Array<Object>} values - An array of objects representing the data to be appended.
 */
function appendSheetData_(spreadsheetId, _values) {
  // Get the active spreadsheet
  var sheet = SpreadsheetApp.openById(spreadsheetId);
  
  // Get the active sheet
  var activeSheet = sheet.getSheetByName('raw');

  // Clear existing data in the sheet
  activeSheet.clear();

  // Write header row
  var headerRow = Object.keys(_values[0]);
  activeSheet.appendRow(headerRow);

  // Write data rows
  var dataRows = _values.map(function(row) {
    return headerRow.map(function(key) {
      return row[key];
    });
  });
  // Batch write data rows
  activeSheet.getRange(2, 1, dataRows.length, headerRow.length).setValues(dataRows);
}
