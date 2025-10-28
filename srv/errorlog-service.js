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
  onBeforeReadingFiles
} = require("./controller/util.js");


module.exports = cds.service.impl(async function (srv) {
  srv.before('READ', 'ErrorLogSet', onBeforeReadingLogs);
  srv.before('READ', 'ErrorFilesSet', onBeforeReadingFiles);
  srv.before(["CREATE"], "ErrorLogSet", onBeforeErrorLogSetCreate)   // BEFORE HANDLER FOR OPERATIONS BEFORE CREATION OF ErrorLogSet
  srv.before(["CREATE"], "ErrorFilesSet", onBeforeErrorFilesSetCreate) // BEFORE HANDLER FOR OPERATIONS BEFORE CREATION OF ErrorFilesSet
  srv.on(["reTrigger"], "ErrorLogSet", onReTriggerIflow) // ON HANDLER FOR TRIGGER IFLOW WITH PAYLOAD
  srv.on(["TriggerSFTP"], onTriggerSFTP) // ON HANDLER FOR TRIGGER IFLOW WITHOUT PAYLOAD (NOT USED IN APPLICATION)
  srv.on(["reTriggerFile"], onSendFileToCPI) // ON HANDLER FOR RE-TRIGGER FILE
  srv.on('countErrorsDonutLogs', onReadCountForDonutLogs);
  srv.on('countErrorsDonutFiles', onReadCountForDonutFiles);
  srv.on('dashboardKPIsLogs', onDashboardKPIsLogs);
  srv.on('dashboardKPIsFiles', onDashboardKPIsfiles);
  srv.on('recentErrorLogs', onGetRecentErrorLogs);
  srv.on('recentErrorFiles', onGetRecentErrorFiles);

  srv.on('getAppConfig', async () => {
    return {
      UIbasePath: process.env.UI_BASE_PATH || ''
    };
  });

});