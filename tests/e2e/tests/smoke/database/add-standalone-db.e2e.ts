import { t } from 'testcafe';
import {
    addNewREClusterDatabase,
    addOSSClusterDatabase,
    acceptLicenseTerms,
    deleteDatabase,
    addRECloudDatabase
} from '../../../helpers/database';
import {
    commonUrl,
    ossStandaloneConfig,
    ossClusterConfig,
    redisEnterpriseClusterConfig,
    cloudDatabaseConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { AddRedisDatabasePage, BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';
import { Telemetry } from '../../../helpers/telemetry';

const browserPage = new BrowserPage();
const myRedisDatabasePage = new MyRedisDatabasePage();
const addRedisDatabasePage = new AddRedisDatabasePage();
const telemetry = new Telemetry();
const logger = telemetry.createLogger();
const telemetryEvent = 'CONFIG_DATABASES_OPEN_DATABASE';
const expectedProperties = [
    'databaseId',
    'RediSearch',
    'RedisAI',
    'RedisGraph',
    'RedisGears',
    'RedisBloom',
    'RedisJSON',
    'RedisTimeSeries',
    'customModules'
];

fixture `Add database`
    .meta({ type: 'smoke' })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTerms();
    });
test
    .meta({ rte: rte.standalone })
    .requestHooks(logger)
    .after(async() => {
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })('Verify that user can add Standalone Database', async() => {
        const connectionTimeout = '20';

        // Fill the add database form
        await addRedisDatabasePage.addDatabaseButton.with({ visibilityCheck: true, timeout: 10000 })();
        await t
            .click(addRedisDatabasePage.addDatabaseButton)
            .click(addRedisDatabasePage.addDatabaseManually);
        await t
            .typeText(addRedisDatabasePage.hostInput, ossStandaloneConfig.host, { replace: true, paste: true })
            .typeText(addRedisDatabasePage.portInput, ossStandaloneConfig.port, { replace: true, paste: true })
            .typeText(addRedisDatabasePage.databaseAliasInput, ossStandaloneConfig.databaseName, { replace: true, paste: true })
            // Verify that user can customize the connection timeout for the manual flow
            .typeText(addRedisDatabasePage.timeoutInput, connectionTimeout, { replace: true, paste: true });
        await t
            .click(addRedisDatabasePage.addRedisDatabaseButton)
            // Wait for database to be exist
            .expect(myRedisDatabasePage.dbNameList.withExactText(ossStandaloneConfig.databaseName).exists).ok('The database not displayed', { timeout: 10000 })
            // Close message
            .click(myRedisDatabasePage.toastCloseButton);

        // Verify that user can see an indicator of databases that are added manually and not opened yet
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossStandaloneConfig.databaseName);
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);

        // Verify that telemetry event 'CONFIG_DATABASES_OPEN_DATABASE' sent and has all expected properties
        await telemetry.verifyEventHasProperties(telemetryEvent, expectedProperties, logger);

        await t.click(browserPage.OverviewPanel.myRedisDbIcon);
        // Verify that user can't see an indicator of databases that were opened
        await myRedisDatabasePage.verifyDatabaseStatusIsNotVisible(ossStandaloneConfig.databaseName);

        // Verify that connection timeout value saved
        await myRedisDatabasePage.clickOnEditDBByName(ossStandaloneConfig.databaseName);
        await t.expect(addRedisDatabasePage.timeoutInput.value).eql(connectionTimeout, 'Connection timeout is not customized');
    });
test
    .meta({ rte: rte.reCluster })
    .after(async() => {
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add database from RE Cluster via auto-discover flow', async() => {
        await addNewREClusterDatabase(redisEnterpriseClusterConfig);
        // Verify that user can see an indicator of databases that are added using autodiscovery and not opened yet
        // Verify new connection badge for RE cluster
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(redisEnterpriseClusterConfig.databaseName);
    });
test
    .meta({ env: env.web, rte: rte.ossCluster })
    .after(async() => {
        await deleteDatabase(ossClusterConfig.ossClusterDatabaseName);
    })('Verify that user can add OSS Cluster DB', async() => {
        await addOSSClusterDatabase(ossClusterConfig);
        // Verify new connection badge for OSS cluster
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(ossClusterConfig.ossClusterDatabaseName);
    });

test
    .meta({ rte: rte.reCloud })
    .after(async() => {
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that user can add database from RE Cloud via auto-discover flow', async() => {
        await addRECloudDatabase(cloudDatabaseConfig);
        // Verify new connection badge for RE cloud
        await myRedisDatabasePage.verifyDatabaseStatusIsVisible(cloudDatabaseConfig.databaseName);
        // Verify redis stack icon for RE Cloud with all 5 modules
        await t.expect(myRedisDatabasePage.redisStackIcon.visible).ok('Redis Stack icon not found for RE Cloud db with all 5 modules');
    });
