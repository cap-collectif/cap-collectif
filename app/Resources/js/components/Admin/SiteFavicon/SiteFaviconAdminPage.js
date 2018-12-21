// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const SiteFaviconAdminPage = () => (
  <div className="box box-primary container-fluid">
    <div className="box-header">
      <h3 className="box-title">
        <FormattedMessage id="website-icon" />
      </h3>
    </div>
    <div className="box-content" />
  </div>
);

export default SiteFaviconAdminPage;
