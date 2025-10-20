sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"com/app/errorhandleui/test/integration/pages/ErrorLogSetList",
	"com/app/errorhandleui/test/integration/pages/ErrorLogSetObjectPage"
], function (JourneyRunner, ErrorLogSetList, ErrorLogSetObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('com/app/errorhandleui') + '/index.html',
        pages: {
			onTheErrorLogSetList: ErrorLogSetList,
			onTheErrorLogSetObjectPage: ErrorLogSetObjectPage
        },
        async: true
    });

    return runner;
});

