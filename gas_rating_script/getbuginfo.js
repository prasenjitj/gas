/**
 * The event handler triggered when opening the spreadsheet.
 * @param {Event} e The onOpen event.
 * @see https://developers.google.com/apps-script/guides/triggers#onopene
 */
function onOpen(e) {
  // Add a custom menu to the spreadsheet.
  SpreadsheetApp.getUi() // Or DocumentApp, SlidesApp, or FormApp.
    .createMenu('Menu')
    .addItem('Update bug names', 'updateBugTitle')
    .addItem('update days open', 'updateDaysOpen')
    .addToUi();
}

function getCustomFieldsData(id, cfName) {
  var customFields = BuganizerApp.getBug(id).getCustomFields();
  let cfObj = {};
  for (let i in customFields) {
    cfObj[customFields[i].getName()] = customFields[i].getValue();
  }
  return cfObj[cfName];
}

function updateBugTitle() {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();   //.getSheetByName("lang_raw_Q322");  
  let dataValues = spreadsheet.getDataRange().getValues();
  for (let i = 1; i < dataValues.length; i++) {
    let id = dataValues[i][1].toString();
    console.log(id);
    id = id.replace(' ', '').replace('[', '').replace(']', '').replace(' -', '');
    if (id.includes('b/')) {
      id = id.replace('b/', '');
    }
    let title = dataValues[i][2];
    if (title == 'null') {
      let newTitle = getBugTitle(id);
      spreadsheet.getRange(i + 1, 3).setValue(newTitle);
    }
  }
}

function getBugTitle(bugNumber) {
  try {
    var bugName = BuganizerApp.getBug(bugNumber).getSummary();
  } catch (error) {
    console.log(error.message);
    let message = error.message.match(/Exception:\s(.*)/)[1];
    bugName = message;
  }
  console.log(bugName);
  return bugName;
}

function updateDaysOpen() {
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();   //.getSheetByName("lang_raw_Q322");  
  let dataValues = spreadsheet.getDataRange().getValues();
  for (let i = 1; i < dataValues.length; i++) {
    let id = dataValues[i][1].toString();
    console.log(id);
    id = id.replace(' ', '').replace('[', '').replace(']', '').replace(' -', '');
    if (id.includes('b/')) {
      id = id.replace('b/', '');
    }
    let result = getBugDaysOpen(id);
    spreadsheet.getRange(i + 1, 10).setValue(result.creationDate);
    spreadsheet.getRange(i + 1, 11).setValue(result.closingDate);
    spreadsheet.getRange(i + 1, 12).setValue(result.daysOpen);
    spreadsheet.getRange(i + 1, 13).setValue(result.tdDelata);
  }
}

function getBugDaysOpen(bugId) {
  const fixedValues = ['fixed','verified', 'not_reproducible', 'intended_behavior', 'obsolete', 'infeasible', 'duplicate','verifier_assigned'];
  var issue = BuganizerApp.getBug(bugId);
  var status = issue.getStatus();
  var targetDate = new Date(getCustomFieldsData(bugId, 'Target Date'));
  console.log(status);
  if (fixedValues.includes(status)) {
    var closingDate = new Date(issue.getResolvedTime());
  } else {
    closingDate = new Date();
  }
  var creationDate = new Date(issue.getCreatedTime());
  // Calculate the difference between the two times in days.
  var targetDateDelta = Math.floor((targetDate - closingDate) / (1000 * 60 * 60 * 24));
  if(!targetDateDelta) {
    targetDateDelta = "TargetDate not set."
  }
  var daysOpen = Math.floor((closingDate - creationDate) / (1000 * 60 * 60 * 24));
  console.log(creationDate, closingDate, targetDateDelta, daysOpen);
  return {
    'creationDate': creationDate,
    'closingDate': closingDate,
    'tdDelata': targetDateDelta,
    'daysOpen': daysOpen
  }
}

// function test () {
//   getBugTitle(244443822);
// }
