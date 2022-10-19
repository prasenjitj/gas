const SPREADSHEET_KEY = "1Ee0aE13LN01JOcI9FS349yYf6iozArwsvvsKl0lxdDg";
const UNNO_RESPONSE_RANGE = "Response!A2:P";
const UNNO_TODAY_RANGE = "OOO Today!A2:F";
const FEEDBACK_RANGE = "feedback!A2:B";

/**
 *
 */
function getScriptUrl() {
  let url = ScriptApp.getService().getUrl();
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
  if (!e.parameter.page) {
    // When no specific page requested, return "home page"
    return HtmlService.createTemplateFromFile("index")
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  if (e.parameter.page == "table") {
    return HtmlService.createTemplateFromFile("table")
      .evaluate()
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  // if(e.parameter.page == 'graph') {
  //       return HtmlService.createTemplateFromFile('graph').evaluate().setXFrameOptionsMode(
  //     HtmlService.XFrameOptionsMode.ALLOWALL);
  // }
  // else, use page parameter to pick an html file from the script
  return HtmlService.createTemplateFromFile(e.parameter.page)
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function writeFormResponse(responseText) {
  let email = Session.getActiveUser().getEmail();
  let values = [[email, responseText]];
  utilslib.appendSheetData(SPREADSHEET_KEY, FEEDBACK_RANGE, values);
}
/**
 * Retuns an Array of records who are OOO today.
 * @returns {Array}
 */
function getTodayUno() {
  return utilslib.getSheetData(UNNO_TODAY_RANGE, SPREADSHEET_KEY);
}
/**
 * @param  {Array} list An array of unno records
 * @returns {Array} newList An array of filtered Unno List with only
 * approved or pending as the status.
 */
function selectElements(list) {
  let newList = [];
  let indexes = [1, 2, 4, 6, 7, 9, 15];
  for (let i in list) {
    let newElement = indexes.map(function (item) {
      return list[i][item];
    });
    if (newElement[6] == "APPROVED" || newElement[6] == "PENDING") {
      newList.push(newElement);
    }
  }
  return newList;
}

function getScriptText() {
  let text = "SELECT * FROM daas_dev_team.team_vfs.productivity WHERE";
  text +=
    " ldap NOT IN ( 'prasenjitj', 'abin', 'rakshit', 'aroras', 'chaitanaya', 'ssarbhoy', 'khunger', 'nipunc','shaiqjeelani')";
  text += " AND date > '2021-12-31'";
  text += " AND Activity ='Absenteeism'";
  text += " AND team = 'VF Data Team (GUR)'";
  return text;
}

function getTimesheetData() {
  let output = utilslib.getPlxData(getScriptText);
  output = output.slice(1);
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  output = output.map((item) => ({
    activity: item[0],
    date: item[1],
    hour: item[2],
    ldap: item[3],
    minute: item[4],
    team: item[5],
    year: item[6],
    month: month[new Date(item[1]).getMonth()],
  }));
  return output;
}
/**
 * Coverts Unno record array into an object.
 * @param {Array} array An array of records.
 * @returns {Array.<Object>} Array of objects.
 */
function covertData(array) {
  return array.map((item) => ({
    timestamp: item[0],
    team: item[1],
    ldap: item[2],
    from: item[3],
    to: item[4],
    leavetype: item[5],
    status: item[6],
  }));
}
/**
 * The main callback function starts here.
 */
function mainCallback() {
  let unnoData = covertData(
    selectElements(utilslib.getSheetData(UNNO_RESPONSE_RANGE, SPREADSHEET_KEY))
  );
  let timesheetData = getTimesheetData();
  console.log(unnoData[0], "  ", timesheetData[0]);

  return [unnoData, timesheetData];
}
