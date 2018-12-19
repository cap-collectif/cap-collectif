// @flow
import React from 'react';
import { type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import select from '../../../Form/Select';
import { PROJECT_STATUSES, type ProjectType } from '../../../../constants/ProjectStatusConstants';

type Props = {
  intl: IntlShape,
  status: ?string,
};

export default class ProjectsListFilterStatus extends React.Component<Props> {
  render() {
    const { status, intl } = this.props;
    const statuses: ProjectType[] = PROJECT_STATUSES;
    if (statuses.length > 0) {
      return (
        <Field
          id="project-status"
          componentClass="select"
          component={select}
          clearable
          type="select"
          name="status"
          value={status}
          placeholder={intl.formatMessage({ id: 'admin.fields.proposal.status' })}
          options={statuses.map(s => ({
            value: s.id,
            label: intl.formatMessage({ id: s.title }),
          }))}
        />
      );
    }
    return null;
  }
}
