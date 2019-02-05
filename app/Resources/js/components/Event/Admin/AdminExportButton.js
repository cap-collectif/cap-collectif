// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';

export const AdminExportButton = () => (
  <div>
    <a
      id="add-proposal-fusion"
      className="mt-10 btn btn-default"
      style={{ marginTop: 10 }}
      href="/export-events-list">
      <FormattedMessage id="project.download.button" />
    </a>
  </div>
);

export default AdminExportButton;
