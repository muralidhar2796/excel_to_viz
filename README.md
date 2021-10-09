# excel_to_viz
Simple UI5 Application that takes simple excel file and displays it as Viz Frames.

It uses two third party MIT licensed libraries Sheet.js to decode the XLSX file data and JSZip which is used internally by Sheet.js file.

Important Things to Note:
- The application is present in the Master branch of the repository
- The excel input should have a header row followed by the details.
- There is no validations done on the excel details
- The data uploaded is considered valid and the user selects the proper dimension and measure for the vizFrame
