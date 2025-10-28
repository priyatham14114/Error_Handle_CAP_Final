using CPI_errordetails_schema as E_Schema from '../db/schema';
using CPI_errordetails_schema_Views as E_Schema_view from '../db/views';

// @requires: 'authenticated-user'
service CatalogService {

  action   TriggerSFTP()           returns {
    Status  : String;
    Message : LargeString;
  };

      @UI.UpdateHidden   : false
  entity ErrorLogSet             as projection on E_Schema.ErrorLogSet
    actions {

      @Common.SideEffects: [{TargetEntities: ['ErrorLogSet']}]
      action reTrigger();
    }

  entity ErrorFilesSet           as projection on E_Schema.ErrorFilesSet
    actions {
      action reTriggerFile()
    }

  // function fileErrorsCount() returns array of ErrorCountType;

  // VIEW for date wise count
  entity DailyErrorCounts        as projection on E_Schema_view.DailyErrorCounts;
  entity FilesDailyErrorCounts   as projection on E_Schema_view.FilesDailyErrorCounts;
  entity ErrorSummarybyFlow      as projection on E_Schema_view.ErrorSummarybyFlow;
  entity FilesErrorSummarybyFlow as projection on E_Schema_view.FilesErrorSummarybyFlow;


  @readonly
  function getAppConfig()          returns {
    UIbasePath : String;
  };

  type dashboardKPIType    : {
    totalErrorCount : Integer;
    totalSuccess    : Integer;
    totalFailed     : Integer;
    totalNoretries  : Integer;
  }

  type ErrorCountDonutType : {
    Identifier : String;
    Value      : Integer;

  }

  type recentLog {
    iFlow_name      : String;
    createdAt       : Timestamp;
    Status          : String;
    Receiver_System : String;
  }

  function dashboardKPIsLogs()     returns dashboardKPIType;
  function dashboardKPIsFiles()    returns dashboardKPIType;
  function countErrorsDonutLogs()  returns array of ErrorCountDonutType;
  function countErrorsDonutFiles() returns array of ErrorCountDonutType;
  function recentErrorLogs()       returns many recentLog;
  function recentErrorFiles()      returns many recentLog;


}
