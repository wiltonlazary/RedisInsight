import { t } from 'testcafe';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { WorkbenchPage, MyRedisDatabasePage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const keyNameGraph = 'bikes_graph';

fixture `Redis Stack command in Workbench`
    .meta({type: 'regression', rte: rte.standalone})
    .page(commonUrl)
    .beforeEach(async t => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
    })
    .afterEach(async() => {
        // Drop key and database
        await t.switchToMainWindow();
        await workbenchPage.sendCommandInWorkbench(`GRAPH.DELETE ${keyNameGraph}`);
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
//skipped due the inaccessibility of the iframe
test.skip
    .meta({ env: env.desktop })('Verify that user can switches between Graph and Text for GRAPH command and see results corresponding to their views', async t => {
        // Send Graph command
        await t.click(workbenchPage.redisStackTutorialsButton);
        await t.click(workbenchPage.tutorialsWorkingWithGraphLink);
        await t.click(workbenchPage.createGraphBikeButton);
        await t.click(workbenchPage.submitCommandButton);
        // Switch to Text view and check result
        await workbenchPage.selectViewTypeText();
        await t.expect(workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).exists).ok('The text view is not switched for GRAPH command');
        // Switch to Graph view and check result
        await workbenchPage.selectViewTypeGraph();
        await t.switchToIframe(workbenchPage.iframe);
        await t.expect(workbenchPage.queryCardContainer.nth(0).find(workbenchPage.queryGraphContainer).exists).ok('The Graph view is not switched for GRAPH command');
    });
test
    .meta({ env: env.desktop })('Verify that user can see "No data to visualize" message for Graph command', async t => {
        // Send Graph command
        await t.click(workbenchPage.redisStackTutorialsButton);
        await t.click(workbenchPage.tutorialsWorkingWithGraphLink);
        await t.click(workbenchPage.preselectModelBikeSalesButton);
        await t.click(workbenchPage.submitCommandButton);
        // Check result
        await t.switchToIframe(workbenchPage.iframe);
        await t.expect(workbenchPage.responseInfo.textContent).eql('No data to visualize. Raw information is presented below.', 'The info message is not displayed for Graph');

        // Get result text content
        const graphModeText = await workbenchPage.parsedRedisReply.textContent;
        // Switch to Text view and check result
        await t.switchToMainWindow();
        await workbenchPage.selectViewTypeText();
        await t.expect(workbenchPage.queryTextResult.exists).ok('The result in text view is not displayed');
        // Verify that when there is nothing to visualize in RedisGraph, user can see: No data to visualize.{results from the text view}
        await t.expect(workbenchPage.queryTextResult.textContent).eql(graphModeText, 'Text of command in Graph mode is not the same as in Text mode');
    });
test('Verify that user can switches between Chart and Text for TimeSeries command and see results corresponding to their views', async t => {
    // Send TimeSeries command
    await t.click(workbenchPage.redisStackTutorialsButton);
    await t.click(workbenchPage.timeSeriesLink);
    await t.click(workbenchPage.showSalesPerRegiomButton);
    await t.click(workbenchPage.submitCommandButton);
    // Check result is in chart view
    await t.expect(workbenchPage.chartViewTypeOptionSelected.visible).ok('The chart view option is not selected by default');
    // Switch to Text view and check result
    await workbenchPage.selectViewTypeText();
    await t.expect(workbenchPage.queryCardContainer.nth(0).find(workbenchPage.cssQueryTextResult).exists).ok('The result in text view is not displayed');
});
