const { executeHttpRequest } = require('@sap-cloud-sdk/http-client'); // an import to call destination
const { getDestination } = require('@sap-cloud-sdk/connectivity'); // an import to check destination exist or not
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');  // to convert the json to xml
const { Readable } = require('stream'); // to check the file format is stream or string (base64)


// before handler for creation of flat payload ErrorLogSet
const onBeforeErrorLogSetCreate = async (req) => {
    try {
        // req.data.IsActiveEntity = true;
        req.data.NumberOfRetriggers = 0;
        req.data.Status = "No retries yet";
        if (req.data.Source_payload) {
            if (typeof req.data.Source_payload !== 'string') {
                req.data.Source_payload = JSON.stringify(req.data.Source_payload);
            }
        }

    } catch (error) {
        req.error(500, 'Error converting Source_payload to JSON: ' + error.message);
    }
}

// before handler for creation of file payload ErrorLogfilesSet
const onBeforeErrorFilesSetCreate = async (req) => {
    try {
        const content = req.data.ErrorPayloadFile;
        if ((content instanceof Readable)) {
            // return req.error(400, "Unsupported content type, binary stream expected");
            const chunks = [];
            for await (const chunk of content) {
                chunks.push(chunk);
            }
            req.data.NumberOfRetriggersofFile = 0;
            req.data.Status = "No retries yet";
            // req.data.MIMEType = req.headers.mimetype
           // req.data.FileName = req.headers.filename
            req.data.ErrorPayloadFile = Buffer.concat(chunks);

        } else {
            req.data.ErrorPayloadFile = null
            req.data.NumberOfRetriggersofFile = 0;
            req.data.Status = "No retries yet";
            req.data.ProcessDirectName = req.headers.ProcessDirectName
            // req.data.FileName = req.headers.filename
        }
    } catch (err) {
        console.error("Error reading file:", err.message);
        return req.error(500, "Failed to process file" + err.message);
    }
};

// on handler for just triggering the integration flow (no payload passing case)
// Note: button hidden coz no use
const onTriggerSFTP = async (req) => {
    const endPoint = '';  // no config endpoint
    try {
        const destination = await getDestination({
            destinationName: 'CPI_Destination'
        });
        if (destination) {
            destination.authTokens?.forEach(authToken => {
                if (authToken.error) {
                    throw new Error(`Error in authToken ${authToken.error}`);
                }
            });
        } else {
            throw new Error('Can not reach destination.');
        }

        const response = await executeHttpRequest(destination, {
            method: 'POST',
            url: endPoint,
            data: "",   //no payload is passing here
            headers: { 'TransactionType': 'Reprocess' }
            // 'Sender': 'CAP',
        });
        // req.notify("Integration flow triggerd successfully")
        // req.info(`Status:${JSON.stringify(response.status)}`)
        // console.log("response______"+ response)
        return { Status: JSON.stringify(response.status), Message: response.data };
    } catch (error) {
        console.error('HTTP Request Error:', error);
        // req.reject(`Cause:${JSON.stringify(error)}`);
        req.reject({ status: error.status, message: error.data });
        return { Status: error.status, Message: error.data };
    }
}

// on handler for triggering the integration flow with payload passing case CURRENTLY JSON ONLY
const onReTriggerIflow = async (req) => {
    const endPoint = '/http/purchase_order';
    var selectedId = req.params[0].ID;
    try {
        var result = await SELECT.one.from("ErrorLogSet").where({ ID: selectedId });
        if (result.Status === 'Success') {
            req.info(400, 'You can not retrigger success records');
            return
        }
        await UPDATE("ErrorLogSet").set({ NumberOfRetriggers: result.NumberOfRetriggers + 1, Status: "Failed" }).where({ ID: selectedId });
    } catch (error) {
        console.error(error.message)
        return req.info(500, 'Internal Server error occured')
    }

    try {
        const destination = await getDestination({
            destinationName: 'CPI_Destination'
        });
        if (destination) {
            destination.authTokens?.forEach(authToken => {
                if (authToken.error) {
                    throw new Error(`Error in authToken ${authToken.error}`);
                }
            });
        } else {
            throw new Error('Can not reach destination.');
        }
        // Last chnage (FOR XML DATA)
        // const builder = new XMLBuilder();
        // const xmlData = builder.build(JSON.parse(result.Source_payload));
        // const isXML = XMLValidator.validate(xmlData, { allowBooleanAttributes: true });

        // //         {
        // //   err: {
        // //     code: string;
        // //     msg: string,
        // //     line: number,
        // //     col: number
        // //   };
        // // }
        // req.notify("XML building completed" + isXML.err.code)
        // console.log("Generated XML" + isXML.err.msg)
        // req.info(500, 'Generated XML :' + xmlData);

        // const parser = new XMLParser();
        // // Convert XML to JSON
        // const jsonObj = parser.parse(result.Source_payload);
        // console.log(JSON.stringify(jsonObj))

        const response = await executeHttpRequest(destination, {
            method: 'POST',
            url: endPoint,
            data: result.Source_payload,
            headers: { 'Content-Type': 'application/json', 'Sender': 'CAP', 'Accept': 'application/json', 'CAP_ID' : selectedId , 'TransactionType': 'Reprocess', 'receiver': result.Receiver_System }
            // 'Sender': 'CAP',
        });
        const updateStatus = await UPDATE("ErrorLogSet").set({ Status: "Success" }).where({ ID: selectedId });
        req.notify("Integration flow triggerd successfully See response")
        req.info(`Status:${JSON.stringify(response.status)} \n ResponseData:${JSON.stringify(response.data)}`)
        return { 'HTTP request': response, 'SideEffects': updateStatus };
    } catch (error) {
        console.error('HTTP Request Error:', error);
        // req.reject(`Cause:${JSON.stringify(error)}`);
        req.info(500, 'Reprocess failed :' + error.message);

    }
}

// on handler for just triggering the integration flow IN FILE CASE
const onSendFileToCPI = async (req) => {
    try {
        var selectedId = req.params[0].ID;
        var result = await SELECT.one.from("ErrorFilesSet").columns(['PayloadFileName', 'ErrorPayloadFile', 'NumberOfRetriggersofFile', 'Status']).where({ ID: selectedId });
        if (result.Status === 'Success') {
            req.info(400, 'You can not retrigger success records');
            return
        }
        await UPDATE("ErrorFilesSet").set({ NumberOfRetriggersofFile: result.NumberOfRetriggersofFile + 1, Status: "Failed" }).where({ ID: selectedId });
        if (!result.ErrorPayloadFile) return req.info(404, 'File content empty');
        // var mimeType = result.MIMEType || 'application/octet-stream';
    } catch (error) {
        console.error('HTTP Request Error:', error);
        // req.reject(`Cause:${JSON.stringify(error)}`);
        return req.info(500, `Failed to read selected record: ${error.message}`);

    }
    try {
        const endPoint = '/http/SFTP_flow';
        const destination = await getDestination({ destinationName: 'CPI_Destination' });
        if (destination) {
            destination.authTokens?.forEach(authToken => {
                if (authToken.error) {
                    throw new Error(`Error in authToken ${authToken.error}`);
                }
            });
        } else {
            throw new Error('Can not reach destination.');
        }
        const response = await executeHttpRequest(destination, {
            method: 'POST',
            url: endPoint,
            data: result.ErrorPayloadFile,
            headers: { 'TransactionType': 'Reprocess', 'Sender': 'CAP' }

        });
        // 'Sender': 'CAP',
        const updateStatus = await UPDATE("ErrorFilesSet").set({ Status: "Success" }).where({ ID: selectedId });
        req.notify("Integration flow triggerd successfully See response")
        req.info(`Status:${JSON.stringify(response.status)} \n ResponseData: Response data hidden because it may contain large text`)
        return response

    } catch (error) {
        console.error('HTTP Request Error:', error.message);
        // req.reject(`Cause:${JSON.stringify(error)}`);
        req.info(500, 'Reprocess failed :' + error.message);

    }
};

const onReadCount= async () => {
        const result = await cds.run(
            SELECT.one.from('ErrorLogSet').columns([
                { xpr: ['count(*)'], as: 'total' },
                { xpr: ['sum(case when Status = ', { val: 'Success' }, ' then 1 else 0 end)'], as: 'success' },
                { xpr: ['sum(case when Status = ', { val: 'Failed' }, ' then 1 else 0 end)'], as: 'failed' },
                { xpr: ['sum(case when Status = ', { val: 'No retries yet' }, ' then 1 else 0 end)'], as: 'noretries' }
            ])
        );

        return [
            { Identifier: 'TotalErrors', Value: result.total },
            { Identifier: 'TotalSuccessErrors', Value: result.success },
            { Identifier: 'TotalFailedErrors', Value: result.failed },
            { Identifier: 'TotalNoretries', Value: result.noretries }
        ];
    }
// EXPORTING FUNCTIONS 
module.exports = {
    onBeforeErrorLogSetCreate,
    onReTriggerIflow,
    onBeforeErrorFilesSetCreate,
    onTriggerSFTP,
    onSendFileToCPI,
    onReadCount
};
