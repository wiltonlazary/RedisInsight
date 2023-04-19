import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import {
    MyRedisDatabasePage,
    BrowserPage
} from '../../../pageObjects';
import { rte } from '../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';
import { verifySearchFilterValue } from '../../../helpers/keys';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const common = new Common();

let keyName = common.generateWord(10);

fixture `Browser Context`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that if user has saved context on Browser page and go to Settings page, Browser and Workbench icons are displayed and user is able to open Browser with saved context', async t => {
    keyName = common.generateWord(10);
    const command = 'HSET';
    // Create context modificaions and navigate to Settings
    await browserPage.addStringKey(keyName);
    await browserPage.openKeyDetails(keyName);
    await t.click(browserPage.Cli.cliExpandButton);
    await t.typeText(browserPage.Cli.cliCommandInput, command, { replace: true, paste: true });
    await t.pressKey('enter');
    await t.click(myRedisDatabasePage.NavigationPanel.settingsButton);
    // Verify that Browser and Workbench icons are displayed
    await t.expect(myRedisDatabasePage.NavigationPanel.browserButton.visible).ok('Browser icon is not displayed');
    await t.expect(myRedisDatabasePage.NavigationPanel.workbenchButton.visible).ok('Workbench icon is not displayed');
    // Open Browser page and verify context
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    await verifySearchFilterValue(keyName);
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).ok('The key details is not selected');
    await t.expect(browserPage.Cli.cliCommandExecuted.withExactText(command).exists).ok(`Executed command '${command}' in CLI is not saved`);
    await t.click(browserPage.Cli.cliCollapseButton);
});
test('Verify that when user reload the window with saved context(on any page), context is not saved when he returns back to Browser page', async t => {
    keyName = common.generateWord(10);
    // Create context modificaions and navigate to Workbench
    await browserPage.addStringKey(keyName);
    await browserPage.openKeyDetails(keyName);
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    // Open Browser page and verify context
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    await verifySearchFilterValue(keyName);
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).ok('The key details is not selected');
    // Navigate to Workbench and reload the window
    await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    await common.reloadPage();
    // Return back to Browser and check context is not saved
    await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
    await t.expect(browserPage.filterByPatterSearchInput.withAttribute('value', keyName).exists).notOk('Filter per key name is applied');
    await t.expect(browserPage.keyNameFormDetails.withExactText(keyName).exists).notOk('The key details is selected');
});
