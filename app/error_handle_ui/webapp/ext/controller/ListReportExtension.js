sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function (MessageToast, Fragment) {
    'use strict';

    return {
        onEditPress_: async function (oEvent) {

            function isValidJSON(jSource_payload) {
                try {
                    JSON.parse(jSource_payload);
                    return true;
                } catch (e) {
                    return false;
                }
            }

            let aContexts = this.getSelectedContexts();
            if (aContexts.length > 1) {
                MessageToast.show("Please select one record.");
                return;
            }

            // var oSelectedRecord = aContexts[0].getObject().Source_payload
            await aContexts[0].requestProperty("Source_payload");

            let oSelectedRecord = aContexts[0].getProperty("Source_payload");
            console.log(oSelectedRecord);

            if (!this.oFragment) {
                try {
                    this.fragmentId = "customUpdateDialog";
                    this.oFragment = await Fragment.load({
                        id: this.fragmentId,
                        name: "com.app.errorhandleui.ext.fragments.update",
                        controller: this
                    });
                    if (this.addDependent) {
                        this.addDependent(this.oFragment);
                    }

                    this.oUpdateButton = this.oFragment.getBeginButton();
                    this.oCancelButton = this.oFragment.getEndButton();

                    // this.getView().byId("_IDGenTextArea").setValue(oSelectedRecord.Source_payload)
                    const oTextArea = Fragment.byId(this.fragmentId, "_IDGenTextArea");
                    if (oTextArea) {
                        if (isValidJSON(oSelectedRecord)) {
                            var oParsed = JSON.parse(oSelectedRecord);
                            oSelectedRecord = JSON.stringify(oParsed, null, 2)
                            oTextArea.setValue(oSelectedRecord);
                        } else {
                            // var oParsed = JSON.parse(oSelectedRecord);
                            // oSelectedRecord = JSON.stringify(oParsed, null, 2)
                            oTextArea.setValue(oSelectedRecord);
                        }
                    }
                    // Attach Cancel button press inline
                    const oCancelBtn = Fragment.byId(this.fragmentId, "_IDGenButton2");
                    if (oCancelBtn) {
                        oCancelBtn.attachPress(() => {
                            if (this.oFragment && this.oFragment.isOpen()) {
                                this.oFragment.close();
                                this.oFragment.destroy();
                                this.oFragment = null;
                            }
                        });
                    }

                    // Attach Update button press inline
                    const oUpdateBtn = Fragment.byId(this.fragmentId, "_IDGenButton1");
                    if (oUpdateBtn) {
                        oUpdateBtn.attachPress(async () => {
                            const payload = oTextArea.getValue(oSelectedRecord)
                            if (payload.length === 0) {
                                sap.m.MessageToast.show("You can not update null value");
                                return;
                            }

                            // if (isValidJSON(jSource_payload)) {
                            // const oModel = this.getOwnerComponent().getModel(); // OData V4 model
                            try {
                                const aContexts = this.getSelectedContexts();
                                if (!aContexts.length) {
                                    sap.m.MessageToast.show("Please select a record first");
                                    return;
                                }
                                const oContext = aContexts[0];
                                if (oContext.getObject().Status === "Success") {
                                    sap.m.MessageBox.error("Error in updating Source Payload : You can not update success records")
                                    return
                                }

                                // Get the ID from the context object (or pass explicitly if available)
                                // const sID = oContext.getObject().ID;
                                // const sPayload = oContext.getObject().Source_payload

                                oContext.setProperty("Source_payload", oTextArea.getValue());
                                sap.m.MessageBox.success("Source Payload updated successfully try to reprocess the updated payload");
                                this.oFragment.close();
                                this.oFragment.destroy();
                                this.oFragment = null;

                            } catch (error) {
                                sap.m.MessageBox.error("Failed to update." + error.message);
                            }

                            // } else {
                            //     MessageToast.show("Invalid JSON format.");
                            // }
                        });
                    }

                    this.oFragment.open();

                } catch (error) {
                    MessageToast.show("Failed to load fragment.");
                    console.error("Failed to load fragment: ", error);
                    return;
                }
            } else {
                this.oFragment.open();
            }

            // this.oFragment.setModel(this.getView().getModel());
        }
    };
});
