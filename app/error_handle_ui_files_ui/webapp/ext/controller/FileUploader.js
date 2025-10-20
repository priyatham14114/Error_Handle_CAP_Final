sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    'use strict';

    return {
        onUploadfile: function (oEvent) {

            const oFileInput = document.createElement("input");
            oFileInput.type = "file";

            oFileInput.onchange = () => {
                const file = oFileInput.files[0];
                if (!file) {
                    return;
                }

                new sap.m.MessageBox.warning(`Do you want to upload file "${file.name}"? uploading new file will override the existing file`, {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: (oAction) => {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            console.log(`Uploading file: ${file.name}, MIME type: ${file.type}`);

                            const reader = new FileReader();
                            reader.onload = async (e) => {
                                const arrayBuffer = e.target.result;

                                var oContext = this.getBindingContext();
                                const sPath = oContext.getPath();
                                const sServiceUrl = this.getModel().sServiceUrl;
                                const sUploadUrl = `${sServiceUrl}${sPath}/ErrorPayloadFile/$value`;

                                try {
                                    sap.ui.core.BusyIndicator.show(0);
                                    const upload = await fetch(sUploadUrl, {
                                        method: "PUT",
                                        headers: {
                                            "Content-Type": file.type
                                            // "Accept": "application/json"
                                        },
                                        body: arrayBuffer
                                    })
                                    if (upload.ok) {
                                        oContext.setProperty("PayloadFileName", file.name)
                                        oContext.setProperty("MIMEType", file.type)
                                        sap.ui.core.BusyIndicator.hide();
                                        this.getModel().refresh
                                        MessageToast.show("File uploaded successfully!");
                                    } else {
                                        MessageToast.show("Uploading file is aborted");
                                        return
                                    }

                                } catch (error) {
                                    MessageToast.show("Upload error please refresh the page and try again");
                                    console.error("Upload error:", error);
                                } finally {
                                    sap.ui.core.BusyIndicator.hide();
                                }
                            };
                            reader.readAsArrayBuffer(file);
                        }
                    }
                });
            };
            // Trigger native file picker dialog
            oFileInput.click();
        }
    };
});
