namespace log.monitoring;

using CPI_errordetails_schema as E_Schema from '../db/schema';

view CombinedErrorsBase as
  select from E_Schema.ErrorLogSet {
    iFlow_name,
    createdAt,
    1 as Total,
    case when Status = 'Success' then 1 else 0 end as Success,
    case when Status = 'Failed' then 1 else 0 end as Failed,
    'LOG' as SourceType : String
  }
union all
  select from E_Schema.ErrorFilesSet {
    iFlow_name,
    createdAt,
    1 as Total,
    case when Status = 'Success' then 1 else 0 end as Success,
    case when Status = 'Failed' then 1 else 0 end as Failed,
    'FILE' as SourceType :String
  };

  view  monitoringlog as
  select from CombinedErrorsBase {
    key iFlow_name,
    key SourceType,
    count(*) as TotalRecords : Integer,
    sum(Total) as Total : Integer,
    sum(Success) as Success : Integer,
    sum(Failed) as Failed : Integer,

    sum(Total) - sum(Success) as Variance : Integer,
    case
      when sum(Total) = 0 then 0
      else round((sum(Success) * 100.0) / sum(Total), 2)
    end as PercentMatch : Decimal(5, 2),
    case
      when
        case
          when sum(Total) = 0 then 0
          else round((sum(Success) * 100.0) / sum(Total), 2)
        end > 90 then 'Safe'
      when
        case
          when sum(Total) = 0 then 0
          else round((sum(Success) * 100.0) / sum(Total), 2)
        end >= 70 then 'Action Required'
      else 'At Risk'
    end as FlowStatus : String
  }
  group by iFlow_name, SourceType;