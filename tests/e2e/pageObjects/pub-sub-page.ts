import { t, Selector } from 'testcafe';
import { InstancePage } from './instance-page';

export class PubSubPage extends InstancePage {
    //CSS Selectors
    cssSelectorMessage = '[data-testid^=row]';
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    //COMPONENTS
    subscribeStatus = Selector('[data-testid=subscribe-status-text]');
    messages = Selector('[data-testid^=row]');
    totalMessagesCount = Selector('[data-testid=messages-count]');
    pubSubPageContainer = Selector('[data-testid=pub-sub-page]');
    clientBadge = Selector('[data-testid=affected-clients-badge]');
    clearButtonTooltip = Selector('.euiToolTipPopover');
    ossClusterEmptyMessage = Selector('[data-testid=empty-messages-list-cluster]');
    //BUTTONS
    subscribeButton = Selector('[data-testid=subscribe-btn]').withText('Subscribe');
    unsubscribeButton = Selector('[data-testid=subscribe-btn]').withText('Unsubscribe');
    publishButton = Selector('[data-testid=publish-message-submit]');
    clearPubSubButton = Selector('[data-testid=clear-pubsub-btn]');
    scrollDownButton = Selector('[data-testid=messages-list-anchor-btn]');
    //INPUTS
    channelNameInput = Selector('[data-testid=field-channel-name]');
    messageInput = Selector('[data-testid=field-message]');

    /**
     * Publish message in pubsub
     * @param channel The name of channel
     * @param message The message
     */
    async publishMessage(channel: string, message: string): Promise<void> {
        await t
            .click(this.channelNameInput)
            .typeText(this.channelNameInput, channel, { replace: true, paste: true })
            .click(this.messageInput)
            .typeText(this.messageInput, message, { replace: true, paste: true })
            .click(this.publishButton);
    }

    /**
     * Subscribe to channel and publish message in pubsub
     * @param channel The name of channel
     * @param message The message
     */
    async subsribeToChannelAndPublishMessage(channel: string, message: string): Promise<void> {
        await t.click(this.subscribeButton);
        await this.publishMessage(channel, message);
        await t.expect(this.pubSubPageContainer.find('[data-testid^=row]').withText('message').exists).ok('Message is not displayed');
    }
}
