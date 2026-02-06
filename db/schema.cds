namespace CPI_errordetails_schema;

using {
  cuid,
  managed
} from '@sap/cds/common';

// @(restrict: [
//   {
//     grant: ['DELETE'],
//     to   : 'EHAdmin'
//   },
//   {grant: 'READ'}
// ])

// @Capabilities.InsertRestrictions: {Insertable: true}
// @odata.draft.enabled
// @odata.draft.bypass
// @Capabilities : { Updatable }

entity ErrorLogSet : cuid, managed {

  @UI.editable         : true
  @title               : 'Source Payload'
  @UI.lineItem.position: 10
  Source_payload     : LargeString;

  @title               : 'Status Code'
  @UI.lineItem.position: 20
  Error_Code         : String;

  @title               : 'Error Message'
  @UI.lineItem.position: 30
  @UI.multiLineText
  Error_Msg          : LargeString;

  @title               : 'Message ID'
  @UI.lineItem.position: 40
  Msg_ID             : String;

  @title               : 'Correlation ID'
  @UI.lineItem.position: 50
  CorrelationID      : String;

  @title               : 'Integration Flow'
  @UI.lineItem.position: 60
  iFlow_name         : String;

  @title               : 'Retry count'
  @UI.lineItem.position: 70
  NumberOfRetriggers : Integer;

  @title               : 'Status'
  @UI.lineItem.position: 80
  Status             : String;

  @UI.Hidden           : true
  StatusCriticality  : Integer @cds.persistence.exists: false;

  @title: 'Receiver System'
  Receiver_System    : String;

  @title: 'Type of Error'
  error_Type         : String;

  @title: 'Operation Type'
  operation_Type     : String;

  @title: 'Department'
  Department         : String;

  @title: 'Process Direct Name'
  ProcessDirectName  : String;

  // ReqHeaders         : String;


}

entity ErrorFilesSet : cuid, managed {

  // file fields

  @title: 'Payload File Name'
  PayloadFileName          : String(255);

  // @UI.Hidden: true
  @title: 'Error Payload File'
  ErrorPayloadFile         : LargeBinary @Core.MediaType: MIMEType;

  @title: 'Error Details File'
  ErrorDetailsFile         : LargeBinary @Core.MediaType: MIMEType;

  @title: 'Content Type'
  MIMEType                 : String;

  @title: 'Error Description'
  ErrorDescription         : String;

  @title: 'Short Error Description'
  ShortErrorDescription    : LargeString;

  @title: 'Process Direct Name'
  ProcessDirectName        : String;

  @title: 'Status Code'
  Error_Code               : String;

  @title: 'Retry count'
  NumberOfRetriggersofFile : Integer;

  @title: 'Status'
  Status                   : String;

  StatusCriticality        : Integer     @cds.persistence.exists: false;

  @title: 'Correlation Id'
  CorrelationID            : String;

  @title: 'Receiver System'
  Receiver_System          : String;

  @title: 'Integration Flow'
  iFlow_name               : String;

  @title: 'Department'
  Department               : String;

  ReqHeaders               : String;

}
