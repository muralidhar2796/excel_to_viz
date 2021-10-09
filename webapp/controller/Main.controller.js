sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
    function (Controller) {
        "use strict";

        return Controller.extend("exceltoviz.controller.Main", {
            onInit: function () {
                this.getView().byId("uploadExcel").firePress();
            },
            onUpload: function () {
                this.uploadFragment = sap.ui.xmlfragment("exceltoviz.view.fragment.uploader", this);
                this.uploadFragment.open();
            },
            handleTypeMissmatch: function (oEvent) {
                var aFileTypes = oEvent.getSource().getFileType();
                aFileTypes.map(function (sType) {
                    return "*." + sType;
                });
                sap.m.MessageToast.show("The file type *." + oEvent.getParameter("fileType") +
                    " is not supported. Choose file of type *.xlsx only");
            },
            handleUploadPress: function () {
                var oFileUploader = sap.ui.getCore().byId("fileUploader");
                if (!oFileUploader.getValue()) {
                    sap.m.MessageToast.show("Choose a file first");
                    return;
                }
                var domRef = oFileUploader.getFocusDomRef();
                var file = domRef.files[0];
                this.uploadFragment.close();
                this.uploadFragment.destroy();
                this._convertToJSON(file);
            },
            onUploadCancel: function () {
                this.uploadFragment.close();
                this.uploadFragment.destroy();
            },
            _convertToJSON: function (oFile) {
                var that = this;
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    var sheet = workbook.Sheets[workbook.SheetNames[0]];
                    var result = XLSX.utils.sheet_to_json(sheet);
                    that._decodeJSON(result);
                };
                reader.readAsBinaryString(oFile);
            },
            _decodeJSON: function (result) {
                if (result) {
                    var keys = Object.keys(result[0]);
                    if (keys.length !== 0) {
                        this.chooseDialog = sap.ui.xmlfragment("exceltoviz.view.fragment.choose", this);
                        this.chooseDialog.open();
                        var oModel = new sap.ui.model.json.JSONModel();
                        var main_data = [];
                        for (var i = 0; i < keys.length; i++) {
                            var data = {
                                Value: keys[i]
                            };
                            main_data.push(data);
                        }
                        oModel.setData({
                            modelData: main_data
                        });
                        sap.ui.getCore().setModel(oModel, "ChooseModel");
                        this.excelModel = new sap.ui.model.json.JSONModel();
                        this.excelModel.setData({
                            items: result
                        });
                    }
                }
            },
            onChoose: function () {
                var dSelect = sap.ui.getCore().byId("idVTable").getSelectedItem();
                var mSelect = sap.ui.getCore().byId("idCTable").getSelectedItem();
                if (dSelect) {
                    var getdPath = dSelect.getBindingContextPath();
                    var getdValue = sap.ui.getCore().getModel("ChooseModel").getProperty(getdPath).Value;
                } else {
                    sap.m.MessageToast.show("Select any Dimension");
                }
                if (mSelect) {
                    var getmPath = mSelect.getBindingContextPath();
                    var getmValue = sap.ui.getCore().getModel("ChooseModel").getProperty(getmPath).Value;
                } else {
                    sap.m.MessageToast.show("Select any Measure");
                }
                if (getdValue !== getmValue) {
                    this.chooseDialog.close();
                    this.chooseDialog.destroy();
                    this._setVizModel(getdValue, getmValue);
                } else {
                    sap.m.MessageToast.show("Both Measure and Dimension can't be same");
                }
            },
            onClose: function () {
                this.chooseDialog.close();
                this.chooseDialog.destroy();
            },
            _setVizModel: function (dimension, measure) {
                if (this.excelModel) {
                    var oVizFrame = this.getView().byId("idBarChart");
                    this._setVizData(oVizFrame, dimension, measure);
                    oVizFrame = this.getView().byId("idColumnChart");
                    this._setVizData(oVizFrame, dimension, measure);
                    oVizFrame = this.getView().byId("idPieChart");
                    this._setVizData(oVizFrame, dimension, measure);
                    oVizFrame = this.getView().byId("idDonutChart");
                    this._setVizData(oVizFrame, dimension, measure);
                }
            },
            _setVizData: function (oVizFrame, dimension, measure) {
                var dimensionValue = "{" + dimension + "}";
                var measureValue = "{" + measure + "}";
                var oDataset = new sap.viz.ui5.data.FlattenedDataset({
                    dimensions: [{
                        name: dimension,
                        value: dimensionValue
                    }],

                    measures: [{
                        name: measure,
                        value: measureValue
                    }],

                    data: {
                        path: "/items"
                    }
                });
                oVizFrame.setDataset(oDataset);

                oVizFrame.setModel(this.excelModel);
                oVizFrame.setVizProperties({
                    title: {
                        visible: false
                    }
                });
                var vizType = oVizFrame.getVizType();
                if (vizType === "bar" || vizType === "column") {
                    var feedValue = "valueAxis";
                    var feedCat = "categoryAxis";
                } else {
                    feedValue = "size";
                    feedCat = "color";
                }

                var oFeedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    "uid": feedValue,
                    "type": "Measure",
                    "values": [measure]
                });

                var oFeedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
                    "uid": feedCat,
                    "type": "Dimension",
                    "values": [dimension]
                });
                oVizFrame.destroyFeeds();
                oVizFrame.addFeed(oFeedValueAxis);
                oVizFrame.addFeed(oFeedCategoryAxis);
            }
        });
    });
