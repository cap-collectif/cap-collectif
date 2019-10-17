// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';

import type { ProjectAdminPageQueryResponse } from '~relay/ProjectAdminPageQuery.graphql';
import ProjectContentAdminForm, {
  container as ProjectContentAdminFormContainer,
} from './Content/ProjectContentAdminForm';

type Props = {|
  ...ProjectAdminPageQueryResponse,
  isEditMode: boolean,
|};

const ProjectAdminPageView = (props: Props) => (
  <div className="col-md-12">
    <div className="box box-primary container-fluid">
      <div className="box-header">
        <h4 className="box-title">
          <FormattedMessage id="admin.group.content" />
        </h4>
      </div>
      <div className="box-content">
        {props.isEditMode ? (
          <ProjectContentAdminForm {...props} />
        ) : (
          <ProjectContentAdminFormContainer />
        )}
      </div>
    </div>
  </div>
);

export default ProjectAdminPageView;
