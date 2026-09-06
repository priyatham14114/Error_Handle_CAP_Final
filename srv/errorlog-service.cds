using CPI_errordetails_schema as E_Schema from '../db/schema';
using log.monitoring as monitorlogs from '../db/monitorlogs';
using valueHelpView as VH from '../db/distinctViews';
using {reusable.types as types} from './reusableTypes';

// @requires: 'authenticated-user'
service CatalogService @(Common.SideEffects: {
  SourceProperties: ['*'],
  TargetProperties: ['*']
}) {

  // distinct values

  //   // One value-help entity per main entity
  // entity DistinctErrorLogValues as projection on VH.DistinctErrorLogValues;
  // entity DistinctErrorFilesValues as projection on VH.DistinctErrorFilesValues;

  // TEST
  entity IFlowValueHelp as projection on VH.IFlowValueHelp;
  entity StatusValueHelp as projection on VH.StatusValueHelp;
  // IFlowValueHelp
  // TEST
  @readonly
  entity monitoringlogs   as projection on monitorlogs.monitoringlog;

  // @UI.UpdateHidden: false
  // @UI.DeleteHidden   : true
  @Common.SideEffects: {TargetEntities: ['ErrorLogSet']}
  @cds.redirection.target
  entity ErrorLogSet      as projection on E_Schema.ErrorLogSet
    actions {
      action reTrigger();
    }

  entity ReproxLogHistory as projection on E_Schema.ReproxLogHistory;

  @Common.SideEffects: [{TargetEntities: ['ErrorFilesSet']}]
  @cds.redirection.target
  entity ErrorFilesSet    as projection on E_Schema.ErrorFilesSet
    actions {
      action reTriggerFile();
    }

  @readonly
  function getAppConfig()                                      returns {
    UIbasePath : String;
  };

  // Logs cards
  function dashboardKPIsLogs()                                 returns types.dashboardKPIType;
  function countErrorsDonutLogs()                              returns many types.ErrorCountDonutType;
  function recentErrorLogs()                                   returns many types.recentLog;
  function getDailyErrorCounts()                               returns many types.count_ByDate;
  function getFilesDailyErrorCounts()                          returns many types.count_ByDate;

  // files cards
  function dashboardKPIsFiles()                                returns types.dashboardKPIType;
  function countErrorsDonutFiles()                             returns many types.ErrorCountDonutType;
  function recentErrorFiles()                                  returns many types.recentLog;
  function getErrorSummaryByFlow()                             returns many types.flowSummary;
  function getFilesErrorSummaryByFlow()                        returns many types.flowSummary;

  // TEST
  function getIFlowKPI(fromDate: Timestamp, toDate: Timestamp) returns array of {
    iFlow_name   : String;
    SourceType   : String;
    Department   : String;
    TotalRecords : Integer;
    Successcount : Integer;
    Failed       : Integer;
    Variance     : Integer;
    PercentMatch : Decimal(5, 2);
    FlowStatus   : String;
  };

  // TEST
  // unbound action for multi downal
  action   downloadMergedErrorDetails(fileIds: many UUID)      returns LargeString; // merge and download files act
  action   autoReProx(id:UUID); 

}
