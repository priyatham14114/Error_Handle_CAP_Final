sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    'use strict';

    return {

        onMergeDownload: async function () {

            const contexts = this.getSelectedContexts();

            if (!contexts.length) {
                sap.m.MessageToast.show("Please select at least one record.");
                return;
            }

            // Show busy indicator while merge is happening
            sap.ui.core.BusyIndicator.show(0);

            try {

                const ids = contexts.map(context => context.getObject().ID);

                const oModel = this.getModel();

                const oAction = oModel.bindContext("/downloadMergedErrorDetails(...)");

                oAction.setParameter("fileIds", ids);

                await oAction.execute();

                const result = oAction.getBoundContext().getObject();

                // Handle different CAP return formats
                const bytes =
                    result?.value?.data ??
                    result?.value ??
                    result?.data;

                if (!bytes) {
                    throw new Error("No file data received from backend.");
                }

                const byteArray =
                    bytes instanceof Uint8Array
                        ? bytes
                        : new Uint8Array(bytes);

                // Create CSV Blob
                const blob = new Blob(
                    [byteArray],
                    {
                        type: "text/csv;charset=utf-8"
                    }
                );

                // Generate timestamped filename
                const timestamp = new Date()
                    .toISOString()
                    .replace(/[:.]/g, "-");

                const fileName = `MergedErrorDetails_${timestamp}.csv`;

                const downloadUrl = URL.createObjectURL(blob);

                const link = document.createElement("a");

                link.href = downloadUrl;
                link.download = fileName;

                document.body.appendChild(link);

                link.click();

                document.body.removeChild(link);

                URL.revokeObjectURL(downloadUrl);

                sap.m.MessageToast.show("Merged CSV downloaded successfully.");

            } catch (error) {

                console.error(error);

                sap.m.MessageBox.error(
                    error.message || "Failed to download merged CSV."
                );

            } finally {

                // Always hide busy indicator
                sap.ui.core.BusyIndicator.hide();

            }

        }

        // onMergeDownload: async function (oEvent) {

        //     const contexts = this.getSelectedContexts();

        //     if (!contexts.length) {
        //         sap.m.MessageToast.show("Please select at least one record.");
        //         return;
        //     }

        //     const ids = contexts.map(c => c.getObject().ID);

        //     const oModel = this.getModel();

        //     const oAction = oModel.bindContext("/downloadMergedErrorDetails(...)");

        //     oAction.setParameter("fileIds", ids);

        //     await oAction.execute();

        //     const result = oAction.getBoundContext().getObject();
        //     sap.m.MessageToast.show("Backend call success")
        //     // console.log(result);


        //     const bytes = result?.value?.data || result?.value || result?.data;
        //     const byteArray = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

        //     const blob = new Blob([byteArray], {
        //         type: "application/octet-stream"
        //     });

        //     const url = URL.createObjectURL(blob);
        //     const a = document.createElement("a");
        //     a.href = url;
        //     a.download = "MergedErrorDetails.csv"; // change name if needed
        //     document.body.appendChild(a);
        //     a.click();
        //     a.remove();
        //     URL.revokeObjectURL(url);

        // }
    }
})