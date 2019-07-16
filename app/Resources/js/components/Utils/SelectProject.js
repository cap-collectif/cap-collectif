// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import select from '../Form/Select';
import type { SelectProject_query } from '~relay/SelectProject_query.graphql';

type Props = {|
  query: SelectProject_query,
  intl: IntlShape,
|};

export class SelectProject extends React.Component<Props> {
  render() {
    const { query, intl } = this.props;
    const renderOptions =
      query && query.projects && query.projects.edges
        ? query.projects.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .filter(Boolean)
            .map(node => ({ value: node.id, label: node.title }))
        : [];

    return (
      <div>
        <Field
          component={select}
          id="SelectProject-filter-project"
          name="project"
          placeholder={intl.formatMessage({ id: 'project.searchform.all_projects' })}
          label={intl.formatMessage({ id: 'type-project' })}
          options={renderOptions}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-controls="SelectProject-filter-project-listbox"
        />
      </div>
    );
  }
}

const container = injectIntl(SelectProject);

export default createFragmentContainer(container, {
  query: graphql`
    fragment SelectProject_query on Query @argumentDefinitions(withEventOnly: { type: "Boolean" }) {
      projects(withEventOnly: $withEventOnly) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `,
});
