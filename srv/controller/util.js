const { executeHttpRequest } = require('@sap-cloud-sdk/http-client'); // an import to call destination
const { getDestination } = require('@sap-cloud-sdk/connectivity'); // an import to check destination exist or not
const { XMLParser, XMLBuilder, XMLValIDator } = require('fast-xml-parser');  // to convert the json to xml
const { Readable } = require('stream'); // to check the file format is stream or string (base64)
const { checkUserRoles, checkUserRolesKPIs } = require("../controller/auth.js");
// const { sendLogToDD } = require("../controller/dataDog.js");


// before handler for creation of flat payload ErrorLogSet
const onBeforeErrorLogSetCreate = async (req) => {
    try {
        req.data.NumberOfRetriggers = 0;
        req.data.Status = req.data.Status || "No retries yet";
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
            req.data.Status = req.data.Status || "No retries yet";
            req.data.ErrorPayloadFile = Buffer.concat(chunks);

        } else {
            req.data.ErrorPayloadFile = null
            req.data.NumberOfRetriggersofFile = 0;
            req.data.Status = req.data.Status || "No retries yet";
        }
    } catch (err) {
        console.error("Error reading file:", err.message);
        return req.error(500, "Failed to process file" + err.message);
    }
};

// on handler for triggering the integration flow with payload passing case CURRENTLY JSON ONLY
const onReTriggerIflow = async (req) => {

    const selectedID = req.params[0].ID;

    try {

        const record = await SELECT.one.from("ErrorLogSet")
            .columns(['ID', 'Source_payload', 'Status', 'NumberOfRetriggers'])
            .where({ ID: selectedID });

        if (!record) {
            return req.error(404, "Record not found");
        }

        if (record.Status === 'Success') {
            return req.info(400, "You cannot reprocess Success records");
        }

        const tx = cds.tx();

        const updated = await tx.run(
            UPDATE("ErrorLogSet").set({
                Status: "Reprocessing",
                NumberOfRetriggers: { '+=': 1 }
            }).where({
                ID: selectedID,
                Status: { '!=': "Reprocessing" }
            })
        );

        await tx.commit();

        if (updated === 0) {
            const existing = await SELECT.one.from("ErrorLogSet")
                .columns(['modifiedBy'])
                .where({ ID: selectedID });

            return req.info(409, `Reprocessing already in progress by user ${existing.modifiedBy}`);
        }

        const destination = await getDestination({ destinationName: "CPI_Destination" });

        console.log("APIKEY___" + destination.originalProperties.destinationConfiguration.APIKEY)

        if (!destination) {
            throw new Error("Could not reach CPI destination");
        }
        console.log("PAYLOAD__\n" + record.Source_payload)
        const response = await executeHttpRequest(destination, {
            method: "POST",
            url: "/http/s4payload",
            data: record.Source_payload,
            headers: {
                "Content-Type": "application/xml",  // Should be dynamic based on kind of data sending
                "Sender": "CAP",
                "CAP_ID": selectedID,
                "TransactionType": "Reprocess"
            }
        });

        const allowedCodes = [200, 201, 202, 204];
        if (response && allowedCodes.includes(response.status)) {
            const tx2 = cds.tx();
            await tx2.run(
                UPDATE("ErrorLogSet")
                    .set({ Status: "Success" })
                    .where({ ID: selectedID })
            );
            await tx2.commit();
            req.notify("Integration Flow triggered successfully");
            req.info(200, `Message processing completed See response text below \n Response: ${response.data}`);
            //    TEST
            // const ddResp = await sendLogToDD(req, response.status)
            // console.log("ddResp__ " + ddResp)
            // test
            return {
                message: "IFlow executed successfully",
                httpStatus: response.status,
                responseData: response.data
            };
        }
    } catch (error) {
        console.error("Reprocess Error:", error);
        const tx3 = cds.tx();
        await tx3.run(
            UPDATE("ErrorLogSet")
                .set({ Status: "Failed" })
                .where({ ID: selectedID })
        );
        await tx3.commit();
        //    TEST
        // const ddResp = await sendLogToDD(req, "Failed")
        // console.log("ddResp__ " + ddResp)
        // test
        req.reject(500, `Reprocess failed please check the updated error details \n ${error.message}`);
        return { Status: 500, message: error.message, }
    }
};

// on handler for just triggering the integration flow IN FILE CASE

const onSendFileToCPI = async (req) => {

    const selectedID = req.params[0].ID;

    try {
        const record = await SELECT.one.from("ErrorFilesSet")
            .columns([
                'PayloadFileName',
                'ErrorPayloadFile',
                'NumberOfRetriggersofFile',
                'Status',
                'ProcessDirectName',
                'ReqHeaders',
                'MIMEType'
            ])
            .where({ ID: selectedID });

        if (!record) {
            return req.info(404, "Record not found");
        }

        if (record.Status === "Success") {
            return req.info(400, "You cannot reprocess Success records");
        }

        const tx = cds.tx();
        const updated = await tx.run(
            UPDATE("ErrorFilesSet")
                .set({
                    Status: "Reprocessing",
                    NumberOfRetriggersofFile: { "+=": 1 }
                })
                .where({
                    ID: selectedID,
                    Status: { '!=': "Reprocessing" }
                })
        );

        await tx.commit();

        if (updated === 0) {
            const existing = await SELECT.one.from("ErrorFilesSet")
                .columns(['modifiedBy'])
                .where({ ID: selectedID });

            return req.info(
                409,
                `Reprocessing already in progress by user ${existing?.modifiedBy}`
            );
        }

        const destination = await getDestination({
            destinationName: "CPI_Destination"
        });

        if (!destination) {
            throw new Error("Cannot reach CPI destination.");
        }

        destination.authTokens?.forEach(token => {
            if (token.error) {
                throw new Error(`Auth token error: ${token.error}`);
            }
        });

        const defaultHeaders = {
            "TransactionType": "Reprocess",
            "Sender": "CAP",
            "CAP_ID": selectedID,
            "Content-Type": record.MIMEType,
            "Accept": record.MIMEType,
            "ProcessDirectName": record.ProcessDirectName
        };

        const dynamicHeaders =
            typeof record.ReqHeaders === "string"
                ? JSON.parse(record.ReqHeaders)
                : {};

        const allHeaders = { ...defaultHeaders, ...dynamicHeaders };
        const response = await executeHttpRequest(destination, {
            method: "POST",
            url: "/http/SFTPFlow",
            data: record.ErrorPayloadFile,
            headers: allHeaders
        });

        const allowed = [200, 201, 202, 204];
        if (response && allowed.includes(response.status)) {
            const tx2 = cds.tx();
            await tx2.run(
                UPDATE("ErrorFilesSet")
                    .set({ Status: "Success" })
                    .where({ ID: selectedID })
            );
            await tx2.commit();

            req.notify("Integration Flow triggered successfully.");
            req.info(200, `Message processing completed See response text below \n Response: Hidden`);
            return {
                message: "File reprocessing triggered successfully",
                httpStatus: response.status,
                responseData: 'Hidden'
            };
        }

    } catch (error) {

        console.error("Reprocess Error:", error.message);
        const txErr = cds.tx();
        await txErr.run(
            UPDATE("ErrorFilesSet")
                .set({ Status: "Failed" })
                .where({ ID: selectedID })
        );
        await txErr.commit();

        return req.info(
            500,
            "Reprocess failed check updated error details.\n" + error.message
        );
    }
};


// on handler for just triggering the integration flow IN FILE CASE

// const onSendFileToCPI = async (req) => {
//     let result;
//     let selectedID
//     try {
//         selectedID = req.params[0].ID;

//         result = await SELECT.one.from("ErrorFilesSet").columns(
//             ['PayloadFileName', 'ErrorPayloadFile', 'NumberOfRetriggersofFile', 'Status',
//                 'ProcessDirectName', 'ReqHeaders', 'MIMEType', 'modifiedAt']
//         ).where({ ID: selectedID });

//         if (!result) {
//             req.info(404, 'Record not found');
//             return;
//         }

//         if (result.Status === 'Success') {
//             req.info(400, 'You cannot retrigger success records');
//             return;
//         }

//         const lock = await UPDATE("ErrorFilesSet")
//             .set({ NumberOfRetriggersofFile: { '+=': 1 }, Status: "Reprocessing" })
//             .where({ ID: selectedID, Status: { '!=': 'Reprocessing' }, modifiedAt: result.modifiedAt });

//         // If no rows updated, either locked or modified concurrently
//         if (lock === 0) {

//             const existing = await SELECT.one.from("ErrorFilesSet").columns('modifiedBy').where({ ID: selectedID });
//             return req.info(409, `Reprocessing already in progress by user ${existing.modifiedBy}`);

//         }

//     } catch (error) {
//         console.error('HTTP Request Error:', error);
//         req.info(500, `Failed to read selected record: ${error.message}`);
//         return;
//     }

//     try {
//         const endPoint = '/http/s4payload';
//         const destination = await getDestination({ destinationName: 'CPI_Destination' });
//         if (!destination) {
//             throw new Error('Cannot reach destination.');
//         }

//         destination.authTokens?.forEach(authToken => {
//             if (authToken.error) {
//                 throw new Error(`Error in authToken ${authToken.error}`);
//             }
//         });

//         const Headers_1 = {
//             'TransactionType': 'Reprocess',
//             'Sender': 'CAP',
//             'CAP_ID': req.params[0].ID,
//             'Content-Type': result.MIMEType,
//             'Accept': result.MIMEType,
//             'ProcessDirectName': result.ProcessDirectName
//         };
//         const Headers_2 = typeof result.ReqHeaders === 'string' ? JSON.parse(result.ReqHeaders) : {};
//         const allHeaders = { ...Headers_1, ...Headers_2 };

//         const response = await executeHttpRequest(destination, {
//             method: 'POST',
//             url: endPoint,
//             data: result.ErrorPayloadFile,
//             headers: allHeaders,
//         });

//         if (response && response.status === 200) {
//             await UPDATE("ErrorFilesSet").set({ Status: "Success" }).where({ ID: selectedID });
//             req.notify("Integration flow triggered successfully. See response.");
//             req.info(`Status: ${response.status} \nResponse data Hidden due to size.`);
//             return {
//                 message: 'Integration flow triggered successfully',
//                 httpStatus: response.status,
//                 responseData: response.data
//             };
//         } else {
//             req.info(500, 'Something went wrong');
//         }

//     } catch (error) {
//         console.error('HTTP Request Error:', error.message);
//         console.log('HTTP Request Error:', error.message);
//         try {
//             if (req.params && req.params[0] && req.params[0].ID) {
//                 await UPDATE("ErrorFilesSet").set({ Status: "Failed" }).where({ ID: req.params[0].ID });
//             }
//         } catch (updateError) {
//             console.error('Failed to update status after error:', updateError.message);
//             req.info(500, 'Failed to update status after error: ' + updateError.message);
//         }
//         req.info(500, 'Reprocess failed check the updated error details and try again. \n' + error.message);
//         return;
//     }
// };



// const onSendFileToCPI = async (req) => {
//     try {
//         var selectedID = req.params[0].ID;
//         var result = await SELECT.one.from("ErrorFilesSet").columns(
//             ['PayloadFileName',
//                 'ErrorPayloadFile',
//                 'NumberOfRetriggersofFile',
//                 'Status',
//                 'ProcessDirectName',
//                 'MIMEType']).where({ ID: selectedID });

//         // if (!result.ErrorPayloadFile) return req.info(404, 'File content empty');

//         if (result.Status === 'Success') {
//             req.info(400, 'You can not retrigger success records');
//             return
//         }
//         await UPDATE("ErrorFilesSet").set({ NumberOfRetriggersofFile: result.NumberOfRetriggersofFile + 1, Status: "Failed" }).where({ ID: selectedID });
//     } catch (error) {
//         console.error('HTTP Request Error:', error);
//         // req.reject(`Cause:${JSON.stringify(error)}`);
//         return req.info(500, `Failed to read selected record: ${error.message}`);

//     }
//     try {
//         const endPoint = '/http/s4payload';
//         const destination = await getDestination({ destinationName: 'CPI_Destination' });
//         if (destination) {
//             destination.authTokens?.forEach(authToken => {
//                 if (authToken.error) {
//                     throw new Error(`Error in authToken ${authToken.error}`);
//                 }
//             });
//         } else {
//             throw new Error('Can not reach destination.');
//         }
//         const response = await executeHttpRequest(destination, {
//             method: 'POST',
//             url: endPoint,
//             data: result.ErrorPayloadFile,
//             headers: {
//                 'TransactionType': 'Reprocess',
//                 'Sender': 'CAP',
//                 'CAP_ID': selectedID,
//                 'Content-Type': result.MIMEType,
//                 'Accept': result.MIMEType,
//                 'ProcessDirectName': result.ProcessDirectName
//             }

//         });
//         const allowedCodes = [200, 201, 202, 204]
//         if (response && allowedCodes.includes(response.status)) {
//             await UPDATE("ErrorFilesSet").set({ Status: "Success" }).where({ ID: selectedID });
//             req.notify("Integration flow triggerd successfully See response")
//             req.info(`Status:${JSON.stringify(response.status)} \n ResponseData: Response data Hidden because it may contain large text`)
//             return {
//                 message: 'Integration flow triggered successfully',
//                 httpStatus: response.status,
//                 responseData: response.data
//             };
//         } else {
//             req.reject(500, 'Something went wrong reprocess failed');
//         }

//     } catch (error) {
//         console.error('HTTP Request Error:', error.message);
//         // req.reject(`Cause:${JSON.stringify(error)}`);
//         req.info(500, 'Reprocess failed :' + error.message);

//     }
// };

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

const onUpdateErrorLogSet = async (req) => {
    try {
        const { ID } = req.data;
        const result = await cds.tx(req).run(
            UPDATE("ErrorLogSet").set(req.data).where({ ID })
        );
        if (!result || result === 0) {
            req.error(404, `Record with ID ${ID} not found`);
            return; // Error is passed up to CAP framework
        }
        return { status: "updated", statusCode: 200, message: "Record updated successfully", location: ID };
    } catch (error) {
        req.error(500, `Update failed: ${error.message}`);
        return;
    }
};


const onUpdateErrorFilesSet = async (req) => {
    try {
        let response = await cds.tx(req).run(
            UPDATE("ErrorFilesSet").set(req.data).where({ ID: req.data.ID })
        );
        if (!response) {
            return req.res.status(404).json({
                status: "Not found",
                message: `Record with ID ${req.data.ID} not found`
            });
        }

        req.res.status(200).json({
            statusCode: 200,
            status: "updated",
            message: "Record updated successfully",
            location: req.data.ID
        });
        return { status: "updated", statusCode: 200, message: "Record updated successfully", location: req.data.ID };

    } catch (error) {
        console.log()
        req.res.status(500).json({ error: error.message });
    }
};





// EXPORTING FUNCTIONS 
module.exports = {
    onBeforeErrorLogSetCreate,
    onReTriggerIflow,
    onBeforeErrorFilesSetCreate,
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
    onGetFilesErrorSummaryByFlow,
    onUpdateErrorLogSet,
    onUpdateErrorFilesSet
};
