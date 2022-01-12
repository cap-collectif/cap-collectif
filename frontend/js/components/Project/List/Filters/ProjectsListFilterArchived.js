// @flow
import React from 'react';
import {type IntlShape, useIntl} from 'react-intl';
import {Field} from 'redux-form';
import select from '../../../Form/Select';
import type {
  ProjectArchiveFilter,
} from '~relay/ProjectListViewRefetchQuery.graphql';

type Props = {
  intl: IntlShape,
  archived: ?string,
};

type ArchivedOptions = {|
  +value: ProjectArchiveFilter,
  +label: string
|}


const ProjectsListFilterArchived = ({ archived }: Props) => {
  const intl = useIntl();

  const options: ArchivedOptions[] = [
    { value: 'ARCHIVED', label: 'archived-projects' },
    { value: 'ACTIVE', label: 'active-projects' },
  ];

  return (
    <Field
      id="project-state"
      componentClass="select"
      component={select}
      clearable
      type="select"
      name="archived"
      parse={value => value === '' ? null : value }
      onChange={value => {
        if (value === 'ACTIVE' || value === null) {
          window.history.replaceState({}, '', '/projects')
        }
        else if(value === 'ARCHIVED') {
          window.history.replaceState({}, '', '/projects/archived')
        }
      }}
      value={archived}
      placeholder={intl.formatMessage({id: 'global.state'})}
      options={options.map(s => ({
        value: s.value,
        label: intl.formatMessage({id: s.label}),
      }))}
    />
  );
}

export default ProjectsListFilterArchived
