import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { WorkbenchPage, MyRedisDatabasePage } from '../../../pageObjects';
import { env, rte } from '../../../helpers/constants';
import { commonUrl, ossStandaloneConfig } from '../../../helpers/conf';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();

fixture `Workbench Auto-Execute button`
    .meta({ type: 'regression', rte: rte.standalone, env: env.web })
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    })
    .afterEach(async() => {
        // Clear and delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
// Test is skipped until Enablement area will be updated with auto-execute buttons
test.skip('Verify that when user clicks on auto-execute button, command is run', async t => {
    const command = 'INFO';
    // Verify that clicking on auto-executed button, command is not inserted to Editor
    await t.typeText(workbenchPage.queryInput, command, { replace: true, paste: true });
    // Verify that admin can use redis-auto format in .md file for Guides for auto-executed button
    await t.click(workbenchPage.documentButtonInQuickGuides);
    await t.click(workbenchPage.internalLinkWorkingWithHashes);
    await t.click(workbenchPage.preselectHashCreate);
    await t.expect(workbenchPage.queryInput.textContent).eql(command, 'Editor is changed');
    // Verify that admin can use redis-auto format in .md file for Tutorials for auto-executed button
    await t.click(workbenchPage.redisStackTutorialsButton);
    await t.click(workbenchPage.timeSeriesLink);
    // Verify that when user runs auto-executed commands, selected group mode setting is considered
    await t.click(workbenchPage.groupMode);
    // Verify that when user runs auto-executed commands, selected raw mode setting is considered
    await t.click(workbenchPage.rawModeBtn);
    await t.click(workbenchPage.redisStackTimeSeriesLoadMorePoints);
    // Verify that user can see auto-executed command result in command history
    const regExp = new RegExp('66[1-9] Command(s) - \d+ success, \d+ error(s)');
    await t.expect(workbenchPage.queryCardCommand.textContent).match(regExp, 'Not valid summary for group mode');
    await t.expect(workbenchPage.commandExecutionDateAndTime.find('span').withExactText('-r')).ok('Not valid summary for raw mode');
});
