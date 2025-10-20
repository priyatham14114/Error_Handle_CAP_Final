sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.app.errorhandleuifilesui',
            componentId: 'ErrorFilesSetList',
            contextPath: '/ErrorFilesSet'
        },
        CustomPageDefinitions
    );
});