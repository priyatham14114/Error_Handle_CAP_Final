sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"com/app/errorhandleuifilesui/test/integration/pages/ErrorFilesSetList",
	"com/app/errorhandleuifilesui/test/integration/pages/ErrorFilesSetObjectPage"
], function (JourneyRunner, ErrorFilesSetList, ErrorFilesSetObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('com/app/errorhandleuifilesui') + '/test/flpSandbox.html#comapperrorhandleuifilesui-tile',
        pages: {
			onTheErrorFilesSetList: ErrorFilesSetList,
			onTheErrorFilesSetObjectPage: ErrorFilesSetObjectPage
        },
        async: true
    });

    return runner;
});

