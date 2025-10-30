namespace reusable.types;

  type count_ByDate        : {
    errorCount     : Integer;
    errorDate      : Date;
    failedCount    : Integer;
    noRetriesCount : Integer;
    successCount   : Integer;

  }

  type dashboardKPIType    : {
    totalErrorCount : Integer;
    totalSuccess    : Integer;
    totalFailed     : Integer;
    totalNoretries  : Integer;
  }

  type countByFlow         : {
    Failed      : Integer;
    NoRetries   : Integer;
    Success     : Integer;
    TotalErrors : Integer;
    iFlow_name  : String;
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
  type flowSummary {
    iFlow_name      : String;
    createdAt       : Timestamp;
    Status          : String;
    Receiver_System : String;
  }