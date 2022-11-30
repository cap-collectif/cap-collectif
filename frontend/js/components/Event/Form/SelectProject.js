// @flow
import React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl, type IntlShape } from 'react-intl';
import { Field } from 'redux-form';
import select from '../../Form/Select';
import type { SelectProject_projectOwner$key } from '~relay/SelectProject_projectOwner.graphql';

type Props = {|
  +projectOwner: SelectProject_projectOwner$key,
  +multi: boolean,
  +clearable: boolean,
  +name: string,
  +label: string,
  +optional: boolean,
  +placeholder?: string,
  +disabled: boolean,
|};
const FRAGMENT = graphql`
  fragment SelectProject_projectOwner on ProjectOwner
  @argumentDefinitions(affiliations: { type: "[ProjectAffiliation!]" }) {
    projects(affiliations: $affiliations) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

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

const SelectProject = ({
  projectOwner,
  multi = false,
  clearable = false,
  name = 'project',
  label = 'global.project',
  optional = false,
  placeholder,
  disabled = false,
}: Props) => {
  const { projects } = useFragment(FRAGMENT, projectOwner);
  const intl = useIntl();
  const renderSelectedOption =
    projects && projects.edges
      ? projects.edges
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
        placeholder={intl.formatMessage({
          id: placeholder ?? 'global.all.projects',
        })}
        label={renderLabel(intl, label, optional)}
        options={renderSelectedOption}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="true"
        aria-controls="SelectProject-filter-project-listbox"
        multi={multi}
        clearable={clearable}
        disabled={disabled}
      />
    </div>
  );
};

export default SelectProject;
