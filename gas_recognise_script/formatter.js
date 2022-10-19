/**
 * Simple trigger that runs each time the user hand edits the spreadsheet.
 *
 * @param {Object} e The onEdit() event object.
 */
function onEdit(e) {
  if (!e) {
    throw new Error(
      "Please do not run the onEdit(e) function in the script editor window. " +
        "It runs automatically when you hand edit the spreadsheet."
    );
  }
  formatText(e.range);
}

/**
 * Simple trigger that runs each time the user opens the
 * spreadsheet.
 *
 * Adds a menu item to highlight a phrase.
 *
 * @param {Object} e The onOpen() event object.
 * @OnlyCurrentDoc
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu("Highlight")
    .addItem("Highlight phrases", "formatPhrasesInText")
    .addToUi();
}

/**
 * Applies rich text formats to currently selected cells.
 */
function formatPhrasesInText() {
  formatText(SpreadsheetApp.getActiveRange());
}

/**
 * Applies rich text formats to text in a range.
 * Formats substrings that match a regex, each substring separately.
 * Handles multiple occurrences of each phrase in each cell.
 * Overwrites formulas and numbers with the text shown in the cell.
 *
 * @param {Range} range The range to format.
 * @return {Range} The same range, for chaining.
 */
function formatText(range) {
  // version 1.3, written by --Hyde, 30 March 2022
  //  - see https://support.google.com/docs/thread/157400260?msgid=157852265
  // version 1.2, written by --Hyde, 28 October 2021
  //  - see https://stackoverflow.com/a/69750237/13045193
  const specs = [
    { regex: /red/gi, textColor: "red", bold: true },
    { regex: /green/gi, textColor: "green", bold: true },
    { regex: /blue/gi, textColor: "blue", bold: true },
    { regex: /orange/gi, textColor: "orange", bold: true },
    { regex: /black/gi, textColor: "black", bold: true },
  ];
  const values = range.getDisplayValues();
  let match;
  const formattedText = values.map((row) =>
    row.map((value) => {
      const richText = SpreadsheetApp.newRichTextValue().setText(value);
      specs.forEach((spec) => {
        const format = SpreadsheetApp.newTextStyle()
          .setForegroundColor(spec.textColor)
          .setBold(spec.bold)
          .build();
        while ((match = spec.regex.exec(value))) {
          richText.setTextStyle(
            match.index,
            match.index + match[0].length,
            format
          );
        }
      });
      return richText.build();
    })
  );
  range.setRichTextValues(formattedText);
}
