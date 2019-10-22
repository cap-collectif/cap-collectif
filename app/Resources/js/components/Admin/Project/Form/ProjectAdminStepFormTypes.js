// @flow
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { fetchQuery, graphql } from 'react-relay';
import { Field } from 'redux-form';

import select from '../../../Form/Select';
import environment from '../../../../createRelayEnvironment';
import type { ProjectAdminStepFormTypesQueryResponse } from '~relay/ProjectAdminStepFormTypesQuery.graphql';

const getAvailableProjectResources = graphql`
  query ProjectAdminStepFormTypesQuery {
    projectTypes {
      id
      title
      slug
    }
  }
`;

export function ProjectAdminStepFormTypes() {
  const [projectTypes, setProjectTypes] = useState([]);

  useEffect(() => {
    fetchQuery(environment, getAvailableProjectResources, {}).then(
      (result: ProjectAdminStepFormTypesQueryResponse) => {
        setProjectTypes(result.projectTypes || []);
      },
    );
  }, []);

  const renderOptions = projectTypes.map(pt => ({ value: pt.id, label: pt.title }));

  return (
    <Field
      component={select}
      id="project-types"
      name="types"
      placeholder="type"
      label="labeltypes"
      options={renderOptions}
      multi={false}
      clearable={false}
    />
  );
}

export default connect()(ProjectAdminStepFormTypes);
