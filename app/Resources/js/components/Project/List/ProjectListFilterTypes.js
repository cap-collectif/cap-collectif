// @flow
import React from 'react';
import { FormControl } from 'react-bootstrap';
import { FormattedMessage, type IntlShape, injectIntl } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { changeType } from '../../../redux/modules/project';
import type { GlobalState } from '../../../types';

type Props = {
  dispatch: Function,
  intl: IntlShape,
  type: ?string,
  projectTypes: any,
};

class ProjectsListFilterTypes extends React.Component<Props> {
  render() {
    const { type, projectTypes, intl, dispatch } = this.props;
    return (
      <FormControl
        id="project-type"
        componentClass="select"
        type="select"
        name="type"
        value={type}
        onChange={e => {
          dispatch(changeType(e.target.value));
        }}>
        <option key="all" value="">
          {intl.formatMessage({ id: 'global.select_project_types' })}
        </option>
        {projectTypes.map(projectType => (
          <FormattedMessage id={projectType.title} key={projectType.slug}>
            {message => <option value={projectType.id}>{message}</option>}
          </FormattedMessage>
        ))}
      </FormControl>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState) => ({
  type: state.project.type,
});

export default connect(mapStateToProps)(injectIntl(ProjectsListFilterTypes));
