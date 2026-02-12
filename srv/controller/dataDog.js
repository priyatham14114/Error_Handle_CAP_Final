const { executeHttpRequest } = require('@sap-cloud-sdk/http-client'); // an import to call destination
const { getDestination } = require('@sap-cloud-sdk/connectivity'); // an import to check destination exist or not

const sendLogToDD = async (req, Status) => {

    const destination = await getDestination({ destinationName: "DDDest" });

    // console.log("APIKEY___" + destination.originalProperties.APIKEY)

    if (!destination) {
        throw new Error("Could not reach Datadog destination");
    }

    const response = await executeHttpRequest(destination, {
        method: "POST",
        url: "",
        data: {
            "ddsource": "BTP-CAP",
            "ddtags": "REPROX",
            "environment": "Dev",
            "hostname": "NA",
            "bot_runner_machine": "AZR-EUS2W7155",
            "botid": "botidd40",
            "platform": "BTP REPROX APP",
            "event": {
                "correlations": {
                    "correlationId": "NA",
                    "businessId": "NA"
                },
                "additionalProperties": {
                    "Destination": "NA"
                }
            },
            "primarytask": "NA",
            "subtaskname": "NA",
            "status": "",
            "message": "",
            "exception_type": "",
            "exception_description": "",
            "auditLog":{
                "user":req.user,
                "timeStamp": new Date().toISOString(),  // for audit purpose 
                "reprox_id":req.params[0].ID,
                "Status":Status                
            }
        },
        headers: {
            "Content-Type": "application/json",
            "DD-API-KEY":destination.originalProperties.DD-API-KEY
        }
    });
}

module.exports = {
    sendLogToDD
}
