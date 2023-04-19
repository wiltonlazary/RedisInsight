import { acceptLicenseTerms, acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { WorkbenchPage, MyRedisDatabasePage, BrowserPage } from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { commonUrl, ossStandaloneConfig, ossStandaloneRedisearch } from '../../../helpers/conf';
import { addNewStandaloneDatabasesApi, deleteStandaloneDatabaseApi, deleteStandaloneDatabasesApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const common = new Common();
const browserPage = new BrowserPage();

const keyName = common.generateWord(10);
const indexName = common.generateWord(5);
const keyValue = '\\xe5\\xb1\\xb1\\xe5\\xa5\\xb3\\xe9\\xa6\\xac / \\xe9\\xa9\\xac\\xe7\\x9b\\xae abc 123';
const unicodeValue = '山女馬 / 马目 abc 123';
const commandsForSend = [
    `set ${keyName} "${keyValue}"`,
    `get ${keyName}`
];
const databasesForAdding = [
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: 'testDB1' },
    { host: ossStandaloneConfig.host, port: ossStandaloneConfig.port, databaseName: 'testDB2' }
];

fixture `Workbench Raw mode`
    .meta({ type: 'critical_path', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    })
    .afterEach(async t => {
        // Clear and delete database
        await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Use raw mode for Workbech result', async t => {
    // Send commands
    await workbenchPage.sendCommandsArrayInWorkbench(commandsForSend);
    // Display result in Ascii when raw mode is off
    await t.expect(workbenchPage.queryTextResult.textContent).contains(`"${keyValue}"`, 'The result is not correct');
    // Verify that user can't see Raw marker in Workbench command history
    await t.expect(workbenchPage.parametersAnchor.exists).notOk('Raw mode icon displayed');
    //Send command in raw mode
    await t.click(workbenchPage.rawModeBtn);
    await workbenchPage.sendCommandInWorkbench(commandsForSend[1]);
    // Verify that user can see command result execution in raw mode
    await workbenchPage.checkWorkbenchCommandResult(commandsForSend[1], `"${unicodeValue}"`);
    // Verify that user can see R marker in command history
    await t.hover(workbenchPage.parametersAnchor);
    await t.expect(workbenchPage.rawModeIcon.exists).ok('Raw mode icon not displayed');
});
test
    .before(async t => {
        // Add new databases using API
        await acceptLicenseTerms();
        await addNewStandaloneDatabasesApi(databasesForAdding);
        // Reload Page
        await common.reloadPage();
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[0].databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    })
    .after(async() => {
        // Clear and delete database
        await deleteStandaloneDatabasesApi(databasesForAdding);
    })('Save Raw mode state', async t => {
        // Send command in raw mode
        await t.click(workbenchPage.rawModeBtn);
        await workbenchPage.sendCommandsArrayInWorkbench(commandsForSend);
        // Verify that user can see saved Raw mode state after page refresh
        await common.reloadPage();
        await workbenchPage.sendCommandInWorkbench(commandsForSend[1]);
        await workbenchPage.checkWorkbenchCommandResult(commandsForSend[1], `"${unicodeValue}"`);
        // Go to another database
        await t.click(myRedisDatabasePage.NavigationPanel.myRedisDBButton);
        await myRedisDatabasePage.clickOnDBByName(databasesForAdding[1].databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
        // Verify that user can see saved Raw mode state after re-connection to another DB
        await workbenchPage.sendCommandInWorkbench(commandsForSend[1]);
        await workbenchPage.checkWorkbenchCommandResult(commandsForSend[1], `"${unicodeValue}"`);
        // Verify that currently selected mode is applied when User re-run the command from history
        await t.click(workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssReRunCommandButton));
        await workbenchPage.checkWorkbenchCommandResult(commandsForSend[1], `"${unicodeValue}"`);
    });
test
    .before(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneRedisearch, ossStandaloneRedisearch.databaseName);
        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    })
    .after(async t => {
        // Drop index, documents and database
        await t.switchToMainWindow();
        await workbenchPage.sendCommandInWorkbench(`FT.DROPINDEX ${indexName} DD`);
        await deleteStandaloneDatabaseApi(ossStandaloneRedisearch);
    })('Display Raw mode for plugins', async t => {
        const commandsForSend = [
            `FT.CREATE ${indexName} ON HASH PREFIX 1 product: SCHEMA name TEXT`,
            `HMSET product:1 name "${unicodeValue}"`,
            `FT.SEARCH ${indexName} "${unicodeValue}"`
        ];
        // Send command in raw mode
        await t.click(workbenchPage.rawModeBtn);
        await workbenchPage.sendCommandsArrayInWorkbench(commandsForSend);
        // Check the FT.SEARCH result
        await t.switchToIframe(workbenchPage.iframe);
        const name = workbenchPage.queryTableResult.withText(unicodeValue);
        await t.expect(name.exists).ok('The added key name field is not converted to Unicode');
    });
