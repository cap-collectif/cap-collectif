// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { ProjectMetadataAdminAppQueryResponse } from '~relay/ProjectMetadataAdminAppQuery.graphql';
import ProjectMetadataAdminForm from '~/components/Admin/Project/ProjectMetadataAdminForm';

type Props = {|
  ...ProjectMetadataAdminAppQueryResponse,
|};

const ProjectMetadataAdminPage = (props: Props) => (
  <div className="col-md-6">
    <div className="box box-primary container-fluid">
      <div className="box-header">
        <h4 className="box-title">
          <FormattedMessage id="admin.fields.project.group_meta" />
        </h4>
      </div>
      <div className="box-content">
        <ProjectMetadataAdminForm {...props} />
      </div>
    </div>
  </div>
);

export default ProjectMetadataAdminPage;
