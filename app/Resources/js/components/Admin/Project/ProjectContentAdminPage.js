// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import ProjectContentAdminForm from './ProjectContentAdminForm';

const ProjectContentAdminPage = () => (
  <div className="col-md-12">
    <form>
      <div className="box box-primary container-fluid">
        <div className="box-header">
          <h4 className="box-title">
            <FormattedMessage id="admin.group.content" />
          </h4>
        </div>
        <div className="box-content">
          <ProjectContentAdminForm formName="lol" />
        </div>
      </div>
    </form>
  </div>
);

export default ProjectContentAdminPage;
