'use strict';

global.Promise = require('bluebird');

const expect = require('chai').expect;
const chalk = require('chalk');
const fs  = require('fs-extra');

const AcceptanceTest = require('../utils/acceptance-test');

describe.only('Acceptance: Install Local (~35second test)', function () {
    it('can do a local install, anywhere!', function () {
        const timeout = 45000;

        // This command is slow
        this.timeout(timeout);
        let test = new AcceptanceTest('install local');
        // Create an empty dir for running the tests
        test.setup('empty');

        return test
            .run({
               failOnStdErr: true
            })
            .then((result) => {
                console.log('result', result);
                expect(result.stdout, 'output exists').to.be.ok;
                // Very simple output check to verify we got something we expected, port number can change!
                expect(result.stdout, 'output').to.match(/http:\/\/localhost:23/);

                expect(fs.existsSync(test.path('config.development.json')), 'development config exists').to.be.true;

                let contents = fs.readJsonSync(test.path('config.development.json'));

                expect(contents, 'contents of config file').to.be.ok;

                expect(contents.url, 'config url').to.match(/http:\/\/localhost:23/);
                expect(contents.server.host, 'config host').to.equal('127.0.0.1');
                expect(contents.database.client, 'config db').to.equal('sqlite3');
                expect(contents.mail.transport, 'config mail transport').to.equal('Direct');
                expect(contents.logging.transports, 'config logging transport').to.eql([ 'file', 'stdout' ]);
                expect(contents.process, 'config process').to.equal('local');
            })
            .finally(() => {
                return test
                    .run('ghost stop')
                    .finally(() => {
                        test.cleanupDir();
                    });
        });
    });
});
