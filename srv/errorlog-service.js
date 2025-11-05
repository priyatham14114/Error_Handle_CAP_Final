// INPORTING FUNCTIONS FROM UTIL
const cds = require('@sap/cds');
const { onBeforeErrorLogSetCreate,
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
} = require("./controller/util.js");


module.exports = cds.service.impl(async function (srv) {

  // role Based Auth for complete srv
  srv.before('READ', ['ErrorLogSet', 'ErrorFilesSet'], onBeforeReadingLogs);

  srv.before(["CREATE"], "ErrorLogSet", onBeforeErrorLogSetCreate)   // BEFORE HANDLER FOR OPERATIONS BEFORE CREATION OF ErrorLogSet
  srv.before(["CREATE"], "ErrorFilesSet", onBeforeErrorFilesSetCreate) // BEFORE HANDLER FOR OPERATIONS BEFORE CREATION OF ErrorFilesSet
  srv.on(["reTrigger"], "ErrorLogSet", onReTriggerIflow) // ON HANDLER FOR TRIGGER IFLOW WITH PAYLOAD
  srv.on(["TriggerSFTP"], onTriggerSFTP) // ON HANDLER FOR TRIGGER IFLOW WITHOUT PAYLOAD (NOT USED IN APPLICATION)
  srv.on(["reTriggerFile"], onSendFileToCPI) // ON HANDLER FOR RE-TRIGGER FILE


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

  srv.on('getAppConfig', async (req) => {
    try {
      const path = process.env.UI_BASE_PATH || '';
      console.log('Fetched UI_BASE_PATH:', path);
      return path;
    } catch (error) {
      req.reject("Failed to read env");
    }
  });



});