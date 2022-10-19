var SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1epLNlI-ovIrnm3qo6Q_Bfc0-iB0M337SvXmusyvAaP4/edit#gid=0";

function getScriptUrl() {
  var url = ScriptApp.getService().getUrl();
  console.log('Logger 3 : ',url);
  return url;
}

/**
 * Get "home page", or a requested page.
 * Expects a 'page' parameter in querystring.
 * https://developers.google.com/apps-script/guides/web
 *
 * @param {event} e Event passed to doGet, with querystring
 * @returns {String/html} Html to be served
 */
function doGet(e) {
  console.log(Utilities.jsonStringify(e));
  if (!e.parameter.page) {
    // When no specific page requested, return "home page"
    return HtmlService.createTemplateFromFile('form').evaluate().setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  if(e.parameter.page == 'dashboard') {
        return HtmlService.createTemplateFromFile('dashboard').evaluate().setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  if(e.parameter.page == 'graph') {
        return HtmlService.createTemplateFromFile('graph').evaluate().setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  // else, use page parameter to pick an html file from the script
  return HtmlService.createTemplateFromFile(e.parameter['page']).evaluate().setXFrameOptionsMode(
    HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Writes phone number into spreadsheet .
 *
 * @param {data} Array - form data.
 */
function userClicked(data) {
  var spreadsheet = SpreadsheetApp.openByUrl(SHEET_URL);
  var sheet = spreadsheet.getSheetByName("formresponse");
  var lastrow = sheet.getLastRow();
  sheet.getRange(lastrow + 1, 1, data.length, data[0].length).setValues(data);
}

/**
 * Removes duplicate rows from the current sheet.
 */
//----Obsolete------
function removeDuplicates() {
  var sheet = SpreadsheetApp.openByUrl(SHEET_URL).getSheetByName("formresponse");
  var data = sheet.getDataRange().getValues();
  var newData = [];
  for (var i in data) {
    var row = data[i];
    var duplicate = false;
    for (var j in newData) {
      if (row.slice(0, 2).join() == newData[j].slice(0, 2).join()) {
        duplicate = true;
      }
    }
    if (!duplicate) {
      newData.push(row);
    }
  }

  sheet.clearContents();
  sheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
}

function removeDuplicates_with_logs() {
  var sheet = SpreadsheetApp.openByUrl(SHEET_URL).getSheetByName("formresponse");
  sheet.sort(1,false);  //sort descending
  var data = sheet.getDataRange().getValues();
  var newData = [];
  var data_log = [];
  for (var i in data) {
    var row = data[i];
    var duplicate = false;
    for (var j in newData) {
      if (row.slice(1, 4).join() == newData[j].slice(1, 4).join()) {
        duplicate = true;
        data_log.push(row); //will add duplicate entries in log 
      }
    }
    if (!duplicate) {
      newData.push(row);
    }
  }
  sheet.clearContents();
  sheet.getRange(1, 1, newData.length, newData[0].length).setValues(newData);
  sheet.sort(1);  //sort ascending

  //Copying duplicate or removed deleted data from 'formresponse' to 'formresponse_logs' sheet.
  var sheet_log = SpreadsheetApp.openByUrl(SHEET_URL).getSheetByName("formresponse_logs");
  var lastrow = sheet_log.getLastRow();
  sheet_log.getRange(lastrow + 1, 1, data_log.length, data_log[0].length).setValues(data_log.reverse());
}

/**
 * Retrive email address of the person running the script.
 */
function getEmail() {
  let email = Session.getActiveUser().getEmail().replace("@google.com", "");
  return email;
}
/**
 * Get contents of spreadsheet
 * @return vslues - Array of data from spreadsheet. 
 */
function getSheetData() {
  var spreadSheetId = "1epLNlI-ovIrnm3qo6Q_Bfc0-iB0M337SvXmusyvAaP4"; 
  // var dataRange = "formresponse!A2:E"; //CHANGE
  var dataRange = "formresponse!B2:F"; //CHANGE
  var range = Sheets.Spreadsheets.Values.get(spreadSheetId, dataRange);
  var values = range.values;
  console.log(Utilities.jsonStringify(values[0]));
  return values;
}
// For testing anythng new
function test() {
  // removeDuplicates()
  // getEmail();
  getSheetData();
}