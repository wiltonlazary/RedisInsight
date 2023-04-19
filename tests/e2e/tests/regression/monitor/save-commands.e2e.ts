import * as fs from 'fs';
import * as os from 'os';
import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { BrowserPage } from '../../../pageObjects';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';

const browserPage = new BrowserPage();
const tempDir = os.tmpdir();

fixture `Save commands`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that when clicks on “Reset Profiler” button he brought back to Profiler home screen', async t => {
    // Start Monitor without Save logs
    await browserPage.Profiler.startMonitor();
    // Remember the number of files in Temp
    const numberOfTempFiles = fs.readdirSync(tempDir).length;
    // Reset profiler
    await browserPage.Profiler.resetProfiler();
    //Check the screen
    await t.expect(browserPage.Profiler.monitorNotStartedElement.visible).ok('The Profiler home screen not appeared');
    await t.click(browserPage.Profiler.closeMonitor);
    // Start Monitor with Save logs
    await browserPage.Profiler.startMonitorWithSaveLog();
    // Reset profiler
    await browserPage.Profiler.resetProfiler();
    // Check the screen
    await t.expect(browserPage.Profiler.monitorNotStartedElement.visible).ok('The Profiler home screen not appeared');
    await t.expect(browserPage.Profiler.monitorIsStartedText.visible).notOk('The current Profiler session is not closed');
    // temporary Log file is deleted
    await t.expect(numberOfTempFiles).eql(fs.readdirSync(tempDir).length, 'The temporary Log file is not deleted');
});
test('Verify that when user clears the Profiler he doesn\'t brought back to Profiler home screen', async t => {
    // Start Monitor
    await browserPage.Profiler.startMonitor();
    // Clear monitor and check the view
    await t.click(browserPage.Profiler.clearMonitorButton);
    await t.expect(browserPage.Profiler.monitorNotStartedElement.visible).notOk('Profiler home screen is still opened after Clear');
    await t.click(browserPage.Profiler.closeMonitor);
    // Start Monitor with Save logs
    await browserPage.Profiler.startMonitorWithSaveLog();
    // Clear monitor and check the view
    await t.click(browserPage.Profiler.clearMonitorButton);
    await t.expect(browserPage.Profiler.monitorNotStartedElement.visible).notOk('Profiler home screen is still opened after Clear');
});
