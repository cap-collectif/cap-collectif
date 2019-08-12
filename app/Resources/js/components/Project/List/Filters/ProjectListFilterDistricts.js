// @flow
import React from 'react';
import { type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import select from '../../../Form/Select';
import type { ProjectListFiltersContainerQueryResponse } from '~relay/ProjectListFiltersContainerQuery.graphql';

type Props = {|
  +district: ?string,
  +intl: IntlShape,
  +projectDistricts: $PropertyType<ProjectListFiltersContainerQueryResponse, 'projectDistricts'>,
|};

export default class ProjectsListFilterDistricts extends React.Component<Props> {
  render() {
    const { district, projectDistricts, intl } = this.props;

    if (!projectDistricts.edges) {
      return null;
    }
    const edges = projectDistricts.edges.filter(Boolean);
    if (edges.length > 0) {
      return (
        <Field
          id="project-district"
          componentClass="select"
          component={select}
          clearable
          type="select"
          name="district"
          value={district}
          placeholder={intl.formatMessage({ id: 'global.select_districts' })}
          options={edges.map(edge => ({
            value: edge.node.id,
            label: edge.node.name,
            ariaLabel: edge.node.name,
          }))}
        />
      );
    }
    return null;
  }
}
