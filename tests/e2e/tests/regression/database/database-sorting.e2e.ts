import { acceptLicenseTerms, clickOnEditDatabaseByName } from '../../../helpers/database';
import {
    discoverSentinelDatabaseApi,
    addNewOSSClusterDatabaseApi,
    addNewStandaloneDatabaseApi,
    deleteAllDatabasesApi, deleteAllDatabasesByConnectionTypeApi
} from '../../../helpers/api/api-database';
import { MyRedisDatabasePage, BrowserPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import {
    commonUrl,
    ossStandaloneConfig,
    ossSentinelConfig,
    ossClusterConfig
} from '../../../helpers/conf';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const common = new Common();
const databases = [
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: ossStandaloneConfig.databaseName },
    { host: ossClusterConfig.ossClusterHost, port: ossClusterConfig.ossClusterPort, databaseName: ossClusterConfig.ossClusterDatabaseName },
    { host: ossSentinelConfig.sentinelHost, port: ossSentinelConfig.sentinelPort, databaseName: ossSentinelConfig.masters[0].alias }
];
let actualDatabaseList: string[] = [];
const oldDBName = ossStandaloneConfig.databaseName;
const newDBName = '! Edited Standalone DB name';
const sortList = async(): Promise<string[]> => {
    const sortedByName = databases.sort((a, b) => a.databaseName > b.databaseName ? 1 : -1);
    const sortedDatabaseNames: string[] = [];
    for (let i = 0; i < sortedByName.length; i++) {
        sortedDatabaseNames.push(sortedByName[i].databaseName);
    }
    return sortedDatabaseNames;
};

fixture `Remember database sorting`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        // Delete all existing databases
        await deleteAllDatabasesApi();
        // Add new databases using API
        await acceptLicenseTerms();
        await addNewStandaloneDatabaseApi(ossStandaloneConfig);
        await addNewOSSClusterDatabaseApi(ossClusterConfig);
        await discoverSentinelDatabaseApi(ossSentinelConfig, 1);
        // Reload Page
        await common.reloadPage();
    })
    .afterEach(async() => {
        // Clear and delete databases
        await deleteAllDatabasesByConnectionTypeApi('STANDALONE');
        await deleteAllDatabasesByConnectionTypeApi('CLUSTER');
        await deleteAllDatabasesByConnectionTypeApi('SENTINEL');
    });
test('Verify that sorting on the list of databases saved when database opened', async t => {
    // Sort by Connection Type
    const sortedByConnectionType = [ossClusterConfig.ossClusterDatabaseName, ossSentinelConfig.masters[0].alias, ossStandaloneConfig.databaseName];
    await t.click(myRedisDatabasePage.sortByConnectionType);
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    await myRedisDatabasePage.compareDatabases(actualDatabaseList, sortedByConnectionType);
    // Connect to DB and check sorting
    await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
    await t.expect(browserPage.refreshKeysButton.visible).ok('Browser page is not opened');
    await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    await myRedisDatabasePage.compareDatabases(actualDatabaseList, sortedByConnectionType);
    // Sort by Host and Port
    await t.click(myRedisDatabasePage.sortByHostAndPort);
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    const sortedDatabaseHost = [ossClusterConfig.ossClusterDatabaseName, ossSentinelConfig.masters[0].alias, ossStandaloneConfig.databaseName];
    await myRedisDatabasePage.compareDatabases(actualDatabaseList, sortedDatabaseHost);
    // Verify that sorting on the list of databases saved when databases list refreshed
    await common.reloadPage();
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    await myRedisDatabasePage.compareDatabases(actualDatabaseList, sortedDatabaseHost);
});
test('Verify that user has the same sorting if db name is changed', async t => {
    // Sort by Database name
    await t.click(myRedisDatabasePage.sortByDatabaseAlias);
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    await myRedisDatabasePage.compareDatabases(actualDatabaseList, await sortList());
    // Change DB name inside of sorted list
    await clickOnEditDatabaseByName(ossStandaloneConfig.databaseName);
    await t.click(myRedisDatabasePage.editAliasButton);
    await t.typeText(myRedisDatabasePage.aliasInput, newDBName, { replace: true, paste: true });
    await t.pressKey('enter');
    // Change DB is control list
    const index = databases.findIndex((item) => {
        return item.databaseName === oldDBName;
    });
    databases[index].databaseName = newDBName;
    // Compare sorting with expected list
    actualDatabaseList = await myRedisDatabasePage.getAllDatabases();
    await myRedisDatabasePage.compareDatabases(actualDatabaseList, await sortList());
});
