const { executeHttpRequest } = require('@sap-cloud-sdk/http-client'); // an import to call destination
const { getDestination } = require('@sap-cloud-sdk/connectivity'); // an import to check destination exist or not
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');  // to convert the json to xml
const { Readable } = require('stream'); // to check the file format is stream or string (base64)
const { checkUserRoles, checkUserRolesKPIs } = require("../controller/auth.js");


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
            // req.data.ProcessDirectName = req.headers.ProcessDirectName
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
    const endPoint = '/http/SFTP_flow';
    var selectedId = req.params[0].ID;
    try {
        var result = await SELECT.one.from("ErrorLogSet").columns(['ID', 'Source_payload', 'NumberOfRetriggers', 'Status', 'ProcessDirectName']).where({ ID: selectedId });
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

        const response = await executeHttpRequest(destination, {
            method: 'POST',
            url: endPoint,
            data: result.Source_payload,
            headers: {
                'Content-Type': 'application/json',
                'Sender': 'CAP',
                'Accept': 'application/json',
                'CAP_ID': selectedId,
                'TransactionType': 'Reprocess',
                'Process Direct Name': result.ProcessDirectName
            }

        });

        if (response && response.status === 200) {
            await UPDATE("ErrorLogSet").set({ Status: "Success" }).where({ ID: selectedId });
            req.notify("Integration flow triggerd successfully See response")
            req.info(`Status:${JSON.stringify(response.status)} \n ResponseData:${JSON.stringify(response.data)}`)
            return {
                message: 'Integration flow triggered successfully',
                httpStatus: response.status,
                responseData: response.data
            };
        } else {
            req.reject(500, 'Something went wrong reprocess failed');
        }

    } catch (error) {
        console.error('HTTP Request Error:', error);
        // req.reject(`Cause:${JSON.stringify(error)}`);
        req.reject(500, 'Reprocess failed :' + error.message);

    }
}

// on handler for just triggering the integration flow IN FILE CASE
const onSendFileToCPI = async (req) => {
    try {
        var selectedId = req.params[0].ID;
        var result = await SELECT.one.from("ErrorFilesSet").columns(
            ['PayloadFileName',
                'ErrorPayloadFile',
                'NumberOfRetriggersofFile',
                'Status',
                'ProcessDirectName',
                'MIMEType']).where({ ID: selectedId });

        if (!result.ErrorPayloadFile) {
            req.info(404, 'No Content');
            return
        }
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
            headers: {
                'TransactionType': 'Reprocess',
                'Sender': 'CAP',
                'CAP_ID': selectedId,
                'Content-Type': result.MIMEType,
                'Accept': result.MIMEType,
                'ProcessDirectName': result.ProcessDirectName
            }



        });
        if (response && response.status === 200) {
            await UPDATE("ErrorFilesSet").set({ Status: "Success" }).where({ ID: selectedId });
            req.notify("Integration flow triggerd successfully See response")
            req.info(`Status:${JSON.stringify(response.status)} \n ResponseData: Response data hidden because it may contain large text`)
            return {
                message: 'Integration flow triggered successfully',
                httpStatus: response.status,
                responseData: response.data
            };
        } else {
            req.reject(500, 'Something went wrong reprocess failed');
        }

    } catch (error) {
        console.error('HTTP Request Error:', error.message);
        // req.reject(`Cause:${JSON.stringify(error)}`);
        req.info(500, 'Reprocess failed :' + error.message);

    }
};

const onReadCountForDonutLogs = async (req) => {

    const roles = await checkUserRolesKPIs(req);
    if (roles === null) {
        req.reject(403, 'Unauthorized');
        return;
    }

    let whereClause = {};

    if (!roles.includes('EHAdmin')) {
        whereClause = { Department: { in: roles } };
    }

    // for ErrorLogSet
    const logResult = await cds.run(
        SELECT.one.from('ErrorLogSet').columns([
            { xpr: ['count(*)'], as: 'total' },
            { xpr: ['sum(case when Status = ', { val: 'Success' }, ' then 1 else 0 end)'], as: 'success' },
            { xpr: ['sum(case when Status = ', { val: 'Failed' }, ' then 1 else 0 end)'], as: 'failed' },
            { xpr: ['sum(case when Status = ', { val: 'No retries yet' }, ' then 1 else 0 end)'], as: 'noretries' }
        ]).where(whereClause)
    );
    // Build the returned array 
    return [
        // ErrorLogSet KPIs
        { Identifier: 'TotalNoretries', Value: logResult?.noretries || 0 },
        { Identifier: 'TotalFailedErrors', Value: logResult?.failed || 0 },
        { Identifier: 'TotalSuccessErrors', Value: logResult?.success || 0 }
    ];
}


const onReadCountForDonutFiles = async (req) => {

    const roles = await checkUserRolesKPIs(req);
    if (roles === null) {
        req.reject(403, 'Unauthorized');
        return;
    }

    let whereClause = {};

    if (!roles.includes('EHAdmin')) {
        whereClause = { Department: { in: roles } };
    }

    // for ErrorFilesSet
    const fileResult = await cds.run(
        SELECT.one.from('ErrorFilesSet').columns([
            { xpr: ['count(*)'], as: 'total' },
            { xpr: ['sum(case when Status = ', { val: 'Success' }, ' then 1 else 0 end)'], as: 'success' },
            { xpr: ['sum(case when Status = ', { val: 'Failed' }, ' then 1 else 0 end)'], as: 'failed' },
            { xpr: ['sum(case when Status = ', { val: 'No retries yet' }, ' then 1 else 0 end)'], as: 'noretries' }
        ]).where(whereClause)
    );

    // Build the returned array with both sets
    return [

        // ErrorFilesSet KPIs
        { Identifier: 'TotalNoretries', Value: fileResult?.noretries || 0 },
        { Identifier: 'TotalFailedErrors', Value: fileResult?.failed || 0 },
        { Identifier: 'TotalSuccessErrors', Value: fileResult?.success || 0 }

    ];
};

const onDashboardKPIsLogs = async (req) => {
    const roles = await checkUserRolesKPIs(req);
    if (roles === null) {
        req.reject(403, 'Unauthorized');
        return;
    }

    let whereClause = {};

    if (!roles.includes('EHAdmin')) {
        whereClause = { Department: { in: roles } };
    }
    // ErrorLog counts
    const logs = await cds.run(
        SELECT.one.from('ErrorLogSet').columns([
            { xpr: ['count(*)'], as: 'total' },
            { xpr: ['sum(case when Status = ', { val: 'Success' }, ' then 1 else 0 end)'], as: 'success' },
            { xpr: ['sum(case when Status = ', { val: 'Failed' }, ' then 1 else 0 end)'], as: 'failed' },
            { xpr: ['sum(case when Status = ', { val: 'No retries yet' }, ' then 1 else 0 end)'], as: 'noretries' }
        ]).where(whereClause)
    );
    return {
        totalErrorLogCount: logs?.total || 0,
        totalSuccessErrors: logs?.success || 0,
        totalFailedErrors: logs?.failed || 0,
        totalNoretries: logs?.noretries || 0
    };

};

const onDashboardKPIsfiles = async (req) => {

    const roles = await checkUserRolesKPIs(req);
    if (roles === null) {
        req.reject(403, 'Unauthorized');
        return;
    }

    let whereClause = {};

    if (!roles.includes('EHAdmin')) {
        whereClause = { Department: { in: roles } };
    }

    // ErrorFiles counts
    const files = await cds.run(
        SELECT.one.from('ErrorFilesSet').columns([
            { xpr: ['count(*)'], as: 'total' },
            { xpr: ['sum(case when Status = ', { val: 'Success' }, ' then 1 else 0 end)'], as: 'successfiles' },
            { xpr: ['sum(case when Status = ', { val: 'Failed' }, ' then 1 else 0 end)'], as: 'failedfiles' },
            { xpr: ['sum(case when Status = ', { val: 'No retries yet' }, ' then 1 else 0 end)'], as: 'noretriesfiles' }
        ]).where(whereClause)
    );
    return {
        totalErrorFilesCount: files?.total || 0,
        totalFilesSuccess: files?.successfiles || 0,
        totalFilesFailed: files?.failedfiles || 0,
        totalFilesNoretrie: files?.noretriesfiles || 0
    };
}

const onGetRecentErrorLogs = async (req) => {
    const roles = await checkUserRolesKPIs(req);
    if (roles === null) {
        req.reject(403, 'Unauthorized');
        return;
    }

    let whereClause = {};

    if (!roles.includes('EHAdmin')) {
        whereClause = { Department: { in: roles } };
    }

    try {
        const result = await cds.run(SELECT.from('ErrorLogSet')
            .columns('ID',
                'iFlow_name',
                'createdAt',
                'Status',
                'Receiver_System').orderBy({ createdAt: 'desc' }).limit(10).where(whereClause));
        return result;
    } catch (err) {
        req.error(500, `Error fetching recent files: ${err.message}`);
    }
}
const onGetRecentErrorFiles = async (req) => {
    const roles = await checkUserRolesKPIs(req);
    if (roles === null) {
        req.reject(403, 'Unauthorized');
        return;
    }

    let whereClause = {};

    if (!roles.includes('EHAdmin')) {
        whereClause = { Department: { in: roles } };
    }
    try {

        const result = await cds.run(SELECT.from('ErrorFilesSet')
            .columns('ID',
                'iFlow_name',
                'createdAt',
                'Status',
                'Receiver_System').orderBy({ createdAt: 'desc' }).limit(10).where(whereClause));
        return result;
    } catch (err) {
        req.error(500, `Error fetching recent files: ${err.message}`);
    }
}

const onBeforeReadingLogs = async (req) => {
    const roles = await checkUserRoles(req);

    if (roles === null) {
        return;
    }

    if (roles.includes('EHAdmin')) {
        return;
    }

    if (roles.length > 0) {
        req.query.where({ Department: { in: roles } });
    }
}

const onGetDailyErrorCounts = async (req) => {
    const roles = await checkUserRolesKPIs(req);
    if (!roles) {
        req.reject(403, 'Unauthorized');
        return;
    }

    let whereClause = {}
    if (!roles.includes('EHAdmin')) {
        whereClause = { Department: { in: roles } };
    }

    const dailyCounts = await cds.run(
        SELECT.from('ErrorLogSet')
            .columns([
                { xpr: ['cast(createdAt as Date)'], as: 'errorDate' },
                { xpr: ['count(*)'], as: 'errorCount' },
                { xpr: ["sum(case when Status = 'Success' then 1 else 0 end)"], as: 'successCount' },
                { xpr: ["sum(case when Status = 'Failed' then 1 else 0 end)"], as: 'failedCount' },
                { xpr: ["sum(case when Status = 'No retries yet' then 1 else 0 end)"], as: 'noRetriesCount' }
            ])
            .groupBy('cast(createdAt as Date)')
            .orderBy('errorDate asc').where(whereClause)
    );
    return dailyCounts
};
const onGetFilesDailyErrorCounts = async (req) => {
    const roles = await checkUserRolesKPIs(req);
    if (!roles) {
        req.reject(403, 'Unauthorized');
        return;
    }

    let whereClause = {}
    if (!roles.includes('EHAdmin')) {
        whereClause = { Department: { in: roles } };
    }

    const dailyCounts = await cds.run(
        SELECT.from('ErrorFilesSet')
            .columns([
                { xpr: ['cast(createdAt as Date)'], as: 'errorDate' },
                { xpr: ['count(*)'], as: 'errorCount' },
                { xpr: ["sum(case when Status = 'Success' then 1 else 0 end)"], as: 'successCount' },
                { xpr: ["sum(case when Status = 'Failed' then 1 else 0 end)"], as: 'failedCount' },
                { xpr: ["sum(case when Status = 'No retries yet' then 1 else 0 end)"], as: 'noRetriesCount' }
            ])
            .groupBy('cast(createdAt as Date)')
            .orderBy('errorDate asc').where(whereClause)
    );
    return dailyCounts
};

const onGetErrorSummaryByFlow = async (req) => {

    const roles = await checkUserRolesKPIs(req);
    if (!roles) {
        req.reject(403, 'Unauthorized');
        return;
    }

    let whereClause = {};

    if (!roles.includes('EHAdmin')) {
        whereClause = { Department: { in: roles } };
    }

    const result = await cds.run(
        SELECT.from('ErrorLogSet')
            .columns([
                'iFlow_name',
                { xpr: ["sum(case when Status = 'No retries yet' then 1 else 0 end)"], as: 'NoRetries' },
                { xpr: ["sum(case when Status = 'Failed' then 1 else 0 end)"], as: 'Failed' },
                { xpr: ["sum(case when Status = 'Success' then 1 else 0 end)"], as: 'Success' },
                { xpr: ['count(ID)'], as: 'TotalErrors' }
            ])
            .where(whereClause)
            .groupBy('iFlow_name')
            .orderBy('iFlow_name asc')
    );

    return result;
}
const onGetFilesErrorSummaryByFlow = async (req) => {

    const roles = await checkUserRolesKPIs(req);
    if (!roles) {
        req.reject(403, 'Unauthorized');
        return;
    }

    let whereClause = {}

    if (!roles.includes('EHAdmin')) {
        whereClause = { Department: { in: roles } };
    }

    const result = await cds.run(
        SELECT.from('ErrorFilesSet')
            .columns([
                'iFlow_name',
                { xpr: ["sum(case when Status = 'No retries yet' then 1 else 0 end)"], as: 'NoRetries' },
                { xpr: ["sum(case when Status = 'Failed' then 1 else 0 end)"], as: 'Failed' },
                { xpr: ["sum(case when Status = 'Success' then 1 else 0 end)"], as: 'Success' },
                { xpr: ['count(ID)'], as: 'TotalErrors' }
            ])
            .where(whereClause)
            .groupBy('iFlow_name')
            .orderBy('iFlow_name asc')
    );

    return result;
}



// EXPORTING FUNCTIONS 
module.exports = {
    onBeforeErrorLogSetCreate,
    onReTriggerIflow,
    onBeforeErrorFilesSetCreate,
    onTriggerSFTP,
    onSendFileToCPI,
    onReadCountForDonutLogs,
    onReadCountForDonutFiles,
    onDashboardKPIsLogs,
    onDashboardKPIsfiles,
    onBeforeReadingLogs,
    onGetRecentErrorLogs,
    onGetRecentErrorFiles,
    onGetDailyErrorCounts,
    onGetFilesDailyErrorCounts,
    onGetErrorSummaryByFlow,
    onGetFilesErrorSummaryByFlow
};
