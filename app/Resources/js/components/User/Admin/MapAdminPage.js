// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

const MapAdminPage = () => (
  <div className="box box-primary container-fluid">
    <div className="box-header">
      <h3 className="box-title">
        <FormattedMessage id="customize" />
      </h3>
    </div>
    <div className="box-content" />
  </div>
);

export default MapAdminPage;
