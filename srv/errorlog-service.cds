using CPI_errordetails_schema as E_Schema from '../db/schema';
// using CPI_errordetails_schema_Views as E_Schema_view from '../db/views';
using {reusable.types as types} from './reusableTypes';

// @requires: 'authenticated-user'
service CatalogService {

  action   TriggerSFTP()                returns {
    Status  : String;
    Message : LargeString;
  };

      @UI.UpdateHidden   : false
  entity ErrorLogSet   as projection on E_Schema.ErrorLogSet
    actions {

      @Common.SideEffects: [{TargetEntities: ['ErrorLogSet']}]
      action reTrigger();
    }

  entity ErrorFilesSet as projection on E_Schema.ErrorFilesSet
    actions {
      action reTriggerFile()
    }

  // function fileErrorsCount() returns array of ErrorCountType;

  // // VIEW for date wise count
  // entity DailyErrorCounts        as projection on E_Schema_view.DailyErrorCounts;
  // entity FilesDailyErrorCounts   as projection on E_Schema_view.FilesDailyErrorCounts;
  // entity ErrorSummarybyFlow      as projection on E_Schema_view.ErrorSummarybyFlow;
  // entity FilesErrorSummarybyFlow as projection on E_Schema_view.FilesErrorSummarybyFlow;


  @readonly
  function getAppConfig()               returns {
    UIbasePath : String;
  };

  // Logs cards
  function dashboardKPIsLogs()          returns types.dashboardKPIType;
  function countErrorsDonutLogs()       returns many types.ErrorCountDonutType;
  function recentErrorLogs()            returns many types.recentLog;
  function getDailyErrorCounts()        returns many types.count_ByDate;
  function getFilesDailyErrorCounts()   returns many types.count_ByDate;

  // files cards
  function dashboardKPIsFiles()         returns types.dashboardKPIType;
  function countErrorsDonutFiles()      returns many types.ErrorCountDonutType;
  function recentErrorFiles()           returns many types.recentLog;
  function getErrorSummaryByFlow()      returns many types.flowSummary;
  function getFilesErrorSummaryByFlow() returns many types.flowSummary;


}
