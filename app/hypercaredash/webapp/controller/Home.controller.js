sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/generic/app/navigation/service/NavigationHandler",
    "sap/ui/generic/app/navigation/service/SelectionVariant"
], (Controller, JSONModel, NavigationHandler, SelectionVariant) => {
    "use strict";

    return Controller.extend("com.app.hypercaredash.controller.Home", {
        async onInit() {

            // Load flow name mappings
            const oMappingModel = new JSONModel();
            const sUrl = sap.ui.require.toUrl(
                "com/app/hypercaredash/model/businesscontext.json"
            );

            await new Promise((resolve, reject) => {
                oMappingModel.attachRequestCompleted(resolve);
                oMappingModel.attachRequestFailed(reject);
                oMappingModel.loadData(sUrl);
            });

            this.getView().setModel(oMappingModel, "flowMap");

            // Initialize default date range (Today)
            const dToday = new Date();

            const dFrom = new Date(Date.UTC(
                dToday.getUTCFullYear(),
                dToday.getUTCMonth(),
                dToday.getUTCDate(),
                0, 0, 0, 0
            ));

            const dTo = new Date(Date.UTC(
                dToday.getUTCFullYear(),
                dToday.getUTCMonth(),
                dToday.getUTCDate(),
                23, 59, 59, 999
            ));

            this._dFrom = dFrom.toISOString();
            this._dTo = dTo.toISOString();

            console.log("Date while initializing:", this._dFrom, +"TO" + this._dTo);
            // Load KPI data`
            await this.loadKPIData(
                this._dFrom,
                this._dTo
            );
        },
        loadKPIData: async function (fromDate, toDate) {

            const oView = this.getView();

            try {

                const oModel = this.getOwnerComponent().getModel();
                const oFlowMapModel = oView.getModel("flowMap");

                if (!oModel) {
                    throw new Error("OData model is unavailable.");
                }

                if (!oFlowMapModel) {
                    throw new Error("Flow mapping model is unavailable.");
                }

                const mFlowNames = oFlowMapModel.getData() || {};
                const aDefaultFlows = Object.keys(mFlowNames);

                const oBinding = oModel.bindContext("/getIFlowKPI(...)");

                oBinding.setParameter("fromDate", fromDate);
                oBinding.setParameter("toDate", toDate);

                await oBinding.execute();

                const oContext = oBinding.getBoundContext();

                if (!oContext) {
                    throw new Error("Failed to retrieve KPI data.");
                }

                const oResult = oContext.getObject();
                const aData = Array.isArray(oResult?.value)
                    ? oResult.value
                    : (Array.isArray(oResult) ? oResult : []);

                // Add display names
                const aFormattedData = aData.map(oItem => ({
                    ...oItem,
                    DisplayName:
                        mFlowNames[oItem.iFlow_name?.trim()] ||
                        oItem.iFlow_name
                }));

                let oJsonModel = oView.getModel("kpi");

                if (!oJsonModel) {

                    oJsonModel = new JSONModel({
                        tiles: [],
                        iflows: [],
                        aDefaultFlows: []
                    });

                    oView.setModel(oJsonModel, "kpi");
                }

                oJsonModel.setProperty("/tiles", aFormattedData);
                oJsonModel.setProperty("/iflows", aFormattedData);
                oJsonModel.setProperty("/aDefaultFlows", aDefaultFlows);

                this._aOriginalTiles = [...aFormattedData];

                const oMCB = this.byId("idMCBFlows");

                if (oMCB && !oMCB.getSelectedKeys().length) {
                    oMCB.setSelectedKeys(aDefaultFlows);
                }

                this.onIFlowSelectionFinish({
                    getSource: () => oMCB
                });

            } catch (error) {

                console.error("Error while loading KPI data:", error);

                sap.m.MessageBox.error(
                    "Unable to load KPI data. Please try again later."
                );

            }
        },
        onIFlowSelectionFinish: function (oEvent) {

            const aSelectedKeys = oEvent.getSource().getSelectedKeys();

            const oModel = this.getView().getModel("kpi");

            // No filters selected → show everything
            if (!aSelectedKeys.length) {
                oModel.setProperty("/tiles", this._aOriginalTiles);
                return;
            }
            const oSelectedSet = new Set(aSelectedKeys);

            const aFilteredData = this._aOriginalTiles.filter(
                oItem => oSelectedSet.has(oItem.iFlow_name)
            );

            oModel.setProperty("/tiles", aFilteredData);
            this.getView().byId("_IDGenTextTimestamp").setText(`Last Updated: ${new Date().toLocaleTimeString()}`);
            this.getView().byId("kpiTable").getBinding("items").refresh();

        },
        onDateRangeChange: async function (oEvent) {

            sap.m.MessageToast.show("Date range changed...");

            let dFrom = oEvent.getParameter("from");
            let dTo = oEvent.getParameter("to");

            if (!dFrom) {
                sap.m.MessageToast.show("Please select a valid date range.");
                return;
            }

            // Single-day selection
            if (!dTo) {
                dTo = new Date(dFrom);
            }

            // Save for navigation
            this._dFrom = dFrom.toISOString();
            this._dTo = dTo.toISOString();

            console.log("Date while range changed:", this._dFrom, +"TO" + this._dTo);

            await this.loadKPIData(
                this._dFrom,
                this._dTo
            );

            this.byId("_IDGenTextTimestamp")
                .setText(
                    `Last Updated: ${new Date().toLocaleTimeString()}`
                );

        },
        onFlowTilePress: async function (oEvent) {

            const starget = oEvent.getSource().getBindingContext("kpi").getObject().iFlow_name;
            const sSource = oEvent.getSource().getBindingContext("kpi").getObject().SourceType;
            // User didn't select a date range → use today's range
            if (!this._dFrom || !this._dTo) {

                const dToday = new Date();

                const dFrom = new Date(
                    dToday.getFullYear(),
                    dToday.getMonth(),
                    dToday.getDate(),
                    0, 0, 0, 0
                );

                const dTo = new Date(
                    dToday.getFullYear(),
                    dToday.getMonth(),
                    dToday.getDate(),
                    23, 59, 59, 999
                );

                this._dFrom = dFrom.toISOString();
                this._dTo = dTo.toISOString();
            }
            try {
                sap.m.MessageToast.show("Navigating...");
                console.log(`Test3 ${this._dFrom}...${this._dTo}`);
                if (sap.ushell && sap.ushell.Container) {
                    switch (sSource) {
                        case "LOG":
                            const oSelectionVariant = new sap.ui.generic.app.navigation.service.SelectionVariant();
                            oSelectionVariant.addSelectOption("iFlow_name", "I", "EQ", starget);
                            oSelectionVariant.addSelectOption("createdAt", "I", "BT", this._dFrom, this._dTo);

                            const oNavigationHandler = new sap.ui.generic.app.navigation.service.NavigationHandler(this);

                            oNavigationHandler.navigate(
                                "ErrorLogSet",
                                "manage",
                                oSelectionVariant.toJSONString(),
                                {
                                    selectionVariant: oSelectionVariant.toJSONString(),
                                    customData: {}
                                },
                                function (oError) {
                                    console.error(oError);
                                    sap.m.MessageBox.error("Navigation failed.");
                                }
                            );
                            console.log(`Filterssss: ${oSelectionVariant.toJSONString()}`);
                            break;

                        case "FILE":
                            var Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                            await Navigation.navigate({
                                target: { semanticObject: "ErrorFilesSet", action: "manage" },
                                params: {
                                    iFlow_name: [starget],
                                    createdAt: [`${this._dFrom}...${this._dTo}`]
                                }

                            });
                            break;
                        default:
                            sap.m.MessageBox.show("Unknown source type. Cannot navigate.", {
                                icon: sap.m.MessageBox.Icon.ERROR,
                                title: "Navigation Error",
                                actions: [sap.m.MessageBox.Action.OK]
                            });
                            console.log("Unknown source type");
                    }
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        },

    });
});