// @flow
import * as React from 'react';
import { Field } from 'redux-form';
import { injectIntl, type IntlShape } from 'react-intl';
import { fetchQuery_DEPRECATED, graphql } from 'react-relay';

import select from '../../Form/Select';
import environment from '../../../createRelayEnvironment';

type Props = {|
  intl: IntlShape,
  optional?: boolean,
  placeholder?: string,
|};

type ProjectTypes = {|
  id: string,
  title: string,
|};

type ProjectTypesOptions = {|
  value: string,
  label: string,
|};

type State = {|
  projectTypes: ProjectTypes[],
|};

const getProjectTypeList = graphql`
  query ProjectTypeListFieldQuery {
    projectTypes {
      id
      title
    }
  }
`;

const renderLabel = (optional: boolean, intl: IntlShape) => {
  const message = intl.formatMessage({ id: 'global.type' });
  return optional ? (
    <div>
      {message}
      <span className="excerpt inline">{intl.formatMessage({ id: 'global.optional' })}</span>
    </div>
  ) : (
    message
  );
};

class ProjectTypeListField extends React.Component<Props, State> {
  state = { projectTypes: [] };

  componentDidMount() {
    fetchQuery_DEPRECATED(environment, getProjectTypeList, {}).then(data => {
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
    const { optional, intl, placeholder } = this.props;
    return (
      <Field
        name="projectType"
        type="select"
        component={select}
        placeholder={placeholder}
        label={renderLabel(optional || false, intl)}
        options={this.renderOptions()}
      />
    );
  }
}

export default injectIntl(ProjectTypeListField);
