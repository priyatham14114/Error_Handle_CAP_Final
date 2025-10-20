using CatalogService as service from '../../srv/errorlog-service';


annotate service.ErrorLogSet with {
    createdAt  @UI.HiddenFilter: false;
    createdBy  @UI.HiddenFilter: false;
    modifiedAt @UI.HiddenFilter: false;
    modifiedBy @UI.HiddenFilter: false;
};


annotate service.ErrorLogSet with @(

    UI.HeaderInfo                 : {
        TypeName      : 'All integration flow issue',
        TypeNamePlural: 'All integration flow issues',
        Title         : {Value: '{iFlow_name}'},
        ImageUrl    : {value:'./icons/errorlog.jpg'}

    },

    UI.SelectionFields            : [
        createdAt,
        Error_Code,
        Msg_ID
    ],

    UI.LineItem                   : [
        {
            $Type: 'UI.DataField',
            Value: iFlow_name
        },
        {

            $Type: 'UI.DataField',
            Value: Source_payload,

        },
        {
            $Type: 'UI.DataField',
            Value: Error_Msg
        },
        {
            $Type: 'UI.DataField',
            Value: Error_Code
        },
        {
            $Type: 'UI.DataField',
            Value: Msg_ID
        },
        {
            $Type: 'UI.DataField',
            Value: CorrelationID
        },
        {
            $Type: 'UI.DataField',
            Value: NumberOfRetriggers
        },
        {
            $Type: 'UI.DataField',
            Value: Status
        },
        // cust Btns
        {
            $Type      : 'UI.DataFieldForAction',
            Action     : 'CatalogService.reTrigger',
            Label      : 'Retrigger',
            // IsMassAction: true,
            Criticality: #Positive,
        // Inline : true,
        }
    //  {
    //     $Type      : 'UI.DataFieldForAction',
    //     Action     : 'CatalogService.TriggerSFTP',
    //     Label      : 'Trigger SFTP Server',
    //     Criticality: #Positive
    // }
    ],

    UI.FieldGroup #GeneratedGroup : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: iFlow_name
            },
            {
                $Type: 'UI.DataField',
                Value: Source_payload
            },
            {
                $Type: 'UI.DataField',
                Value: Error_Code
            },
            {
                $Type: 'UI.DataField',
                Value: Msg_ID
            },
            {
                $Type: 'UI.DataField',
                Value: Error_Msg
            },
            {
                $Type: 'UI.DataField',
                Value: CorrelationID
            },
            {
                $Type: 'UI.DataField',
                Value: NumberOfRetriggers
            },
            {
                $Type: 'UI.DataField',
                Value: Status
            }
        ],
    },

    // UI.Facets                    : [{
    //     $Type : 'UI.ReferenceFacet',
    //     ID    : 'GeneratedFacet1',
    //     Label : 'General Information',
    //     Target: '@UI.FieldGroup#GeneratedGroup'
    // }],


    // createdAt
    // createdBy
    // modifiedAt
    // modifiedBy

    UI.FieldGroup #GeneratedGroup2: {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: createdBy
            },
            {
                $Type: 'UI.DataField',
                Value: createdAt
            },
            {
                $Type: 'UI.DataField',
                Value: modifiedAt
            },
            {
                $Type: 'UI.DataField',
                Value: modifiedBy
            }
        ],
    },

    UI.Facets                     : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet1',
            Label : 'Error Information',
            Target: '@UI.FieldGroup#GeneratedGroup'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneratedFacet2',
            Label : 'User Information',
            Target: '@UI.FieldGroup#GeneratedGroup2'
        }
    ],


);
