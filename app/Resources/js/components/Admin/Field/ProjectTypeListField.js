// @flow
import * as React from 'react';
import { Field } from 'redux-form';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { fetchQuery, graphql } from 'react-relay';

import select from '../../Form/Select';
import environment from '../../../createRelayEnvironment';

type Props = {
  intl: IntlShape,
};

type ProjectTypes = {
  id: string,
  title: string,
};

type ProjectTypesOptions = {
  value: string,
  label: string,
};

type State = {
  projectTypes: ProjectTypes[],
};

const getProjectTypeList = graphql`
  query ProjectTypeListFieldQuery {
    projectTypes {
      id
      title
    }
  }
`;

class ProjectTypeListField extends React.Component<Props, State> {
  state = { projectTypes: [] };

  componentDidMount() {
    fetchQuery(environment, getProjectTypeList, {}).then(data => {
      this.setState({ projectTypes: data.projectTypes });
    });
  }

  renderOptions(): ProjectTypesOptions[] {
    const { projectTypes } = this.state;
    const { intl } = this.props;

    if (projectTypes.length > 0) {
      return projectTypes.map(projectType => ({
        value: projectType.id,
        label: intl.formatMessage({ id: projectType.title }),
      }));
    }
    return [];
  }

  render() {
    return (
      <Field
        name="projectType"
        type="select"
        component={select}
        label={
          <span>
            <FormattedMessage id="admin.fields.project.opinion_term" />
          </span>
        }
        options={this.renderOptions()}
      />
    );
  }
}

export default injectIntl(ProjectTypeListField);
