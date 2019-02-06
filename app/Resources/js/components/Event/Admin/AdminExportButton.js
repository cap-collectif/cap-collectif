// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

export const AdminExportButton = () => (
  <div>
    <a id="export-events-button" className="mt-10 btn btn-default" href="/export-events-list">
      <FormattedMessage id="project.download.button" />
    </a>
  </div>
);

export default AdminExportButton;
