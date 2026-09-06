// db/valueHelps.cds
namespace valueHelpView;

using CPI_errordetails_schema as E_Schema from '../db/schema';

// using { ErrorLogSet, ErrorFilesSet } from './schema';

// One generic distinct view for ErrorLogSet value helps
// view DistinctErrorLogValues as
//   select distinct
//      key cast(1 as Integer) as ID,  // typed synthetic key
//         Status,
//         Error_Code,
//         iFlow_name,
//         Receiver_System,
//         error_Type,
//         operation_Type,
//         Department,
//         ProcessDirectName
//   from E_Schema.ErrorLogSet;

// // One generic distinct view for ErrorFilesSet value helps
// view DistinctErrorFilesValues as
//   select distinct
//      key cast(1 as Integer) as ID,  // typed synthetic key
//         Status,
//         Error_Code,
//         iFlow_name,
//         Receiver_System,
//         Department,
//         ProcessDirectName
//   from E_Schema.ErrorFilesSet;


// TEST
view IFlowValueHelp as select distinct 
    key iFlow_name from E_Schema.ErrorLogSet;

view DepartmentValueHelp as select distinct 
    key Department from E_Schema.ErrorLogSet; 

view StatusValueHelp as select distinct 
    key Status from E_Schema.ErrorLogSet;

view StatusCodeValueHelp as select distinct 
    key Error_Code from E_Schema.ErrorLogSet

// TEST