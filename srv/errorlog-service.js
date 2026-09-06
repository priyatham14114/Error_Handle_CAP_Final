// IMPORTING FUNCTIONS FROM UTIL
const cds = require('@sap/cds');
const { onBeforeErrorLogSetCreate,
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
  onUpdateErrorFilesSet,
  onGetIFlowKPI,
  onDownloadMergedErrorDetails,
  // onAutoReProx,
  onAfterErrorLogSetCreate
} = require("./controller/util.js");


module.exports = cds.service.impl(async function (srv) {

  // role Based Auth for complete srv
  srv.before('READ', ['ErrorLogSet', 'ErrorFilesSet'], onBeforeReadingLogs);

  srv.before(["CREATE"], "ErrorLogSet", onBeforeErrorLogSetCreate)   // BEFORE HANDLER FOR OPERATIONS BEFORE CREATION OF ErrorLogSet
  srv.before(["CREATE"], "ErrorFilesSet", onBeforeErrorFilesSetCreate) // BEFORE HANDLER FOR OPERATIONS BEFORE CREATION OF ErrorFilesSet

  // srv.after(["CREATE"], "ErrorLogSet", onAfterErrorLogSetCreate) // BEFORE HANDLER FOR OPERATIONS BEFORE CREATION OF ErrorFilesSet

    srv.after('CREATE', 'ErrorLogSet', async (data, req) => {
        await onAfterErrorLogSetCreate(srv, data, req);
    });

  srv.on(["reTrigger"], onReTriggerIflow) // ON HANDLER FOR TRIGGER IFLOW WITH PAYLOAD
  srv.on(["reTriggerFile"], onSendFileToCPI) // ON HANDLER FOR RE-TRIGGER FILE
  srv.on("UPDATE", "ErrorLogSet", onUpdateErrorLogSet);
  srv.on("UPDATE", "ErrorFilesSet", onUpdateErrorFilesSet);
  srv.on("downloadMergedErrorDetails", onDownloadMergedErrorDetails);
  // srv.on("autoReProx", onAutoReProx);


  // All Overview poage KPIs
  srv.on('countErrorsDonutLogs', onReadCountForDonutLogs);
  srv.on('countErrorsDonutFiles', onReadCountForDonutFiles);
  srv.on('dashboardKPIsLogs', onDashboardKPIsLogs);
  srv.on('dashboardKPIsFiles', onDashboardKPIsfiles);
  srv.on('recentErrorLogs', onGetRecentErrorLogs);
  srv.on('recentErrorFiles', onGetRecentErrorFiles);
  srv.on('getDailyErrorCounts', onGetDailyErrorCounts);
  srv.on('getErrorSummaryByFlow', onGetErrorSummaryByFlow);
  srv.on('getFilesDailyErrorCounts', onGetFilesDailyErrorCounts);
  srv.on('getFilesErrorSummaryByFlow', onGetFilesErrorSummaryByFlow);
  srv.on('getIFlowKPI', onGetIFlowKPI);

  srv.on('getAppConfig', async (req) => {
    try {
      const path = process.env.UI_BASE_PATH || '';
      console.log('Fetched UI_BASE_PATH:', path);
      return path;
    } catch (error) {
      req.reject("Failed to read env");
    }
  });

  srv.after('READ', ['ErrorLogSet', 'ErrorFilesSet'], async(each) => {
    each.StatusCriticality =
      each.Status === 'Success' ? 3 :
        each.Status === 'Failed' ? 1 :
          each.Status === 'No retries yet' ? 2 : 
          each.Status === 'Reprocessing' ? 0 : 0;
// // test
//         await srv.schedule("autoReProx").after('2min')
//         console.log("auto reprocess triggered.......... wait 2 min")

// // test

  });


});