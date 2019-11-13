// @flow
import React from 'react';
import { type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';

import ProjectExternalAdminForm from '~/components/Admin/Project/External/ProjectExternalAdminForm';
import type { ProjectExternalAdminPage_project } from '~relay/ProjectExternalAdminPage_project.graphql';

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectExternalAdminPage_project,
  intl: IntlShape,
  formName: string,
|};

export const ProjectExternalAdminPage = (props: Props) => {
  return (
    <div className="col-md-12">
      <div className="box box-primary container-fluid">
        <div className="box-content">
          <ProjectExternalAdminForm {...props} />
        </div>
      </div>
    </div>
  );
};

export default createFragmentContainer(ProjectExternalAdminPage, {
  project: graphql`
    fragment ProjectExternalAdminPage_project on Project {
      ...ProjectExternalAdminForm_project
    }
  `,
});
