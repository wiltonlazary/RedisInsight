import {Selector, t} from 'testcafe';
import { BrowserPage } from '../pageObjects';

const browserPage = new BrowserPage();

export class BrowserActions {
    /**
     * Check that all rendered keys on page has info displayed
     */
    async verifyAllRenderedKeysHasText(): Promise<void> {
        const keyListItems = browserPage.virtualTableContainer.find(browserPage.cssVirtualTableRow);
        // Take 1st, middle and last one rendered items for test
        const keysForTest = [keyListItems.nth(0), keyListItems.nth(Math.round(await keyListItems.count / 2)), keyListItems.nth(await keyListItems.count - 2)];

        // Verify that keys info in all columns is not empty
        for (const key of keysForTest) {
            const keyColumnsSelectors = [
                browserPage.cssSelectorKey,
                browserPage.cssKeyBadge,
                browserPage.cssKeyTtl,
                browserPage.cssKeySize
            ];

            for (const columnSelector of keyColumnsSelectors) {
                const keyRenderedName = await key.find(keyColumnsSelectors[0]).innerText;
                const listRenderedKeyInfo = await key.find(columnSelector).innerText;

                await t.expect(listRenderedKeyInfo).notEql('', `"${keyRenderedName}" Key has empty data`);
            }
        }
    }
    /**
     * Verify tooltip contains text
     * @param expectedText Expected link that is compared with actual
     * @param contains Should this tooltip contains or not contains text
     */
    async verifyTooltipContainsText(expectedText: string, contains: boolean): Promise<void> {
        contains
            ? await t.expect(browserPage.tooltip.textContent).contains(expectedText, `"${expectedText}" Text is incorrect in tooltip`)
            : await t.expect(browserPage.tooltip.textContent).notContains(expectedText, `Tooltip still contains text "${expectedText}"`);
    }
    /**
     * Verify that the new key is displayed at the top of the list of keys and opened and pre-selected in List view
     * */
    async verifyKeyDisplayedTopAndOpened(keyName: string): Promise<void> {
        await t.expect(Selector('[aria-rowindex="1"]').withText(keyName).visible).ok(`element with ${keyName} is not visible in the top of list`);
        await t.expect(browserPage.keyNameFormDetails.withText(keyName).visible).ok(`element with ${keyName} is not opened`);
    }
    /**
     * Verify that the new key is not displayed at the top of the list of keys and opened and pre-selected in List view
     * */
    async verifyKeyIsNotDisplayedTop(keyName: string): Promise<void> {
        await t.expect(Selector('[aria-rowindex="1"]').withText(keyName).exists).notOk(`element with ${keyName} is not visible in the top of list`);
    }
}
