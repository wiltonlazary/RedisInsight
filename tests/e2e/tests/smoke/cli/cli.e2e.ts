import { env, rte } from '../../../helpers/constants';
import { acceptTermsAddDatabaseOrConnectToRedisStack, deleteDatabase } from '../../../helpers/database';
import { MyRedisDatabasePage, BrowserPage } from '../../../pageObjects';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const browserPage = new BrowserPage();
const common = new Common();

let keyName = common.generateWord(10);

fixture `CLI`
    .meta({ type: 'smoke', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptTermsAddDatabaseOrConnectToRedisStack(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteDatabase(ossStandaloneConfig.databaseName);
    });
test
    .after(async() => {
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(ossStandaloneConfig.databaseName);
    })('Verify that user can add data via CLI', async t => {
        keyName = common.generateWord(10);
        // Open CLI
        await t.click(browserPage.Cli.cliExpandButton);
        // Verify that user can expand CLI
        await t.expect(browserPage.Cli.cliArea.exists).ok('CLI area is not displayed');
        await t.expect(browserPage.Cli.cliCommandInput.exists).ok('CLI input is not displayed');

        // Add key from CLI
        await t.typeText(browserPage.Cli.cliCommandInput, `SADD ${keyName} "chinese" "japanese" "german"`, { replace: true, paste: true });
        await t.pressKey('enter');
        // Check that the key is added
        await browserPage.searchByKeyName(keyName);
        const isKeyIsDisplayedInTheList = await browserPage.isKeyIsDisplayedInTheList(keyName);
        await t.expect(isKeyIsDisplayedInTheList).ok('The key is not added');
    });
test('Verify that user can use blocking command', async t => {
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Check that CLI is opened
    await t.expect(browserPage.Cli.cliArea.visible).ok('CLI area is not displayed');
    // Type blocking command
    await t.typeText(browserPage.Cli.cliCommandInput, 'blpop newKey 10000', { replace: true, paste: true });
    await t.pressKey('enter');
    // Verify that user input is blocked
    await t.expect(browserPage.Cli.cliCommandInput.exists).notOk('Cli input is still shown');

    // Collaple CLI
    await t.click(browserPage.Cli.cliCollapseButton);
    // Verify that user can collapse CLI
    await t.expect(browserPage.Cli.cliArea.visible).notOk('CLI area should still displayed');
});
test
    .meta({ env: env.web })('Verify that user can use unblocking command', async t => {
        // Open CLI
        await t.click(browserPage.Cli.cliExpandButton);
        // Get clientId
        await t.typeText(browserPage.Cli.cliCommandInput, 'client id');
        await t.pressKey('enter');
        const clientId = (await browserPage.Cli.cliOutputResponseSuccess.textContent).replace(/^\D+/g, '');
        // Type blocking command
        await t.typeText(browserPage.Cli.cliCommandInput, 'blpop newKey 10000', { replace: true, paste: true });
        await t.pressKey('enter');
        // Verify that user input is blocked
        await t.expect(browserPage.Cli.cliCommandInput.exists).notOk('Cli input is still shown');
        // Create new window to unblock the client
        await t
            .openWindow(commonUrl)
            .maximizeWindow();
        await myRedisDatabasePage.clickOnDBByName(ossStandaloneConfig.databaseName);
        // Open CLI
        await t.click(browserPage.Cli.cliExpandButton);
        // Unblock client
        await t.typeText(browserPage.Cli.cliCommandInput, `client unblock ${clientId}`, { replace: true, paste: true });
        await t.pressKey('enter');
        await t.closeWindow();
        await t.expect(browserPage.Cli.cliCommandInput.exists).ok('Cli input is not shown, the client still blocked', { timeout: 10000 });
    });
