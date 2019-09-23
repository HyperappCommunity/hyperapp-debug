import * as logger from '../helpers/logger.js';

const log = logger.make('[devtool]');

const HandleMessages = (dispatch, types) => {
  const port = chrome.runtime.connect({ name: 'devtool' });
  log('HandleMessages.sub', port);

  const onMessage = (message) => {
    log('onMessage', message);
    const keys = [
      message.type,
      `${message.type}:${message.payload.action}`,
    ];

    const actionKey = keys.find(k => types[k]);
    let action = types[actionKey];

    if (action) {
      return dispatch(action, message.payload);
    }

    log('onMessage', 'unhandled', message);
  };

  port.onMessage.addListener(onMessage);

  const onRelayEvent = (event) => {
    log('HandleMessages.onRelayEvent', event);
    const message = event.detail;
    port.postMessage(message);
  };

  window.addEventListener('hyperapp-debug-relay', onRelayEvent, false);

  return () => {
    window.removeEventListener('hyperapp-debug-relay', onRelayEvent);
    port.disconnect();
  };
};

export const handleMessages = props => [HandleMessages, props];
