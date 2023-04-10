// Use this script for cretating new rating trix and onepager docs.

var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

function createNewDocs() {
  // change value to sheet name for team e.g vf_lang, vf_data or vf_onto
  var rawSheet = spreadsheet.getSheetByName("vf_data");
  var dataValues = rawSheet.getDataRange().getValues();
  // var dataValues = rawSheet.getRange("A26:D").getValues();

  // var temp = "";
  for (var i = 1; i < dataValues.length; i++) {
    var ldap = dataValues[i][0];
    var name = dataValues[i][1];
    // trixLdaps.push(ldap)
    console.log('ldap: ', ldap);
    var onePagerName = "Quarterly Self Assessment | One Pager | " + name;
    var newRatingTrixName = "Quarterly Self Assessment | " + name;
    console.log(newRatingTrixName);
    if (destFolder.getFilesByName(newRatingTrixName).hasNext() === false) {
      console.log('creatig new file >> ',onePagerName);
      DriveApp.getFileById(fileID).makeCopy(newRatingTrixName, destFolder);
      DriveApp.getFileById(ONEPAGERID).makeCopy(onePagerName, destFolder);
      var onePagerUrl = destFolder.getFilesByName(onePagerName).next().getUrl();
      var ratingTrixUrl = destFolder.getFilesByName(newRatingTrixName).next().getUrl();
      // console.log(onePagerUrl,'\n',ratingTrixUrl);
      var oPagerID = destFolder.getFilesByName(onePagerName).next().getId();
      var ratingTrixID = destFolder.getFilesByName(newRatingTrixName).next().getId();
      Drive.Permissions.insert(
        {
          'role': 'writer',
          'type': 'user',
          'value': ['umesha@google.com', 'saxena@google.com', 'mansvi@google.com', 'mehrasakshi@google.com', 'shaiqjeelani@google.com', 'nipunc@google.com', ldap + '@google.com', 'chaitanaya@google.com', 'arshkaul@google.com']
        },
        oPagerID,
        {
          'sendNotificationEmails': 'false'
        }
      );
      Drive.Permissions.insert(
        {
          'role': 'writer',
          'type': 'user',
          'value': ['umesha@google.com', 'saxena@google.com', 'mansvi@google.com', 'mehrasakshi@google.com', 'shaiqjeelani@google.com', 'nipunc@google.com', ldap + '@google.com', 'chaitanaya@google.com', 'arshkaul@google.com']
        },
        ratingTrixID,
        {
          'sendNotificationEmails': 'false'
        }
      );
      // DriveApp.getFilesByName(onePagerName).next().addEditors(['umesha@google.com', 'saxena@google.com', 'mansvi@google.com','bhartip@google.com','ashas@google.com', ldap + '@google.com']);
      // DriveApp.getFilesByName(newRatingTrixName).next().addEditors(['umesha@google.com', 'saxena@google.com', 'mansvi@google.com','bhartip@google.com','ashas@google.com', ldap + '@google.com']);
      rawSheet.getRange("C" + (i + 1)).getCell(1, 1).setFormula('=HYPERLINK(\"' + ratingTrixUrl + '\",\"' + newRatingTrixName + '\")');
      rawSheet.getRange("D" + (i + 1)).getCell(1, 1).setFormula('=HYPERLINK(\"' + onePagerUrl + '\",\"' + onePagerName + '\")');
    } else {
      var oPagerID = DriveApp.getFilesByName(onePagerName).next().getId();
      var ratingTrixID = DriveApp.getFilesByName(newRatingTrixName).next().getId();
      // Drive.Permissions.insert(
      //   {
      //     'role': 'writer',
      //     'type': 'user',
      //     'value': [ldap + '@google.com', 'chaitanaya@google.com', 'arshkaul@google.com', 'umesha@google.com', 'saxena@google.com', 'mansvi@google.com', 'mehrasakshi@google.com', 'shaiqjeelani@google.com', 'nipunc@google.com']
      //   },
      //   oPagerID,
      //   {
      //     'sendNotificationEmails': 'false'
      //   }
      // );
      // Drive.Permissions.insert(
      //   {
      //     'role': 'writer',
      //     'type': 'user',
      //     'value': [ldap + '@google.com', 'chaitanaya@google.com', 'arshkaul@google.com', 'umesha@google.com', 'saxena@google.com', 'mansvi@google.com', 'mehrasakshi@google.com', 'shaiqjeelani@google.com', 'nipunc@google.com']
      //   },
      //   ratingTrixID,
      //   {
      //     'sendNotificationEmails': 'false'
      //   }
      // );
      // DriveApp.getFilesByName(onePagerName).next().addEditors(['umesha@google.com', 'saxena@google.com', 'mansvi@google.com','bhartip@google.com','ashas@google.com', ldap + '@google.com']);
      // DriveApp.getFilesByName(newRatingTrixName).next().addEditors(['umesha@google.com', 'saxena@google.com', 'mansvi@google.com','bhartip@google.com','ashas@google.com', ldap + '@google.com']);
      // removeAccess(onePagerName);
      // removeAccess(newRatingTrixName);

      var onePagerUrl = destFolder.getFilesByName(onePagerName).next().getUrl();
      var ratingTrixUrl = destFolder.getFilesByName(newRatingTrixName).next().getUrl();
      rawSheet.getRange("C" + (i + 1)).getCell(1, 1).setFormula('=HYPERLINK(\"' + ratingTrixUrl + '\",\"' + newRatingTrixName + '\")');
      rawSheet.getRange("D" + (i + 1)).getCell(1, 1).setFormula('=HYPERLINK(\"' + onePagerUrl + '\",\"' + onePagerName + '\")');
    }

  }
}

function removeAccess(fileName) {
  var emails = ['bahrtip@google.com'];
  for (item in emails) {
    DriveApp.getFilesByName(fileName).next().removeEditor(item);
  }
}

// function deleteAllFile() {
//   var files = destFolder.getFiles();
//   while (files.hasNext()) {
//     files.next().setTrashed(true);
//   }
// }

/*------------------------------------------------------------------------*/
// Testing bewlow this line
function initialize() {
  var destFolder = DriveApp.getFolderById(datafolderID);
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // change value to sheet name for team e.g vf_lang, vf_data or vf_onto
  var rawSheet = spreadsheet.getSheetByName("vf_data");
  var dataValues = rawSheet.getDataRange().getValues();
  for (var i = 1; i < dataValues.length; i++) {
    var ldap = dataValues[i][0];
    var name = dataValues[i][1];
    ldapMapping[ldap] = name;
    newFileName = "Quarterly Self Assessment | " + name;
    Logger.log(newFileName);
    var newFileId = destFolder.getFilesByName(newFileName).next().getId();
    Logger.log(newFileId)
  }
  // console.log(ldapMapping);
  // var destFolder = DriveApp.getFolderById(langFolderID);
}


function test() {
  // for (key in ldapMapping) {
  // newFileName = "Quarterly Self Assessment | " + ldapMapping[key];
  var newFileName = "Quarterly Self Assessment | Safi Ahmad";
  Logger.log(newFileName);
  var newFileId = destFolder.getFilesByName(newFileName).next().getId();
  console.log(newFileId);
  // }
}