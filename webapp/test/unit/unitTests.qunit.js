/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"excel_to_viz/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
