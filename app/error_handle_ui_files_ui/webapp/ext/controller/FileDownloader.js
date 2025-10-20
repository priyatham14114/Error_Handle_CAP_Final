sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    'use strict';

    return {
        onFileDownload: async function (oEvent) {

            const oContext = this.getBindingContext();
            const fileName = oContext.getProperty("PayloadFileName") || "downloaded_file";
            // const mimeType = oContext.getProperty("MIMEType") || "application/octet-stream";

            sap.m.MessageBox.confirm(`Do you want to download the file "${fileName}"?`, {
                actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                onClose: async (oAction) => {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                        try {
                            const sPath = oContext.getPath();
                            const sServiceUrl = this.getModel().sServiceUrl;
                            const sDownloadUrl = `${sServiceUrl}${sPath}/ErrorPayloadFile/$value`;

                            const response = await fetch(sDownloadUrl, {
                                method: "GET",
                                // headers: { "Accept": mimeType }
                            });

                            if (!response.ok) throw new Error("Failed to download file");

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = fileName;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            a.remove();

                            sap.m.MessageToast.show("File downloaded successfully!");
                        } catch (error) {
                            sap.m.MessageToast.show("File download failed."+ error.message);
                            console.error("Download error:", error);
                        }
                    }
                }
            });
        }
    };
});
