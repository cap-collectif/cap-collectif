// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import select from '../Form/Select';
import type { SelectStep_query } from '~relay/SelectStep_query.graphql';

type Props = {|
  +query: SelectStep_query,
  +intl: IntlShape,
  +multi: boolean,
  +clearable: boolean,
  +name: string,
  +label: string,
  +optional: boolean,
  +disabled: boolean,
  +projectIds: Array<string>,
|};

const renderLabel = (intl: IntlShape, label: string, optional: boolean) => {
  const message = intl.formatMessage({ id: label });
  return optional ? (
    <div>
      {message}
      <div className="excerpt inline">{intl.formatMessage({ id: 'global.optional' })}</div>
    </div>
  ) : (
    message
  );
};
export const SelectStep = ({
  query,
  projectIds,
  intl,
  multi = false,
  clearable = false,
  name = 'step',
  label = 'step.select',
  optional = false,
  disabled = false,
}: Props) => {
  const getSteps = () => {
    const steps = [];
    (() =>
      query &&
      query.projects &&
      query.projects.edges &&
      query.projects.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .filter(Boolean)
        .map(node => {
          if (projectIds !== null && projectIds.length > 0) {
            return projectIds.includes(node.id) ? node.steps : null;
          }
          return node.steps;
        })
        .filter(Boolean)
        .forEach(projectSteps => {
          projectSteps.forEach(step => steps.push({ value: step.id, label: step.title }));
        }))();
    return steps;
  };

  return (
    <Field
      component={select}
      id="SelectStep-filter"
      name={name}
      placeholder={intl.formatMessage({ id: 'step.select' })}
      label={renderLabel(intl, label, optional)}
      options={getSteps()}
      role="combobox"
      aria-autocomplete="list"
      aria-haspopup="true"
      aria-controls="SelectStep-filter-listbox"
      multi={multi}
      clearable={clearable}
      disabled={disabled}
    />
  );
};

const container = injectIntl(SelectStep);

export default createFragmentContainer(container, {
  query: graphql`
    fragment SelectStep_query on Query
      @argumentDefinitions(withEventOnly: { type: "Boolean", defaultValue: false }) {
      projects(withEventOnly: $withEventOnly) {
        edges {
          node {
            id
            title
            steps {
              id
              title
            }
          }
        }
      }
    }
  `,
});
