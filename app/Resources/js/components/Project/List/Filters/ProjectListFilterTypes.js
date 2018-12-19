// @flow
import React from 'react';
import { type IntlShape, injectIntl } from 'react-intl';
import { Field } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import type { GlobalState } from '../../../../types';
import { selector } from './ProjectListFilters';
import select from '../../../Form/Select';

type Props = {
  intl: IntlShape,
  type: ?string,
  projectTypes: any,
};

class ProjectsListFilterTypes extends React.Component<Props> {
  render() {
    const { type, projectTypes, intl } = this.props;
    if (projectTypes.length > 0) {
      return (
        <Field
          id="project-type"
          componentClass="select"
          component={select}
          clearable
          type="select"
          name="type"
          value={type}
          placeholder={intl.formatMessage({ id: 'project' })}
          options={projectTypes.map(p => ({
            value: p.id,
            label: intl.formatMessage({ id: p.title }),
          }))}
        />
      );
    }
    return null;
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  type: selector(state, 'type'),
});

export default connect(mapStateToProps)(injectIntl(ProjectsListFilterTypes));
