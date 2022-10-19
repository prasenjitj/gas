
const SPREADSHEET_KEY =  "1A6ClR-N8b3DoI85_p9luZEbdPqdB9WEnVqMoixDmsGY";
/** Read data using Sheet API with spreadsheet key
 */
function getSheetData() {
  var dataRange = "[New] Form Responses!A3:U";
  var range = Sheets.Spreadsheets.Values.get(SPREADSHEET_KEY, dataRange);
  var values = range.values;
  values = values.filter((item) => item[19] == null);
  values = values.map((item) => ({
    launch_date : item[2],
    reported_on : item[0],
    team : "DaaS",
    ptb : item[3],
    project_title : item[4],
    short_desc : item[6],
    impact : item[15],
    contributors : item[16],
    launch_report : item [17],
    lauch_type : item[18]
  }));
  console.log(Utilities.jsonStringify(values[0]));

  return  values;
}


