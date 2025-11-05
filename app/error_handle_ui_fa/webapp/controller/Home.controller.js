sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("com.app.errorhandleuifa.controller.Home", {
        onInit: async function () {


        },
        onAfterRendering: async function () {

            let sBasePath = "";

            try {
                const oModel = this.getOwnerComponent().getModel();
                let sPath = "/getAppConfig(...)";
                const oContextBinding = oModel.bindContext(sPath);

                await oContextBinding.execute();

                const oResponse = oContextBinding.getBoundContext().getObject();
                sBasePath = oResponse?.value || "";

                if (sBasePath === "") {
                    console.error("Failed to append UI path to cards");
                    sap.m.MessageToast.show("Technical error occured")
                }

            } catch (err) {
                console.error("Failed to get UIBasePath", err.message);
            }

            // Load cards manifest for flat payloads
            const sCardManifestUrl = sap.ui.require.toUrl("com/app/errorhandleuifa/cardsManifests/cardsManifest.json");
            const oCardsModel = new sap.ui.model.json.JSONModel();

            await new Promise((resolve, reject) => {
                oCardsModel.loadData(sCardManifestUrl, null, true);
                oCardsModel.attachRequestCompleted(resolve);
                oCardsModel.attachRequestFailed(reject);
            });

            // Patch defaultUrl of each card
            const oData = oCardsModel.getData();
            Object.keys(oData).forEach(cardKey => {
                const sapCard = oData[cardKey]["sap.card"];
                if (sapCard.configuration?.destinations?.srv) {
                    sapCard.configuration.destinations.srv.defaultUrl = sBasePath + "/odata/v4/catalog/";
                }
            });

            this.getView().setModel(oCardsModel, "manifests");

            // Load cards manifest for file payloads
            const sCardManifestUrl_files = sap.ui.require.toUrl("com/app/errorhandleuifa/cardsManifests/filesCardsManifest.json");
            const oCardsModel_Files = new sap.ui.model.json.JSONModel();

            await new Promise((resolve, reject) => {
                oCardsModel_Files.loadData(sCardManifestUrl_files, null, true);
                oCardsModel_Files.attachRequestCompleted(resolve);
                oCardsModel_Files.attachRequestFailed(reject);
            });

            // Patch defaultUrl of each card
            const oData_Files = oCardsModel_Files.getData();
            Object.keys(oData_Files).forEach(cardKey => {
                const sapCard = oData_Files[cardKey]["sap.card"];
                if (sapCard.configuration?.destinations?.srv) {
                    sapCard.configuration.destinations.srv.defaultUrl = sBasePath + "/odata/v4/catalog/";
                }
            });

            this.getView().setModel(oCardsModel_Files, "filemanifests");
            //  test
        },
        onAction_TotalErrors: async function (oEvent) {
            try {
                sap.m.MessageToast.show("Navigating...");

                if (sap.ushell && sap.ushell.Container) {
                    const Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                    await Navigation.navigate({
                        target: { semanticObject: "ErrorLogSet", action: "manage" },
                        params: {}
                    });
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        },
        onAction_FailedErrors: async function (oEvent) {
            try {
                sap.m.MessageToast.show("Navigating...");

                if (sap.ushell && sap.ushell.Container) {
                    const Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                    await Navigation.navigate({
                        target: { semanticObject: "ErrorLogSet", action: "manage" },
                        params: { Status: ["Failed"] }

                    });
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        },
        onAction_Success: async function (oEvent) {
            try {
                sap.m.MessageToast.show("Navigating...");

                if (sap.ushell && sap.ushell.Container) {
                    const Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                    await Navigation.navigate({
                        target: { semanticObject: "ErrorLogSet", action: "manage" },
                        params: { Status: ["Success"] }

                    });
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        },
        onAction_NoRetries: async function (oEvent) {
            try {
                sap.m.MessageToast.show("Navigating...");

                if (sap.ushell && sap.ushell.Container) {
                    const Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                    await Navigation.navigate({
                        target: { semanticObject: "ErrorLogSet", action: "manage" },
                        params: { Status: ["No retries yet"] }

                    });
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        },
        onAction_AllFiles: async function (oEvent) {
            try {
                sap.m.MessageToast.show("Navigating...");

                if (sap.ushell && sap.ushell.Container) {
                    const Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                    await Navigation.navigate({
                        target: { semanticObject: "ErrorFilesSet", action: "manage" },
                        params: {}

                    });
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        },
        onAction_SuccessFiles: async function (oEvent) {
            try {
                sap.m.MessageToast.show("Navigating...");

                if (sap.ushell && sap.ushell.Container) {
                    const Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                    await Navigation.navigate({
                        target: { semanticObject: "ErrorFilesSet", action: "manage" },
                        params: { Status: ["Success"] }


                    });
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        },
        onAction_FailedFiles: async function (oEvent) {
            try {
                sap.m.MessageToast.show("Navigating...");

                if (sap.ushell && sap.ushell.Container) {
                    const Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                    await Navigation.navigate({
                        target: { semanticObject: "ErrorFilesSet", action: "manage" },
                        params: { Status: ["Failed"] }


                    });
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        },
        onAction_NoTriesFiles: async function (oEvent) {
            try {
                sap.m.MessageToast.show("Navigating...");

                if (sap.ushell && sap.ushell.Container) {
                    const Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                    await Navigation.navigate({
                        target: { semanticObject: "ErrorFilesSet", action: "manage" },
                        params: { Status: ["No retries yet"] }


                    });
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        },
        onAction_RecentLogsTable: async function (oEvent) {
            try {
                sap.m.MessageToast.show("Navigating...");
                let recordID = oEvent.mParameters.parameters.ID,
                time = oEvent.mParameters.parameters.createdAt
                if (sap.ushell && sap.ushell.Container) {
                    const Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                    await Navigation.navigate({
                        target: { semanticObject: "ErrorLogSet", action: "manage" },
                        params: { ID: [recordID], CreatedAt: [time] }

                    });
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        },
        onAction_RecentFiles: async function (oEvent) {
            try {
                sap.m.MessageToast.show("Navigating...");
                let recordID = oEvent.mParameters.parameters.ID,
                    time = oEvent.mParameters.parameters.createdAt
                if (sap.ushell && sap.ushell.Container) {
                    const Navigation = await sap.ushell.Container.getServiceAsync("Navigation");
                    await Navigation.navigate({
                        target: { semanticObject: "ErrorFilesSet", action: "manage" },
                        params: { ID: [recordID], CreatedAt: [time] }
                    });
                } else {
                    sap.m.MessageToast.show("Navigation service not available outside Fiori Launchpad.");
                    console.warn("sap.ushell.Container is not available in this runtime environment.");
                }
            } catch (error) {
                sap.m.MessageToast.show("Navigation failed. Please try again later.");
                console.error("Error during navigation:", error);
            }
        }


    });
});