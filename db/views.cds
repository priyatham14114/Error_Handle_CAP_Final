// namespace CPI_errordetails_schema_Views;

// using CPI_errordetails_schema as E_Schema from './schema';

// // view to fetch error count based on date
// view DailyErrorCounts as
//   select from E_Schema.ErrorLogSet {
//         @title: 'Date'
//     key cast(
//           createdAt as Date
//         ) as errorDate, // date as key
//         @title: 'Total Errors'
//         cast(
//           count(ID) as Integer
//         ) as errorCount, // total errors
//         @title: 'Resolved'
//         cast(
//           sum(case
//                 when Status = 'Success'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as successCount,
//         @title: 'Failed'
//         cast(
//           sum(case
//                 when Status = 'Failed'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as failedCount,
//         @title: 'No retries'
//         cast(
//           sum(case
//                 when Status = 'No retries yet'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as noRetriesCount
//   }
//   group by
//     cast(
//       createdAt as Date
//     )
//   order by
//     errorDate asc;

// // view to fetch error count based on iflow
// view ErrorSummarybyFlow as
//   select from E_Schema.ErrorLogSet {
//         @title: 'Integration Flow'
//     key iFlow_name,
//         @title: 'No Retries' cast(
//           sum(case
//                 when Status = 'No retries yet'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as NoRetries,

//         @title: 'Failed'
//         cast(
//           sum(case
//                 when Status = 'Failed'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as Failed,

//         @title: 'Success'
//         cast(
//           sum(case
//                 when Status = 'Success'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as Success,

//         @title: 'Total Errors'
//         cast(
//           count(ID) as Integer
//         ) as TotalErrors
//   }
//   where
//     createdAt >= add_days(
//       current_date, - 30
//     )
//   group by
//     iFlow_name
//   order by
//     iFlow_name asc;


// // Files vies start
// // view to fetch error count based on date

// view FilesDailyErrorCounts as
//   select from E_Schema.ErrorFilesSet {
//         @title: 'Date'
//     key cast(
//           createdAt as Date
//         ) as errorDate, // date as key
//         @title: 'Total Errors'
//         cast(
//           count(ID) as Integer
//         ) as errorCount, // total errors
//         @title: 'Resolved'
//         cast(
//           sum(case
//                 when Status = 'Success'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as successCount,
//         @title: 'Failed'
//         cast(
//           sum(case
//                 when Status = 'Failed'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as failedCount,
//         @title: 'No retries'
//         cast(
//           sum(case
//                 when Status = 'No retries yet'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as noRetriesCount
//   }
//   group by
//     cast(
//       createdAt as Date
//     )
//   order by
//     errorDate asc;

// // view to fetch error count based on iflow
// view FilesErrorSummarybyFlow as
//   select from E_Schema.ErrorFilesSet {
//         @title: 'Integration Flow'
//     key iFlow_name,
//         @title: 'No Retries' cast(
//           sum(case
//                 when Status = 'No retries yet'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as NoRetries,

//         @title: 'Failed'
//         cast(
//           sum(case
//                 when Status = 'Failed'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as Failed,

//         @title: 'Success'
//         cast(
//           sum(case
//                 when Status = 'Success'
//                      then 1
//                 else 0
//               end) as Integer
//         ) as Success,

//         @title: 'Total Errors'
//         cast(
//           count(ID) as Integer
//         ) as TotalErrors
//   }
//   where
//     createdAt >= add_days(
//       current_date, - 30
//     )
//   group by
//     iFlow_name
//   order by
//     iFlow_name asc;