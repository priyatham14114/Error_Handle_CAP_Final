sap.ui.define([
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (MessageToast, MessageBox) {
    'use strict';

    return {
        OnTriggerSFTP: function (oEvent) {
            
            MessageBox.confirm(
                "Are you sure you want to trigger the SFTP server?", 
                {
                    title: "Confirm Action",
                    onClose: function(oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            var oModel = this.getModel();
                            var oActionBinding = oModel.bindContext("/TriggerSFTP(...)");
                            
                            oActionBinding.execute().then(function () {
                                var oResponse = oActionBinding.getBoundContext().getObject();
                                MessageBox.success("SFTP Response: \n" + "Message: " + JSON.stringify(oResponse.Message) +  "\nStatus: " + JSON.stringify(oResponse.Status));
                                console.log("Action Response:", oResponse);
                                MessageToast.show("SFTP Triggered successfully!");
                            }).catch(function (oError) {
                                MessageToast.show("Action failed: " + oError.message);
                                console.error(oError);
                            });
                        }
                    }.bind(this)
                }
            );
        }
    };
});
