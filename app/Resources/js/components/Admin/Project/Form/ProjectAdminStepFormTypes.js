// @flow
import React, { useState, useEffect } from 'react';
import { Field } from 'redux-form';
import { connect } from 'react-redux';
import { fetchQuery, graphql } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';

import select from '../../../Form/Select';
import environment from '../../../../createRelayEnvironment';
import type { ProjectAdminStepFormTypesQueryResponse } from '~relay/ProjectAdminStepFormTypesQuery.graphql';

const getAvailableProjectResources = graphql`
  query ProjectAdminStepFormTypesQuery {
    projectTypes {
      id
      title
    }
  }
`;

type Props = {|
  intl: IntlShape,
|};

export function ProjectAdminStepFormTypes(props: Props) {
  const [projectTypes, setProjectTypes] = useState<
    $PropertyType<ProjectAdminStepFormTypesQueryResponse, 'projectTypes'>,
  >([]);

  useEffect(() => {
    fetchQuery(environment, getAvailableProjectResources, {}).then(
      (result: ProjectAdminStepFormTypesQueryResponse) => {
        setProjectTypes(result.projectTypes);
      },
    );
  }, []);

  const renderOptions = projectTypes.map(pt => ({
    value: pt.id,
    label: props.intl.formatMessage({ id: pt.title }),
  }));

  const { intl } = props;
  return (
    <Field
      component={select}
      id="project-types"
      name="types"
      placeholder={intl.formatMessage({ id: 'choose.type.step' })}
      label={intl.formatMessage({ id: 'global.type' })}
      options={renderOptions}
      multi={false}
      clearable={false}
    />
  );
}

export default connect()(injectIntl(ProjectAdminStepFormTypes));
