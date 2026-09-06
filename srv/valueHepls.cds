using CatalogService as service from './errorlog-service';


// Flat Payloads
annotate service.ErrorLogSet with {

    iFlow_name         @(Common.ValueList: {
        Label         : 'Integration Flow Name',
        CollectionPath: 'IFlowValueHelp',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'iFlow_name',
            ValueListProperty: 'iFlow_name'
        }]
    });

    // createdAt          @(Common.ValueList: {
    //     Label         : 'Created Time',
    //     CollectionPath: 'DistinctErrorLogValues',
    //     Parameters    : [{
    //         $Type            : 'Common.ValueListParameterInOut',
    //         LocalDataProperty: 'createdAt',
    //         ValueListProperty: 'createdAt'
    //     }]
    // });

    createdBy                @(Common.ValueList: {
        Label         : 'Created By',
        CollectionPath: 'DistinctErrorLogValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'createdBy',
            ValueListProperty: 'createdBy'
        }]
    });

    Status             @(Common.ValueList: {
        Label         : 'Status',
        CollectionPath: 'StatusValueHelp',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Status',
            ValueListProperty: 'Status'
        }]
    });

    Error_Code         @(Common.ValueList: {
        Label         : 'Status Code',
        CollectionPath: 'DistinctErrorLogValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Error_Code',
            ValueListProperty: 'Error_Code'
        }]
    });

    Error_Msg          @(Common.ValueList: {
        Label         : 'Error Message',
        CollectionPath: 'DistinctErrorLogValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Error_Msg',
            ValueListProperty: 'Error_Msg'
        }]
    });

    Msg_ID             @(Common.ValueList: {
        Label         : 'Message ID',
        CollectionPath: 'DistinctErrorLogValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Msg_ID',
            ValueListProperty: 'Msg_ID'
        }]
    });

    CorrelationID      @(Common.ValueList: {
        Label         : 'Correlation ID',
        CollectionPath: 'DistinctErrorLogValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'CorrelationID',
            ValueListProperty: 'CorrelationID'
        }]
    });

    NumberOfRetriggers @(Common.ValueList: {
        Label         : 'Retry Count',
        CollectionPath: 'DistinctErrorLogValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'NumberOfRetriggers',
            ValueListProperty: 'NumberOfRetriggers'
        }]
    });

    Receiver_System    @(Common.ValueList: {
        Label         : 'Receiver System',
        CollectionPath: 'DistinctErrorLogValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Receiver_System',
            ValueListProperty: 'Receiver_System'
        }]
    });

    Department         @(Common.ValueList: {
        Label         : 'Department',
        CollectionPath: 'DistinctErrorLogValues',
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
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'PayloadFileName',
            ValueListProperty: 'PayloadFileName'
        }]
    });

    MIMEType                 @(Common.ValueList: {
        Label         : 'Content Type',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'MIMEType',
            ValueListProperty: 'MIMEType'
        }]
    });

    ErrorDescription         @(Common.ValueList: {
        Label         : 'Error Description',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'ErrorDescription',
            ValueListProperty: 'ErrorDescription'
        }]
    });

    ShortErrorDescription    @(Common.ValueList: {
        Label         : 'Short Error Description',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'ShortErrorDescription',
            ValueListProperty: 'ShortErrorDescription'
        }]
    });

    ProcessDirectName        @(Common.ValueList: {
        Label         : 'Process Direct Name',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'ProcessDirectName',
            ValueListProperty: 'ProcessDirectName'
        }]
    });

    Error_Code               @(Common.ValueList: {
        Label         : 'Status Code',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Error_Code',
            ValueListProperty: 'Error_Code'
        }]
    });

    NumberOfRetriggersofFile @(Common.ValueList: {
        Label         : 'Retry Count',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'NumberOfRetriggersofFile',
            ValueListProperty: 'NumberOfRetriggersofFile'
        }]
    });

    Status                   @(Common.ValueList: {
        Label         : 'Status',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Status',
            ValueListProperty: 'Status'
        }]
    });

    CorrelationID            @(Common.ValueList: {
        Label         : 'Correlation Id',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'CorrelationID',
            ValueListProperty: 'CorrelationID'
        }]
    });

    Receiver_System          @(Common.ValueList: {
        Label         : 'Receiver System',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Receiver_System',
            ValueListProperty: 'Receiver_System'
        }]
    });

    iFlow_name               @(Common.ValueList: {
        Label         : 'Integration Flow',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'iFlow_name',
            ValueListProperty: 'iFlow_name'
        }]
    });

    Department               @(Common.ValueList: {
        Label         : 'Department',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'Department',
            ValueListProperty: 'Department'
        }]
    });

    createdAt                @(Common.ValueList: {
        Label         : 'Created Time',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'createdAt',
            ValueListProperty: 'createdAt'
        }]
    });

    createdBy                @(Common.ValueList: {
        Label         : 'Created By',
        CollectionPath: 'DistinctErrorFilesValues',
        Parameters    : [{
            $Type            : 'Common.ValueListParameterInOut',
            LocalDataProperty: 'createdBy',
            ValueListProperty: 'createdBy'
        }]
    });
};
