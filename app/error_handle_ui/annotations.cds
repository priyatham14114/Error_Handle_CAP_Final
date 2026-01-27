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
        ImageUrl      : {value: './icons/errorlog.jpg'}

    },

    UI.SelectionFields            : [
        createdAt,
        Error_Code,
        Status,
        iFlow_name
    ],

    UI.LineItem                   : [
        {
            $Type: 'UI.DataField',
            Value: iFlow_name
        },
        {

            @UI.Hidden: true,
            $Type     : 'UI.DataField',
            Value     : Source_payload

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
            $Type      : 'UI.DataField',
            Value      : Status,
            Criticality: StatusCriticality
        },
        // cust Btns
        {
            $Type      : 'UI.DataFieldForAction',
            Action     : 'CatalogService.reTrigger',
            Label      : 'Retrigger',
            Criticality: #Positive,
        // Inline : true,
        }
    ],

    UI.FieldGroup #GeneratedGroup : {
        $Type: 'UI.FieldGroupType',
        Data : [
            {
                $Type: 'UI.DataField',
                Value: iFlow_name
            },
            {
                @UI.Hidden: true,
                $Type     : 'UI.DataField',
                Value     : Source_payload
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
                $Type      : 'UI.DataField',
                Value      : Status,
                Criticality: StatusCriticality
            },
        ],
    },

    // UI.Facets                    : [{
    //     $Type : 'UI.ReferenceFacet',
    //     ID    : 'GeneratedFacet1',
    //     Label : 'General Information',
    //     Target: '@UI.FieldGroup#GeneratedGroup'
    // }],

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
        },
        // {
        //     $Type : 'UI.CollectionFacet',
        //     ID    : 'GeneratedFacet3',
        //     Label : 'Error Details',
        //     Facets: [{
        //         $Type : 'UI.ReferenceFacet',
        //         Target: '@UI.LineItem',
        //         Label : 'Table'
        //     }]
        // }
    ],


);


annotate service.ErrorLogSet @(Common.SideEffects #reTrigger: {
    SourceEntities  : ['ErrorLogSet'],
    TargetProperties: ['*']
});

// test
// annotate service.ErrorLogSet with @(
//     Common: {
//         // SideEffects #reTrigger: {
//         //     $Type           : 'Common.SideEffectsType',
//         //     SourceProperties: ['Source_payload'], // Optional: fields that trigger the effect
//         //     SourceEntities  : ['ErrorLogSet'],       // Optional: entities that trigger the effect
//         //     TargetProperties: ['*'], // Properties to refresh
//         //     TargetEntities  : ['ErrorLogSet'],  // Entities/tables to refresh
//         // },
//         // You can also define side effects for specific actions
//         SideEffects #reTrigger: {
//             $Type           : 'Common.SideEffectsType',
//             SourceEntities  : ['ErrorLogSet'],
//             TargetEntities  : ['ErrorLogSet']
//         }
//     }
// )
// test
