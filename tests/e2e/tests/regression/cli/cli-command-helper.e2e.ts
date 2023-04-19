import { acceptLicenseTermsAndAddDatabaseApi } from '../../../helpers/database';
import { Common } from '../../../helpers/common';
import {
    commonUrl,
    ossStandaloneConfig
} from '../../../helpers/conf';
import { env, rte } from '../../../helpers/constants';
import { deleteStandaloneDatabaseApi } from '../../../helpers/api/api-database';
import { BrowserPage } from '../../../pageObjects';

const common = new Common();
const browserPage = new BrowserPage();

let filteringGroup = '';
let filteringGroups: string[] = [];
let commandToCheck = '';
let commandsToCheck: string[] = [];
let commandArgumentsToCheck = '';
let commandsArgumentsToCheck: string[] = [];
let externalPageLink = '';
let externalPageLinks: string[] = [];

fixture `CLI Command helper`
    .meta({ type: 'regression', rte: rte.standalone })
    .page(commonUrl)
    .beforeEach(async() => {
        await acceptLicenseTermsAndAddDatabaseApi(ossStandaloneConfig, ossStandaloneConfig.databaseName);
    })
    .afterEach(async() => {
        // Delete database
        await deleteStandaloneDatabaseApi(ossStandaloneConfig);
    });
test('Verify that user can open/close CLI separately from Command Helper', async t => {
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Verify that CLI is opened separately
    await t.expect(browserPage.CommandHelper.commandHelperArea.visible).notOk('Command Helper is not closed');
    await t.expect(browserPage.Cli.cliCollapseButton.visible).ok('CLI is not opended');
    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Verify that user can close CLI separately
    await t.click(browserPage.Cli.cliCollapseButton);
    await t.expect(browserPage.CommandHelper.commandHelperArea.visible).ok('Command Helper is not displayed');
    await t.expect(browserPage.Cli.cliCollapseButton.visible).notOk('CLI is not closed');

    // Verify that user can open/close Command Helper separately from CLI
    await t.expect(browserPage.CommandHelper.commandHelperArea.visible).ok('Command Helper is not opened');
    await t.expect(browserPage.Cli.cliCollapseButton.visible).notOk('CLI is not closed');
    // Open CLI
    await t.click(browserPage.Cli.cliExpandButton);
    // Verify that Command Helper is closed separately
    await t.click(browserPage.CommandHelper.closeCommandHelperButton);
    await t.expect(browserPage.CommandHelper.commandHelperArea.visible).notOk('Command Helper is not closed');
    await t.expect(browserPage.Cli.cliCollapseButton.visible).ok('CLI is not opended');
});
test('Verify that user can see that Command Helper is minimized when he clicks the "minimize" button', async t => {
    const helperColourBefore = await common.getBackgroundColour(browserPage.CommandHelper.commandHelperBadge);
    // Open Command Helper and minimize
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    await t.click(browserPage.CommandHelper.minimizeCommandHelperButton);
    // Verify Command helper is minimized
    const helperColourAfter = await common.getBackgroundColour(browserPage.CommandHelper.commandHelperBadge);
    await t.expect(helperColourAfter).notEql(helperColourBefore, 'Command helper badge colour is not changed');
    await t.expect(browserPage.Cli.minimizeCliButton.visible).eql(false, 'Command helper is not mimized');
});
test('Verify that user can see that Command Helper displays the previous information when he re-opens it', async t => {
    filteringGroup = 'Search';
    commandToCheck = 'FT.EXPLAIN';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select one command from the list
    await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
    // Minimize and re-open Command Helper
    await t.click(browserPage.CommandHelper.minimizeCommandHelperButton);
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Verify Command helper information
    await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).contains(commandToCheck, 'Command Helper information not persists after reopening');
});
test
    .meta({ env: env.web })('Verify that user can see in Command helper and click on new group "JSON", can choose it and see list of commands in the group', async t => {
        filteringGroup = 'JSON';
        commandToCheck = 'JSON.SET';
        commandArgumentsToCheck = 'JSON.SET key path value [NX | XX]';
        externalPageLink = 'https://redis.io/commands/json.set/';

        // Open Command Helper
        await t.click(browserPage.CommandHelper.expandCommandHelperButton);
        // Select one command from the list
        await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
        await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
        // Verify results of opened command
        await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandArgumentsToCheck, 'Selected command title not correct');
        // Click on Read More link for selected command
        await t.click(browserPage.CommandHelper.readMoreButton);
        // Check new opened window page with the correct URL
        await common.checkURL(externalPageLink);
        await t.switchToParentWindow();
    });
test
    .meta({ env: env.web })('Verify that user can see in Command helper and click on new group "Search", can choose it and see list of commands in the group', async t => {
        filteringGroup = 'Search';
        commandToCheck = 'FT.EXPLAIN';
        commandArgumentsToCheck = 'FT.EXPLAIN index query [DIALECT dialect]';
        externalPageLink = 'https://redis.io/commands/ft.explain/';

        // Open Command Helper
        await t.click(browserPage.CommandHelper.expandCommandHelperButton);
        // Select one command from the list
        await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
        await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
        // Verify results of opened command
        await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandArgumentsToCheck, 'Selected command title not correct');
        // Click on Read More link for selected command
        await t.click(browserPage.CommandHelper.readMoreButton);
        // Check new opened window page with the correct URL
        await common.checkURL(externalPageLink);
        await t.switchToParentWindow();
    });
test
    .meta({ env: env.web })('Verify that user can see HyperLogLog title in Command Helper for this command group', async t => {
        filteringGroup = 'HyperLogLog';
        commandToCheck = 'PFCOUNT';
        commandArgumentsToCheck = 'PFCOUNT key [key ...]';
        externalPageLink = 'https://redis.io/commands/pfcount/';

        // Open Command Helper
        await t.click(browserPage.CommandHelper.expandCommandHelperButton);
        // Select one command from the list
        await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
        await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
        // Verify results of opened command
        await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandArgumentsToCheck, 'Selected command title not correct');
        // Click on Read More link for selected command
        await t.click(browserPage.CommandHelper.readMoreButton);
        // Check new opened window page with the correct URL
        await common.checkURL(externalPageLink);
        // await t.expect(getPageUrl()).eql(externalPageLink, 'The opened page');
        await t.switchToParentWindow();
    });
test
    .meta({ env: env.web })('Verify that user can see all separated groups for AI json file (model, tensor, inference, script)', async t => {
        filteringGroups = ['Model', 'Script', 'Inference', 'Tensor'];
        commandsToCheck = [
            'AI.MODELDEL',
            'AI.SCRIPTSTORE',
            'AI.SCRIPTEXECUTE',
            'AI.TENSORSET'
        ];
        commandsArgumentsToCheck = [
            'AI.MODELDEL key',
            'AI.SCRIPTSTORE key CPU | GPU [TAG] ENTRY_POINTS entry_point [entry_point ...]',
            'AI.SCRIPTEXECUTE key function [KEYS key [key ...]] [INPUTS input [input ...]] [ARGS arg [arg ...]] [OUTPUTS output [output ...]] [TIMEOUT]',
            'AI.TENSORSET key FLOAT | DOUBLE | INT8 | INT16 | INT32 | INT64 | UINT8 | UINT16 | STRING | BOOL shape [shape ...] [BLOB] [VALUES [VALUES ...]]'
        ];
        externalPageLinks = [
            'https://redis.io/commands/ai.modeldel',
            'https://redis.io/commands/ai.scriptstore',
            'https://redis.io/commands/ai.scriptexecute',
            'https://redis.io/commands/ai.tensorset'
        ];

        // Open Command Helper
        await t.click(browserPage.CommandHelper.expandCommandHelperButton);
        let i = 0;
        while (i < filteringGroups.length) {
            // Select one group from the list
            await browserPage.CommandHelper.selectFilterGroupType(filteringGroups[i]);
            // Click on the group
            await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandsToCheck[i]));
            // Verify results of opened command
            await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandsArgumentsToCheck[i], 'Selected command title not correct');
            // Click on Read More link for selected command
            await t.click(browserPage.CommandHelper.readMoreButton);
            // Check new opened window page with the correct URL
            await common.checkURL(externalPageLinks[i]);
            // Close the window with external link to switch to the application window
            await t.closeWindow();
            i++;
        }
    });
test
    .meta({ env: env.web })('Verify that user can work with Gears group in Command Helper (RedisGears module)', async t => {
        filteringGroup = 'Gears';
        commandToCheck = 'RG.GETEXECUTION';
        commandArgumentsToCheck = 'RG.GETEXECUTION id [SHARD | CLUSTER]';
        externalPageLink = 'https://redis.io/commands/rg.getexecution';

        // Open Command Helper
        await t.click(browserPage.CommandHelper.expandCommandHelperButton);
        // Verify that user can see Gears group in Command Helper (RedisGears module)
        await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
        // Select one command from the Gears list
        await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
        // Verify results of opened command
        await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandArgumentsToCheck, 'Selected command title not correct');
        // Verify that user can use Read More link for Gears group in Command Helper (RedisGears module)
        await t.click(browserPage.CommandHelper.readMoreButton);
        // Check new opened window page with the correct URL
        await common.checkURL(externalPageLink);
        // Close the window with external link to switch to the application window
        await t.closeWindow();
    });
test
    .meta({ env: env.web })('Verify that user can work with Bloom groups in Command Helper (RedisBloom module)', async t => {
        filteringGroups = ['Bloom Filter', 'CMS', 'TDigest', 'TopK', 'Cuckoo Filter'];
        commandsToCheck = [
            'BF.MEXISTS',
            'CMS.QUERY',
            'TDIGEST.RESET',
            'TOPK.LIST',
            'CF.ADD'
        ];
        commandsArgumentsToCheck = [
            'BF.MEXISTS key item [item ...]',
            'CMS.QUERY key item [item ...]',
            'TDIGEST.RESET key',
            'TOPK.LIST key [WITHCOUNT]',
            'CF.ADD key item'
        ];
        externalPageLinks = [
            'https://redis.io/commands/bf.mexists/',
            'https://redis.io/commands/cms.query/',
            'https://redis.io/commands/tdigest.reset/',
            'https://redis.io/commands/topk.list/',
            'https://redis.io/commands/cf.add/'
        ];

        // Open Command Helper
        await t.click(browserPage.CommandHelper.expandCommandHelperButton);
        let i = 0;
        while (i < filteringGroup.length) {
            // Verify that user can see Bloom, Cuckoo, CMS, TDigest, TopK groups in Command Helper (RedisBloom module)
            await browserPage.CommandHelper.selectFilterGroupType(filteringGroups[i]);
            // Click on the command
            await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandsToCheck[i]));
            // Verify results of opened command
            await t.expect(browserPage.CommandHelper.cliHelperTitleArgs.textContent).eql(commandsArgumentsToCheck[i], 'Selected command title not correct');
            // Verify that user can use Read More link for Bloom, Cuckoo, CMS, TDigest, TopK groups in Command Helper (RedisBloom module).
            await t.click(browserPage.CommandHelper.readMoreButton);
            // Check new opened window page with the correct URL
            await common.checkURL(externalPageLinks[i]);
            // Close the window with external link to switch to the application window
            await t.closeWindow();
            i++;
        }
    });
test('Verify that user can go back to list of commands for group in Command Helper', async t => {
    filteringGroup = 'Search';
    commandToCheck = 'FT.EXPLAIN';
    const commandForSearch = 'EXPLAIN';

    // Open Command Helper
    await t.click(browserPage.CommandHelper.expandCommandHelperButton);
    // Select one command from the list
    await t.typeText(browserPage.CommandHelper.cliHelperSearch, commandForSearch);
    await browserPage.CommandHelper.selectFilterGroupType(filteringGroup);
    // Remember found commands
    const commandsFilterCount = await browserPage.CommandHelper.cliHelperOutputTitles.count;
    const filteredCommands: string[] = [];
    for (let i = 0; i < commandsFilterCount; i++) {
        filteredCommands.push(await browserPage.CommandHelper.cliHelperOutputTitles.nth(i).textContent);
    }
    // Select command
    await t.click(browserPage.CommandHelper.cliHelperOutputTitles.withExactText(commandToCheck));
    // Click return button
    await t.click(browserPage.CommandHelper.returnToList);
    // Check that user returned to list with filter and search applied
    await browserPage.CommandHelper.checkCommandsInCommandHelper(filteredCommands);
    await t.expect(browserPage.CommandHelper.returnToList.exists).notOk('Return to list button still displayed');
});
