using CatalogService as service from './errorlog-service';


// Flat Payloads
annotate service.ErrorLogSet with {

    iFlow_name         @(Common.ValueList: {
        Label         : 'Integration Flow Name',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'iFlow_name',
            ValueListProperty: 'iFlow_name'
        }]
    });

    createdAt          @(Common.ValueList: {
        Label         : 'Created Time',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'createdAt',
            ValueListProperty: 'createdAt'
        }]
    });

    createdBy                @(Common.ValueList: {
        Label         : 'Created By',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'createdBy',
            ValueListProperty: 'createdBy'
        }]
    });

    Status             @(Common.ValueList: {
        Label         : 'Status',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Status',
            ValueListProperty: 'Status'
        }]
    });

    Error_Code         @(Common.ValueList: {
        Label         : 'Status Code',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Error_Code',
            ValueListProperty: 'Error_Code'
        }]
    });

    Error_Msg          @(Common.ValueList: {
        Label         : 'Error Message',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Error_Msg',
            ValueListProperty: 'Error_Msg'
        }]
    });

    Msg_ID             @(Common.ValueList: {
        Label         : 'Message ID',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Msg_ID',
            ValueListProperty: 'Msg_ID'
        }]
    });

    CorrelationID      @(Common.ValueList: {
        Label         : 'Correlation ID',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'CorrelationID',
            ValueListProperty: 'CorrelationID'
        }]
    });

    NumberOfRetriggers @(Common.ValueList: {
        Label         : 'Retry Count',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'NumberOfRetriggers',
            ValueListProperty: 'NumberOfRetriggers'
        }]
    });

    Receiver_System    @(Common.ValueList: {
        Label         : 'Receiver System',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Receiver_System',
            ValueListProperty: 'Receiver_System'
        }]
    });

    Department         @(Common.ValueList: {
        Label         : 'Department',
        CollectionPath: 'ErrorLogSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Department',
            ValueListProperty: 'Department'
        }]
    });
};


// Files Payloads
annotate service.ErrorFilesSet with {

    PayloadFileName          @(Common.ValueList: {
        Label         : 'Payload File Name',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'PayloadFileName',
            ValueListProperty: 'PayloadFileName'
        }]
    });

    MIMEType                 @(Common.ValueList: {
        Label         : 'Content Type',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'MIMEType',
            ValueListProperty: 'MIMEType'
        }]
    });

    ErrorDescription         @(Common.ValueList: {
        Label         : 'Error Description',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'ErrorDescription',
            ValueListProperty: 'ErrorDescription'
        }]
    });

    ShortErrorDescription    @(Common.ValueList: {
        Label         : 'Short Error Description',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'ShortErrorDescription',
            ValueListProperty: 'ShortErrorDescription'
        }]
    });

    ProcessDirectName        @(Common.ValueList: {
        Label         : 'Process Direct Name',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'ProcessDirectName',
            ValueListProperty: 'ProcessDirectName'
        }]
    });

    Error_Code               @(Common.ValueList: {
        Label         : 'Status Code',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Error_Code',
            ValueListProperty: 'Error_Code'
        }]
    });

    NumberOfRetriggersofFile @(Common.ValueList: {
        Label         : 'Retry Count',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'NumberOfRetriggersofFile',
            ValueListProperty: 'NumberOfRetriggersofFile'
        }]
    });

    Status                   @(Common.ValueList: {
        Label         : 'Status',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Status',
            ValueListProperty: 'Status'
        }]
    });

    CorrelationID            @(Common.ValueList: {
        Label         : 'Correlation Id',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'CorrelationID',
            ValueListProperty: 'CorrelationID'
        }]
    });

    Receiver_System          @(Common.ValueList: {
        Label         : 'Receiver System',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Receiver_System',
            ValueListProperty: 'Receiver_System'
        }]
    });

    iFlow_name               @(Common.ValueList: {
        Label         : 'Integration Flow',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'iFlow_name',
            ValueListProperty: 'iFlow_name'
        }]
    });

    Department               @(Common.ValueList: {
        Label         : 'Department',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Department',
            ValueListProperty: 'Department'
        }]
    });

    createdAt                @(Common.ValueList: {
        Label         : 'Created Time',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'createdAt',
            ValueListProperty: 'createdAt'
        }]
    });

    createdBy                @(Common.ValueList: {
        Label         : 'Created By',
        CollectionPath: 'ErrorFilesSet',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'createdBy',
            ValueListProperty: 'createdBy'
        }]
    });
};
