import React from 'react';
import { Provider } from '@kadira/storybook-ui';
import createChannel from '@kadira/storybook-channel-websocket';
import addons from '@kadira/storybook-addons';
import uuid from 'uuid';

export default class ReactProvider extends Provider {
  constructor({ url: domain, options }) {
    super();
    this.options = options;
    this.selection = null;
    this.channel = addons.getChannel();

    let url = domain;
    if (options.manualId) {
      const pairedId = uuid().substr(-6);

      this.pairedId = pairedId;
      url = domain + '/pairedId=' + this.pairedId;
    }

    if (!this.channel) {
      this.channel = createChannel({ url });
      addons.setChannel(this.channel);
    }
  }

  getPanels() {
    return addons.getPanels();
  }

  renderPreview(kind, story) {
    this.selection = { kind, story };
    this.channel.emit('setCurrentStory', { kind, story });
    const renderPreview = addons.getPreview();

    const innerPreview = renderPreview ? renderPreview(kind, story) :  null;

    if (this.options.manualId) {
      return (
        <div>
          Your ID: { this.pairedId }
          { innerPreview }
        </div>
      );
    }

    return innerPreview;
  }

  handleAPI(api) {
    api.onStory((kind, story) => {
      this.selection = { kind, story };
      this.channel.emit('setCurrentStory', this.selection);
    });
    this.channel.on('setStories', data => {
      api.setStories(data.stories);
    });
    this.channel.on('getCurrentStory', () => {
      this.channel.emit('setCurrentStory', this.selection);
    });
    this.channel.emit('getStories');
    addons.loadAddons(api);
  }
}
