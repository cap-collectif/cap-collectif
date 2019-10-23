// @flow
import React from 'react';
import { connect } from 'react-redux';
import type { ProjectExternalProjectAdminAppQueryResponse } from '~relay/ProjectExternalProjectAdminAppQuery.graphql';
import ProjectExternalProjectAdminForm from '~/components/Admin/Project/ProjectExternalProjectAdminForm';
import type { Dispatch, FeatureToggle, FeatureToggles } from '~/types';
import { toggleFeature } from '~/redux/modules/default';

type Props = {|
  features: FeatureToggles,
  ...ProjectExternalProjectAdminAppQueryResponse,
|};

export const ProjectExternalProjectAdminPage = (props: Props) => {
  const { features } = props;
  if (!features || !features.external_project) {
    return null;
  }

  return (
    <div className="col-md-12">
      <div className="box box-primary container-fluid">
        <div className="box-content">
          <ProjectExternalProjectAdminForm {...props} />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = state => ({
  features: state.default.features,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  onToggle: (feature: FeatureToggle, value: boolean) => {
    toggleFeature(dispatch, feature, value);
  },
});

const connector = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectExternalProjectAdminPage);

export default connector;
