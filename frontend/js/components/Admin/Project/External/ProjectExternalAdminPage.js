// @flow
import React from 'react';
import { connect } from 'react-redux';
import { type IntlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay';
import type { FeatureToggles } from '~/types';
import ProjectExternalAdminForm from '~/components/Admin/Project/External/ProjectExternalAdminForm';
import type { ProjectExternalAdminPage_project } from '~relay/ProjectExternalAdminPage_project.graphql';
import { ProjectBoxContainer } from '../Form/ProjectAdminForm.style';

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectExternalAdminPage_project,
  intl: IntlShape,
  formName: string,
  features: FeatureToggles,
|};

export const ProjectExternalAdminPage = ({ features, ...rest }: Props) => {
  if (!features.external_project) return null;
  return (
    <div className="col-md-12">
      <ProjectBoxContainer className="box container-fluid">
        <div className="box-content">
          <ProjectExternalAdminForm {...rest} />
        </div>
      </ProjectBoxContainer>
    </div>
  );
};

const mapStateToProps = state => ({
  features: state.default.features,
});

export default createFragmentContainer(connect(mapStateToProps)(ProjectExternalAdminPage), {
  project: graphql`
    fragment ProjectExternalAdminPage_project on Project {
      ...ProjectExternalAdminForm_project
    }
  `,
});
