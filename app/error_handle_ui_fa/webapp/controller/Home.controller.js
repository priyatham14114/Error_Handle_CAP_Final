sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("com.app.errorhandleuifa.controller.Home", {
        onInit: async function () {


        },
        onAfterRendering: async function () {

            var oChartModel = new JSONModel();
            this.getView().setModel(oChartModel, "oChartModel");

            try {
                const oModel = this.getOwnerComponent().getModel();
                const oBinding = oModel.bindList("/DailyErrorCounts");
                await oBinding.requestContexts().then(aContexts => {
                    const aData = aContexts.map(oCtx => oCtx.getObject());
                    oChartModel.setData({ value: aData });
                });
            } catch (error) {
                console.error("Error fetching chart data:", error);
            }

            var oVizFrame = this.byId("idBarChart");
            var oPopover = this.byId("idPopOver");
            if (oPopover && oVizFrame) {
                oPopover.connect(oVizFrame.getVizUid());
            }

            // // Cards
            // var sCardManifestUrl = sap.ui.require.toUrl("com/app/errorhandleuifa/cardsManifests/cardsManifest.json");
            // var cardManifests = new JSONModel();
            // cardManifests.loadData(sCardManifestUrl);

            //  test
            let sBasePath = "";
            try {
                const oModel = this.getOwnerComponent().getModel()
                let sPath = "/getAppConfig(...)";
                var oContextBinding = oModel.bindContext(sPath);
                oContextBinding.execute().then(function () {
                    var oResponse = oContextBinding.getBoundContext().getObject();
                    sBasePath = oResponse.UIbasePath || "";
                }).catch(function (oError) {
                    sap.m.MessageBox.error("Function execution failed: " + oError.message);
                    console.error(oError);
                });
            } catch (err) {
                console.error("Failed to get UIBasePath", err.message);
            }

            // Loadnig cars manifest
            const sCardManifestUrl = sap.ui.require.toUrl("com/app/errorhandleuifa/cardsManifests/cardsManifest.json");
            const oCardsModel = new JSONModel();
            await new Promise((resolve, reject) => {
                oCardsModel.loadData(sCardManifestUrl, null, true);
                oCardsModel.attachRequestCompleted(resolve);
                oCardsModel.attachRequestFailed(reject);
            });

            // Patch defaultUrl of each card
            const oData = oCardsModel.getData();
            Object.keys(oData).forEach(cardKey => {
                const sapCard = oData[cardKey]["sap.card"];
                if (sapCard.configuration && sapCard.configuration.destinations && sapCard.configuration.destinations.srv) {
                    sapCard.configuration.destinations.srv.defaultUrl = sBasePath + "/odata/v4/catalog/";
                }
            });

            this.getView().setModel(oCardsModel, "manifests");
            //  test
        }

    });
});