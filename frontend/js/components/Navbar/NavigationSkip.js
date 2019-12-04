// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const NavigationSkip = () => (
  <div className="skip-links js-skip-links" role="banner">
    <div className="skip-links-container">
      <ul className="skip-links-list clearfix">
        <li>
          <a href="#navbar">
            <FormattedMessage id="navbar.skip_links.menu" />
          </a>
        </li>
        <li>
          <a href="#main">
            <FormattedMessage id="navbar.skip_links.content" />
          </a>
        </li>
      </ul>
    </div>
  </div>
);

export default NavigationSkip;
