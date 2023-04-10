const SPREADSHEET_KEY = "1Ee0aE13LN01JOcI9FS349yYf6iozArwsvvsKl0lxdDg";
const WORKSTATUSSHEET_KEY = "1lic2QroDbmdQhx462YQ-RiguLlF378C05V4iPYsKIXo";
const UNNO_RESPONSE_RANGE = "Response!A2:P";
const UNNO_TODAY_RANGE = "OOO Today!A2:F";
const FEEDBACK_RANGE = "feedback!A2:B";
const PTB_RANGE = "work status (6251749)!A2:Q"; // 6375825
const BANDWIDTH_RANGE = "self_utilisation!A2:B";
const LDAP_RANGE = "active_ldaps!A2:A";

const LDAPS = [].concat(...utilslib.getSheetData(WORKSTATUSSHEET_KEY,LDAP_RANGE));

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
  if(e.parameter.page == 'utilisation') {
        return HtmlService.createTemplateFromFile('utilisation').evaluate().setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  // else, use page parameter to pick an html file from the script
  return HtmlService.createTemplateFromFile(e.parameter.page)
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function writeFormResponse(responseText) {
  let email = Session.getActiveUser().getEmail();
  let values = [[email, responseText]];
  appendSheetData(SPREADSHEET_KEY, FEEDBACK_RANGE, values);
}
/**
 * Retuns an Array of records who are OOO today.
 * @returns {Array}
 */
function getTodayUno() {
  return utilslib.getSheetData(SPREADSHEET_KEY, UNNO_TODAY_RANGE);
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
    " ldap NOT IN ( 'prasenjitj', 'abin', 'rakshit', 'chaitanaya', 'khunger', 'nipunc','shaiqjeelani')";
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
  Logger.log(output);
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
    selectElements(utilslib.getSheetData( SPREADSHEET_KEY, UNNO_RESPONSE_RANGE))
  );
  let timesheetData = getTimesheetData();
  console.log(unnoData[0], "  ", timesheetData[0]);

  return [unnoData, timesheetData];
}


function getBugsArray() {
  let key = "hotlistid:2079536 status:open";
  // let key = "hotlistid:2079536 assignee:(akhilbhatnagar@google.com | erai@google.com | jaritika@google.com | sanub@google.com) status:open";
  let bugArray = utilslib.getBugs(key);
  // console.log(bugArray);
  return [bugArray, LDAPS];
}


function getBugsData() {
  let data = utilslib.getSheetData(WORKSTATUSSHEET_KEY, PTB_RANGE);
  console.log(data)

  data =data.map((item) => ({
      id: item[0],
      title: item[1],
      projectStatus: item[2],
      otd: item[3],
      eta: item[4],
      vfOrg: item[5],
      primary: item[6],
      secondary: item[7],
      reviewer: item[8],
      project: item[9],
      assignee: item[10],
      priority: item[11],
      severity: item[12],
      type: item[13],
      status: item[14],
      note: item[15],
      mentor: item[16]
    }));
  // data = data.filter((item) => item.status =="ACCEPTED");
  // console.log(LDAPS);
  let dataflattened = flattenData(data);
  return [dataflattened,LDAPS,getBandwidthData(),data];
}

/**
 * Flattens an array of data objects
 * @param {Array} data - An array of data objects to be flattened
 * @return {Array} flattenedData - An array of flattened data objects
 */
function flattenData(data) {
  const flattenedData = data.map((item) => {
    const keys = ['assignee','primary', 'secondary', 'reviewer', 'mentor'];
    let flattenedObjects = [];
    keys.forEach((key) => {
      const namesArray = item[key]
        ? item[key]
            .split(',')
            .map((name) => name.trim().replace('@google.com', ''))
        : [''];
      namesArray.forEach((name) => {
        let obj = {};
        keys.forEach((k) => {
          if (k === key) {
            obj[k] = name;
          } else {
            obj[k] = '';
          }
        });
        obj.id = item.id;
        obj.title = item.title;
        obj.projectStatus = item.projectStatus;
        obj.otd = item.otd;
        obj.eta = item.eta;
        obj.vfOrg = item.vfOrg;
        obj.project = item.project;
        obj.assignee = item.assignee;
        obj.priority = item.priority;
        obj.severity = item.severity;
        obj.type = item.type;
        obj.status = item.status;
        obj.note = item.note;
        flattenedObjects.push(obj);
      });
    });
    return flattenedObjects;
  });
  return [].concat.apply([], flattenedData);
}

/**
 * filters bugs where status is Accepted.
 * @return {Array} bugsArray
 */
function filterAcceptedBugs() {
  let data = getBugsData()[0]
  data = data.filter((item) => item.status == 'ACCEPTED');
  return [data,LDAPS,getBandwidthData()];
}
/**
 * filters bugs where project Status is In-Progress.
 * @return {Array} bugsArray
 */
function filterInprogressBugs() {
  let data = getBugsData()[0];
  data = data.filter((item) => item.projectStatus == "In-Progress");
  return Promise.resolve([data, LDAPS, getBandwidthData()]);
}

function getBandwidthData() {
  let data = utilslib.getSheetData(WORKSTATUSSHEET_KEY, BANDWIDTH_RANGE);
  let obj ={};
  data.forEach((item) => (
    obj[item[0]] = item[1]
  ));
 return obj;
}

function testPerformance() {

  console.time('Execution Time');
  getBugsArray();
  console.timeEnd('Execution Time');
}
