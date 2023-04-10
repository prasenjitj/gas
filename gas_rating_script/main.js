/*jshint esversion: 6 */
// Main function is createAll()
// let header = ["process", "bug_title", "breakup"];
// Rating template file ID
// https://docs.google.com/spreadsheets/d/1adml8B9O2IAIxYnJidUxXhoDZjF8lnV2zmHzc1UDUkA/edit?resourcekey=0-UoPi_qWLR-HBfw3zqtsE6w#gid=343062567
// let fileIdOld = "117XzwcL86VKBqK-zSWmLrtpovyMcpj3Otdf1X7Jr9Nw";
// rating template go/vfs-rating-template
const FILEID = "1adml8B9O2IAIxYnJidUxXhoDZjF8lnV2zmHzc1UDUkA";
const ONEPAGERID = "1FgCtWdjNeHQ4o2R8PBPDmwQmSh_CoYVn-LnBfq_OqOM";
const FOLDERID = "1YEdxLFoIrVA7mCAxi901QFlZc_jTPkRY";
const DATAFOLDERID = "1YEdxLFoIrVA7mCAxi901QFlZc_jTPkRY";
const LANGFOLDERID = "1mojrVtO2oFQ37PiUWsjvL3H3DXlKb1HG";
const ONTOFOLDERID = "1aJGiouv26Qgy9pj2nAnRb7-503ndyitd";

// DATAFOLDERID, langFolderID, ontoFolderID
// Replace folder Id for corresponding Team e.g for vf lang use vfLangFolderID
const destFolder = DriveApp.getFolderById(DATAFOLDERID);

var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

var trixLdaps = [];
// var ldapMapping = {
//   "abhinavrai": "Abhinav Rai",
//   // "satishrawat": "Satish Rawat",
// };
// -------------------------------------------------
var ldapMapping = {};
var rawSheet;
var dataValues;
//change value to sheet name for team e.g vf_lang, vf_data or vf_onto
var rawSheet = spreadsheet.getSheetByName("vf_data");
var dataValues = rawSheet.getDataRange().getValues();
for (var i = 1; i < dataValues.length; i++) {
  var ldap = dataValues[i][0];
  var name = dataValues[i][1];
  ldapMapping[ldap] = name;
}
// console.log(ldapMapping);
// -------------------------------------------------

function initializeTest() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // change value to sheet name for team e.g vf_lang, vf_data or vf_onto
  var rawSheet = spreadsheet.getSheetByName("vf_data");
  var dataValues = rawSheet.getDataRange().getValues();
  for (var i = 1; i < dataValues.length; i++) {
    var ldap = dataValues[i][0];
    var name = dataValues[i][1];
    ldapMapping[ldap] = name;
    var newFileName = "Quarterly Self Assessment | " + name;
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    Logger.log(newFileId);
  }
}

function convertToMap(data) {
  const dataMap = new Map();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    const record = data[i];
    const ldap = record[0];

    if (!dataMap.has(ldap)) {
      dataMap.set(ldap, []);
    }

    const recordObj = {};
    for (let j = 0; j < headers.length; j++) {
      recordObj[headers[j]] = record[j];
    }

    dataMap.get(ldap).push(recordObj);
  }

  return dataMap;
}

function getData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var map = convertToMap(data);
  return map;
}

function createAll() {
  //entry point - >> lang_raw_Q123, onto_raw_Q123, data_raw_Q123
  var rawSheet = spreadsheet.getSheetByName("data_raw_Q123");
  var dataValues = rawSheet.getDataRange().getValues();
  // var outsheet = "";
  for (var i = 1; i < dataValues.length; i++) {
    if (dataValues[i][0] in ldapMapping) {
      var ldap = dataValues[i][0];
      var process = dataValues[i][1];
      var bug_title = dataValues[i][2];
      var total_minutes = dataValues[i][3];
      var total_minutes_perldap = dataValues[i][4];
      var breakup = dataValues[i][5];
      var outsheet = createTabInTrix(ldap);
      if (outsheet) {
        outsheet.appendRow([process, bug_title, breakup]);
        // console.log(i);
      }
    }
  }
  console.log("Process Completed");
  updateEthics();
  formatSheets();
}
function createTabInTrix(ldap) {
  // console.log('destFolder ID >> ', DATAFOLDERID);
  var newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
  var newFileId = destFolder.getFilesByName(newFileName);
  if (newFileId.hasNext()) {
    var newFileId = newFileId.next().getId();
  } else {
    console.log(newFileName + " not found.");
  }
  var spreadsheet = SpreadsheetApp.openById(newFileId);
  if (trixLdaps.indexOf(ldap) == -1) {
    try {
      var template = SpreadsheetApp.openById(FILEID);
      var rating_description = template.getSheetByName("Ratings_Description");
      var rating_model = template.getSheetByName("Rating Model");
      var raw_data = template.getSheetByName("V10_Q1_22");
      if (!spreadsheet.getSheetByName("Ratings_Description")) {
        rating_description
          .copyTo(SpreadsheetApp.openById(newFileId))
          .setName("Ratings_Description");
      }
      if (!spreadsheet.getSheetByName("Rating Model")) {
        rating_model
          .copyTo(SpreadsheetApp.openById(newFileId))
          .setName("Rating Model");
      }
      if (!spreadsheet.getSheetByName("Q1'23")) {
        raw_data.copyTo(SpreadsheetApp.openById(newFileId)).setName("Q1'23");
        var newTab = spreadsheet.getSheetByName("Q1'23");
        spreadsheet.setActiveSheet(newTab);
        spreadsheet.moveActiveSheet(1);
        trixLdaps.push(ldap);
        console.log("Created trix for ", ldapMapping[ldap]);
        return newTab;
      }
    } catch (err) {
      Logger.log(err.message);
    }
  } else {
    return spreadsheet.getSheetByName("Q1'23");
  }
  // return newTab;
}
function updateAbsenteeismRating(outsheet, ldap) {
  var docName = "Quarterly Self Assessment | One Pager | " + ldapMapping[ldap];
  var docUrl = destFolder.getFilesByName(docName).next().getUrl();
  var absUrl =
    "https://docs.google.com/spreadsheets/d/1RojKcLxi60CtDNlBLtzpE-QUqDLmBl5rvd5mnPeyo9Y/edit#gid=1681467151";

  var values = spreadsheet
    .getSheetByName("absenteeism_Q123")
    .getDataRange()
    .getValues();
  var rating = "",
    value = "";
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] == ldap) {
      rating = values[i][5];
      value = values[i][3];
    }
  }
  try {
    outsheet
      .getRange("C21")
      .getCell(1, 1)
      .setFormula('=HYPERLINK("' + docUrl + '","One Pager")');
    outsheet
      .getRange("C22")
      .getCell(1, 1)
      .setFormula('=HYPERLINK("' + docUrl + '","One Pager")');
    // outsheet.getRange("C23").getCell(1, 1).setFormula('=HYPERLINK("' + docUrl + '","One Pager")');
    // outsheet.getRange("C24").getCell(1, 1).setFormula('=HYPERLINK("' + docUrl + '","One Pager")');
    outsheet
      .getRange("C30")
      .getCell(1, 1)
      .setFormula('=HYPERLINK("' + docUrl + '","One Pager")');
    outsheet
      .getRange("C31")
      .getCell(1, 1)
      .setFormula('=HYPERLINK("' + docUrl + '","One Pager")');
    outsheet
      .getRange("C16")
      .getCell(1, 1)
      .setFormula('=HYPERLINK("' + absUrl + '","Absenteeism stats")');
    outsheet.getRange("D16").getCell(1, 1).setValue(value);
    outsheet.getRange("D16").getCell(1, 1).setNumberFormat("0.0%");
    outsheet.getRange("D16").getCell(1, 1).setHorizontalAlignment("Left");
    outsheet.getRange("E16").getCell(1, 1).setValue(value);
    console.log(value, rating);
    outsheet.getRange("F16").getCell(1, 1).setValue(rating);
    console.log("Absenteeism udpated for ", ldap);
  } catch (err) {
    console.error(err.message);
  }
}

function updateStats(outsheet, ldap, sheetname, rowindex) {
  var docName = "Quarterly Self Assessment | One Pager | " + ldapMapping[ldap];
  var karmaUrl =
    "https://docs.google.com/spreadsheets/d/1RojKcLxi60CtDNlBLtzpE-QUqDLmBl5rvd5mnPeyo9Y/edit#gid=1678612200";
  var lateUrl =
    "https://docs.google.com/spreadsheets/d/1RojKcLxi60CtDNlBLtzpE-QUqDLmBl5rvd5mnPeyo9Y/edit#gid=141162532";

  var values = spreadsheet.getSheetByName(sheetname).getDataRange().getValues();
  var rating = "",
    value = "";
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] == ldap) {
      rating = values[i][2];
      value = values[i][1];
    }
  }
  // outsheet.getRange("C17").getCell(1, 1).setFormula('=HYPERLINK("' + karmaUrl + '","Karma stats")');
  outsheet
    .getRange("C17")
    .getCell(1, 1)
    .setFormula('=HYPERLINK("' + lateUrl + '","Latecoming stats")');
  outsheet
    .getRange("D" + rowindex)
    .getCell(1, 1)
    .setValue(value);
  outsheet
    .getRange("D" + rowindex)
    .getCell(1, 1)
    .setNumberFormat("0.0");
  outsheet.getRange("D" + rowindex).setHorizontalAlignment("left");
  outsheet
    .getRange("F" + rowindex + ":F" + rowindex)
    .getCell(1, 1)
    .setValue(rating);
  outsheet
    .getRange("F" + rowindex + ":F" + rowindex)
    .getCell(1, 1)
    .setValue(rating);
  console.log("states udpated for ", ldap, rating, value);
}

function formatSheets() {
  Logger.log("Formatting ...");
  for (key in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[key];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var spreadsheet = SpreadsheetApp.openById(newFileId);
    var sheet = spreadsheet.getSheetByName("Q1'23");
    if (sheet) {
      var column = sheet.getRange("C38:C");
      column.setNumberFormat("0.0%");

      sheet.getRange("A38:G").setFontWeight("normal");
      sheet
        .getRange("A38:G")
        .setBorder(
          true,
          true,
          true,
          true,
          true,
          true,
          "black",
          SpreadsheetApp.BorderStyle.SOLID
        );

      var vrule = sheet.getRange("D30").getDataValidation();
      sheet.getRange("D38:D").setDataValidation(vrule);
      sheet.getRange("F38:F").setDataValidation(vrule);
      var range = sheet.getRange("H38:H");
      var index = 38;

      for (var i = 1; i < range.getNumRows() + 1; i++) {
        var formulaStr =
          "=IFERROR(AVERAGE(VLOOKUP(F" +
          index +
          ",Ratings_Description!$A$2:$B$6,2,)), 0)*C" +
          index;
        range.getCell(i, 1).setFormula(formulaStr);
        index += 1;
      }
      sheet.getRange("C3").setFormula("=IFERROR(SUM($H$38:$H), 0)");
      sheet.hideColumns(8);
    }
  }
  Logger.log("FORMATTING DONE");
}
// do not run this
/** 
function deleteSheets() {
  // Logger.log("deleteSheets called")
  var sheets = spreadsheet.getSheets();
  console.log(sheets.length);
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() != "Raw" && sheets[i].getName() != "absenteeism" && sheets[i].getName() != "bug_count" && sheets[i].getName() != "missing_titles" && sheets[i].getName() != "script") {
      spreadsheet.deleteSheet(sheets[i]);
    }
  }
}
*/
// ------------------------------------------------------------
function deleteCopyTab() {
  for (key in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[key];
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var spreadsheet = SpreadsheetApp.openById(newFileId);
    var sheets = spreadsheet.getSheets();

    for (var i = 0; i < sheets.length; i++) {
      if (sheets[i].getName().match(/Ratings_.*/)) {
        console.log("Deleting ...." + sheets[i].getName());
        spreadsheet.deleteSheet(sheets[i]);
      }
    }
  }
}

function deleteTab() {
  for (key in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[key];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var spreadsheet = SpreadsheetApp.openById(newFileId);
    var tab = spreadsheet.getSheetByName("Q1'23"); // Specify tab name to be deleted.
    if (!tab) {
      Logger.log("Tab not found");
    } else {
      spreadsheet.deleteSheet(tab);
      // Logger.log("Tab deleted");
    }
  }
}

function updateAbsenteeism() {
  var outsheet = "";
  for (ldap in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var spreadsheet = SpreadsheetApp.openById(newFileId);
    outsheet = spreadsheet.getSheetByName("Q1'23");
    if (outsheet != null) {
      updateAbsenteeismRating(outsheet, ldap);
    }
  }
}

function updateEthics() {
  for (ldap in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var spreadsheet = SpreadsheetApp.openById(newFileId);
    var outsheet = spreadsheet.getSheetByName("Q1'23");
    if (outsheet != null) {
      // updateStats(outsheet, ldap, "karma_q421", 17);
      updateStats(outsheet, ldap, "latecoming_Q123", 17);
      // updateAbsenteeismRating(outsheet, ldap);
    }
  }
  // formatSheets();
}

function updateLeadNames() {
  for (ldap in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    console.log(newFileId);
    var outsheet = SpreadsheetApp.openById(newFileId).getSheetByName("Q3'22");
    var lead1 = "Prasenjit";
    var lead2 = "Abhinav";
    outsheet.getRange("E14").setValue("Reviewer rating" + " (" + lead1 + ")");
    outsheet.getRange("F14").setValue("Reviewer rating" + " (" + lead2 + ")");
    outsheet.getRange("E20").setValue("Reviewer rating" + " (" + lead1 + ")");
    outsheet.getRange("F20").setValue("Reviewer rating" + " (" + lead2 + ")");
    outsheet.getRange("E27").setValue("Reviewer rating" + " (" + lead1 + ")");
    outsheet.getRange("F27").setValue("Reviewer rating" + " (" + lead2 + ")");
    outsheet.getRange("E31").setValue("Reviewer rating" + " (" + lead1 + ")");
    outsheet.getRange("F31").setValue("Reviewer rating" + " (" + lead2 + ")");
    // outsheet.getRange("E40").setValue("Reviewer rating" + " (" + lead1 + ")");
    outsheet.getRange("F40").setValue("Reviewer rating" + " (" + lead2 + ")");
  }
}

function updateFormula() {
  for (ldap in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var outsheet = SpreadsheetApp.openById(newFileId).getSheetByName("Q2'21");
    outsheet
      .getRange("F3")
      .setFormula(
        "=ROUND($C$3*0.5 + $C$4*0.1 + $C$5*0.2 + $C$6*0.1 + (5+IFS(OR($C$7=5,C7=0),0,AND($C$7<5,C7>=4),-1,AND($C$7<4,C7>=3),-2,AND($C$7<3,C7>=2),-3,AND($C$7<2,C7>=1),-4))*0.1, 2)"
      );
  }
}
// specify the row number to be deleted ini line 343
function deleteRow() {
  for (ldap in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var outsheet = SpreadsheetApp.openById(newFileId).getSheetByName("Q1'22");
    outsheet.deleteRow(18);
    console.log("Row 18 deleted");
  }
}
function updateFormulaTwo() {
  for (ldap in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var outsheet = SpreadsheetApp.openById(newFileId).getSheetByName("Q1'21");
    outsheet
      .getRange("F3")
      .setFormula(
        "=ROUND($C$3*0.5 + $C$4*0.1 + $C$5*0.2 + $C$6*0.1 + (5+IFS(OR($C$7=5,C7=0),0,AND($C$7<5,C7>=4),-1,AND($C$7<4,C7>=3),-2,AND($C$7<3,C7>=2),-3,AND($C$7<2,C7>=1),-4))*0.1, 2)"
      );
  }
}
function updateFormulaThree() {
  for (ldap in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var outsheet = SpreadsheetApp.openById(newFileId).getSheetByName("Q1'22");
    var range = outsheet.getRange("C39:C");
    var index = 39;
    for (var i = 1; i < range.getNumRows() + 1; i++) {
      var formulaStr =
        '=Query(IMPORTRANGE("https://docs.google.com/spreadsheets/d/108k1yiSHJQYVU0d_VCvingqjWDYr_ZnA0s09Ys7E8uA/edit?resourcekey=0-BNZ7bts2DUhzrXOKcjiF0w#gid=2100706576","data!A:F"),' +
        '"Select Col6 where Col2=\'"&A' +
        index +
        "&\"'and Col1='" +
        ldap +
        "'\",0)";
      range.getCell(i, 1).setFormula(formulaStr);
      Logger.log(index);
      index += 1;
    }
  }
}

function extractDocId(formulatext) {
  var rx = /\/d\/(.*?)\//gm;
  var arr = rx.exec(formulatext);
  return arr[1];
}

function updateAccess() {
  var lang_sheet = spreadsheet.getSheetByName("vf_lang");
  var data_sheet = spreadsheet.getSheetByName("vf_data");
  var onto_sheet = spreadsheet.getSheetByName("vf_onto");
  var list_ids = [];
  // var values = lang_sheet.getRange(2, 3, sheet.getDataRange().getNumRows()).getValues();
  for (var i = 2; i < onto_sheet.getDataRange().getNumRows(); i++) {
    var form = extractDocId(lang_sheet.getRange(i, 3).getFormula());
    list_ids.push(form);
  }

  // Logger.log(list_ids);
  // return;
  for (var i = 0; i < list_ids.length; i++) {
    var fileId = list_ids[i];
    if (fileId != "") {
      Drive.Permissions.insert(
        {
          role: "writer",
          type: "user",
          value: "bhartip@google.com",
        },
        fileId,
        {
          sendNotificationEmails: "false",
        }
      );
    }
  }
  // for (ldap in ldapMapping) {
  //   newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
  //   email = ldap + "@google.com";
  //   Logger.log(newFileName);
  //   var newFileId = destFolder.getFilesByName(newFileName).next().getId();
  //   var file = SpreadsheetApp.openById(newFileId);
  //   // var viewers = file.getEditors();
  //   // file.removeEditor(ldap + '@google.com');
  //   file.addEditor(ldap + '@google.com');
  //   destFolder.getFilesByName(newFileName).next().addCommenter(email);
  //   // Logger.log(viewers);

  // }
}

function recalcSheet() {
  for (ldap in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
    email = ldap + "@google.com";
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var outsheet = SpreadsheetApp.openById(newFileId).getSheets();
    for (var i = 0; i < outsheet.length; i++) {
      if (outsheet[i].getName().match(/Q\d.*/)) {
        console.log("Updating formula for ...." + outsheet[i].getName());
        var range = outsheet[i].getRange("H15:H");
        recalcRange(range, outsheet);
      }
    }
  }
}

function recalcRange(range, spreadsheet) {
  // Logger.log('Range: ' + range.getA1Notation());
  var numRows = range.getNumRows();
  var numCols = range.getNumColumns();
  var startRow = range.getRow();
  var startCol = range.getColumn();
  // Logger.log('row: ' + startRow);
  // Logger.log('col: ' + startCol);
  // Logger.log('numRows: ' + numRows);
  // Logger.log('numCols: ' + numCols);

  for (var r = 1; r <= numRows; r += 1) {
    for (var c = 1; c <= numCols; c += 1) {
      var originalFormula = range.getCell(r, c).getFormula();
      // Logger.log(`r,c ${r}, ${c}; originalFormula: ${originalFormula}`);
      if (originalFormula) {
        range.getCell(r, c).setFormula("");
        //SpreadsheetApp.flush(); // https://webapps.stackexchange.com/a/35970/27487
        range.getCell(r, c).setFormula(originalFormula);
      }
    }
  }
  Logger.log("Each cell in the range has been recalculated.");
}

function updateCellFormat() {
  for (ldap in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[ldap];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    var outsheet = SpreadsheetApp.openById(newFileId).getSheetByName("Q1'22");
    var range = outsheet.getRange("C8").setNumberFormat("0.00");
  }
}

function boilerPlate() {
  var rawSheet = spreadsheet.getSheetByName("vf_onto"); //change value to sheet name for team e.g vf_lang, vf_data or vf_onto
  var dataValues = rawSheet.getDataRange().getValues();
  for (var i = 1; i < dataValues.length; i++) {
    var ldap = dataValues[i][0];
    var name = dataValues[i][1];
    ldapMapping[ldap] = name;
  }
  console.log(ldapMapping);
  // updateCellFormat();
}

function updateCustomText() {
  const textMap = new Map();
  for (user in ldapMapping) {
    newFileName = "Quarterly Self Assessment | " + ldapMapping[user];
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    console.log(newFileId);
    var outsheet = SpreadsheetApp.openById(newFileId).getSheetByName("Q1'23");
    // var rawSheet = spreadsheet.getSheetByName("data_raw_Q123");
    var dataMap = getData();

    for (const [ldap, records] of dataMap) {
      let textArray = new Array();
      console.log(`LDAP: ${ldap}`);
      if (!textMap.has(ldap)) {
        textMap.set(ldap, []);
      }
      // Iterate over the records for this LDAP using a for...of loop
      for (const record of records) {
        // console.log(`Record: ${JSON.stringify(record)}`);
        var bug = record.process;
        var openDays = record.open_days;
        var delta = record.target_date_delta;
        var text =
          bug +
          " open for " +
          openDays +
          " days. " +
          "Target date delta is " +
          delta +
          " days.";
        textArray.push([text]);
      }
      textMap.get(ldap).push(textArray);
    }
    var arrayLength = textMap.get(user)[0].length - 1 + 38;
    console.log(textMap.get(user)[0].length);
    console.log(`G38:G${arrayLength}`);
    outsheet.getRange(`G38:G${arrayLength}`).setValues(textMap.get(user)[0]);
  }
}
