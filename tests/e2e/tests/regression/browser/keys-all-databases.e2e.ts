import { Selector, t } from 'testcafe';
import { env, rte } from '../../../helpers/constants';
import {
    acceptLicenseTermsAndAddDatabaseApi,
    acceptLicenseTermsAndAddOSSClusterDatabase,
    acceptLicenseTermsAndAddRECloudDatabase,
    acceptLicenseTermsAndAddREClusterDatabase,
    acceptLicenseTermsAndAddSentinelDatabaseApi,
    deleteDatabase
} from '../../../helpers/database';
import { BrowserPage, MyRedisDatabasePage } from '../../../pageObjects';
import {
    cloudDatabaseConfig,
    commonUrl,
    ossClusterConfig,
    ossSentinelConfig,
    ossStandaloneBigConfig,
    redisEnterpriseClusterConfig
} from '../../../helpers/conf';
import { Common } from '../../../helpers/common';
import {
    deleteOSSClusterDatabaseApi,
    deleteStandaloneDatabaseApi,
    deleteAllDatabasesByConnectionTypeApi
} from '../../../helpers/api/api-database';
import { BrowserActions } from '../../../common-actions/browser-actions';

const browserPage = new BrowserPage();
const common = new Common();
const myRedisDatabasePage = new MyRedisDatabasePage();
const browserActions = new BrowserActions();

let keyName = common.generateWord(10);
const verifyKeysAdded = async(): Promise<void> => {
    keyName = common.generateWord(10);
    // Add Hash key
    await browserPage.addHashKey(keyName);
    // Check the notification message
    const notification = await browserPage.getMessageText();
    await t.expect(notification).contains('Key has been added', 'The notification not correct');
    // Check that new key is displayed in the list
    await browserPage.searchByKeyName(keyName);
    const keyNameInTheList = Selector(`[data-testid="key-${keyName}"]`);
    await common.waitForElementNotVisible(browserPage.loader);
    await t.expect(keyNameInTheList.exists).ok(`${keyName} key is not added`);
};

fixture `Work with keys in all types of databases`
    .meta({ type: 'regression' })
    .page(commonUrl);
test
    .meta({ rte: rte.reCluster })
    .before(async() => {
        await acceptLicenseTermsAndAddREClusterDatabase(redisEnterpriseClusterConfig);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can add Key in RE Cluster DB', async() => {
        await verifyKeysAdded();
    });
test
    .meta({ rte: rte.reCloud })
    .before(async() => {
        await acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that user can add Key in RE Cloud DB', async() => {
        await verifyKeysAdded();
    });
test
    .meta({ rte: rte.ossCluster })
    .before(async() => {
        await acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig, ossClusterConfig.ossClusterDatabaseName);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
    })('Verify that user can add Key in OSS Cluster DB', async() => {
        await verifyKeysAdded();
    });
test
    .meta({ env: env.web, rte: rte.sentinel })
    .before(async() => {
        await acceptLicenseTermsAndAddSentinelDatabaseApi(ossSentinelConfig);
    })
    .after(async() => {
        // Clear and delete database
        await browserPage.deleteKeyByName(keyName);
        await deleteAllDatabasesByConnectionTypeApi('SENTINEL');
    })('Verify that user can add Key in Sentinel Primary Group', async() => {
        await verifyKeysAdded();
    });
test
    .meta({ rte: rte.standalone })
    .before(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneBigConfig, ossStandaloneBigConfig.databaseName);
    })
    .after(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneBigConfig);
    })('Verify that user can scroll key virtualized table and see keys info displayed', async() => {
        const listItems = browserPage.virtualTableContainer.find(browserPage.cssVirtualTableRow);
        const maxNumberOfScrolls = 15;
        let numberOfScrolls = 0;

        // Scroll down the virtualized list 15 times
        while (numberOfScrolls < maxNumberOfScrolls) {
            const currentLastRenderedItemIndex = await listItems.count - 1;
            const currentLastRenderedItemText = await listItems.nth(currentLastRenderedItemIndex).find(browserPage.cssSelectorKey).innerText;
            const currentLastRenderedItem = listItems.withText(currentLastRenderedItemText);

            await t.scrollIntoView(currentLastRenderedItem);
            numberOfScrolls++;
            // Verify that last rendered item name is not empty
            await t.expect(currentLastRenderedItemText).notEql('', `"${currentLastRenderedItemText}" Key name is empty`);
        }

        // Verify that keys info in row not empty
        await browserActions.verifyAllRenderedKeysHasText();

        await t.click(browserPage.refreshKeysButton);
        // Verify that keys info in row not empty after refreshing page
        await browserActions.verifyAllRenderedKeysHasText();

        // Go to Workbench page
        await t.click(myRedisDatabasePage.NavigationPanel.workbenchButton);
        // Go to Browser Page
        await t.click(myRedisDatabasePage.NavigationPanel.browserButton);
        // Verify that keys info in row not empty after switching between pages
        await browserActions.verifyAllRenderedKeysHasText();
    });
