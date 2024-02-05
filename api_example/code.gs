const USERNAME = "rzp_live_QTCltxkx7v3YdT";
const PASSWORD = "UNeiMEz9mEwjtV50ZY8V7mpQ";
const URL = "https://api.razorpay.com/v1/subscriptions";
const SHEETID = "1GfxdZnuft7nzHJ89xBJgRMuhjdlucogWGZpocEWXNKU";
const RANGE = "raw!A:H";
function run() {
  apiFetch();
}

function apiFetch() {

  var headers = {
    "Authorization": "Basic " + Utilities.base64Encode(USERNAME + ':' + PASSWORD)
  };

  var params = {
    "method": "GET",
    "headers": headers
  };

  var response = JSON.parse(UrlFetchApp.fetch(URL, params).getContentText());
  console.log(response.items[0]);
  let data = convertData(response.items);
  console.log(data[0]);

  appendSheetData_(SHEETID, data);
}
