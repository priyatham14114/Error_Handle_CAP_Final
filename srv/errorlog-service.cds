using CPI_errordetails_schema as E_Schema from '../db/schema';

service CatalogService {

  action   TriggerSFTP()  returns {
    Status  : String;
    Message : LargeString;
  };

  @UI.UpdateHidden: false
  entity ErrorLogSet      as projection on E_Schema.ErrorLogSet
    actions {

      // @Common.SideEffects: [{TargetEntities: ['ErrorLogSet']}]
      action reTrigger();

      action sourcePayloadUpdate(Source_payload: LargeString) returns {
        response : String;
      }
    }

  function countErrors()  returns array of ErrorCountType;

  type ErrorCountType : {
    Identifier : String;
    Value      : Integer;
  }

  entity ErrorFilesSet    as projection on E_Schema.ErrorFilesSet
    actions {
      action reTriggerFile()
    }

  //    function TotalErrorsByDay() returns array of ErrorCountType;
  //   // type ErrorCountType : {
  //   //   Identifier : String;
  //   //   Value      : Integer;
  //   // }

  // VIEW for date wise count
  entity DailyErrorCounts as projection on E_Schema.DailyErrorCounts;

  @readonly
  function getAppConfig() returns {
    UIbasePath : String;
  };

}
