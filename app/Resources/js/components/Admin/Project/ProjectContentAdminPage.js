// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import ProjectContentAdminForm from './ProjectContentAdminForm';

type Props = {
  project: ?string,
};

const ProjectContentAdminPage = (props: Props) => (
  <div className="col-md-12">
    <div className="box box-primary container-fluid">
      <div className="box-header">
        <h4 className="box-title">
          <FormattedMessage id="admin.group.content" />
        </h4>
      </div>
      <div className="box-content">
        <ProjectContentAdminForm {...props} />
      </div>
    </div>
  </div>
);

export default ProjectContentAdminPage;
