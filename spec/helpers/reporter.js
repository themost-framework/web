const SpecReporter = require('jasmine-spec-reporter').SpecReporter;

jasmine.getEnv().addReporter(new SpecReporter({  // add jasmine-spec-reporter
    spec: {
        displayPending: true,
        displayStacktrace: 'raw'
    }
}));
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
