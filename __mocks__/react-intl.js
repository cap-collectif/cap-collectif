import React from 'react';
const Intl = jest.genMockFromModule('react-intl');

// Here goes intl context injected into component, feel free to extend
const intl = {
  // formatMessage: ({ defaultMessage }) => defaultMessage,
  locale: 'fr-FR',
  formats: {},
  messages: {},
  now: () => 0,
  // $FlowFixMe
  formatHTMLMessage: (message: string) => String(message),
  formatPlural: (message: string) => String(message),
  formatNumber: (message: string) => String(message),
  formatRelative: (message: string) => String(message),
  formatTime: (message: string) => String(message),
  formatDate: (message: string) => String(message),
  // $FlowFixMe
  formatMessage: (message: string) => String(message.id),
};

Intl.injectIntl = Node => {
  const renderWrapped = props => <Node {...props} intl={intl} />;
  renderWrapped.displayName = Node.displayName || Node.name || 'Component';
  return renderWrapped;
};

module.exports = Intl;
