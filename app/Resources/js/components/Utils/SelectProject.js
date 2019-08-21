// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import select from '../Form/Select';
import type { SelectProject_query } from '~relay/SelectProject_query.graphql';

type Props = {|
  +query: SelectProject_query,
  +intl: IntlShape,
  +multi: boolean,
  +clearable: boolean,
  +name: string,
  +label: string,
|};

export class SelectProject extends React.Component<Props> {
  static defaultProps = {
    multi: false,
    clearable: false,
    name: 'project',
    label: 'type-project',
  };

  render() {
    const { query, intl, multi, clearable, name, label } = this.props;
    const renderSelectedOption =
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
          name={name}
          placeholder={intl.formatMessage({ id: 'event.searchform.all_projects' })}
          label={intl.formatMessage({ id: label })}
          options={renderSelectedOption}
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="true"
          aria-controls="SelectProject-filter-project-listbox"
          multi={multi}
          clearable={clearable}
        />
      </div>
    );
  }
}

const container = injectIntl(SelectProject);

export default createFragmentContainer(container, {
  query: graphql`
    fragment SelectProject_query on Query
      @argumentDefinitions(withEventOnly: { type: "Boolean", defaultValue: false }) {
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
