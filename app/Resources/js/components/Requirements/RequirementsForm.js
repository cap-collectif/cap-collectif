// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import { reduxForm, Field, startSubmit, stopSubmit } from 'redux-form';
import { fetchQuery } from 'relay-runtime';
import component from '../Form/Field';
import UpdateRequirementMutation from '../../mutations/UpdateRequirementMutation';
import UpdateProfilePersonalDataMutation from '../../mutations/UpdateProfilePersonalDataMutation';
import type { Dispatch, State } from '../../types';
import DateDropdownPicker from '../Form/DateDropdownPicker';
import environment from '../../createRelayEnvironment';

export const formName = 'requirements-form';

// We can not use __generated__ relay flow type because it's wrong
type Requirement =
  | {
      +__typename: 'DateOfBirthRequirement',
      +id: string,
      +viewerMeetsTheRequirement: boolean,
      +viewerDateOfBirth: ?string,
    }
  | {
      +__typename: 'CheckboxRequirement',
      +id: string,
      +viewerMeetsTheRequirement: boolean,
      +label: string,
    }
  | {
      +__typename: 'FirstnameRequirement' | 'LastnameRequirement' | 'PhoneRequirement',
      +id: string,
      +viewerMeetsTheRequirement: boolean,
      +viewerValue: ?string,
    };

export type RequirementsForm_step = {|
  +requirements: {|
    +edges: ?$ReadOnlyArray<?{|
      +node: Requirement,
    |}>,
  |},
|};

type FormValues = { [key: string]: ?string | boolean };
type Props = {
  ...ReduxFormFormProps,
  stepId?: ?string,
  step: RequirementsForm_step,
  isAuthenticated: boolean,
};

const refetchViewer = graphql`
  query RequirementsForm_userQuery($stepId: ID!, $isAuthenticated: Boolean!) {
    step: node(id: $stepId) {
      ... on RequirementStep {
        requirements {
          viewerMeetsTheRequirements @include(if: $isAuthenticated)
        }
      }
    }
  }
`;

export const validate = (values: FormValues, props: Props) => {
  const errors = {};
  const { edges } = props.step.requirements;
  if (!edges) {
    return errors;
  }
  for (const edge of edges.filter(Boolean)) {
    const requirement = edge.node;
    if (!values[requirement.id]) {
      errors[requirement.id] = 'global.required';
    } else if (requirement.__typename === 'PhoneRequirement') {
      const phone = values[requirement.id];
      if (
        typeof phone === 'string' &&
        (!/^[0-9]+$/.test(phone) || phone.length < 9 || phone.length > 10)
      ) {
        errors[requirement.id] = 'profile.constraints.phone.invalid';
      }
    }
  }
  return errors;
};

const callApiTimeout: { [key: string]: TimeoutID } = {};

export const onChange = (
  values: FormValues,
  dispatch: Dispatch,
  props: Props,
  previousValues: FormValues,
): void => {
  Object.keys(values).forEach(element => {
    if (previousValues[element] !== values[element]) {
      const requirementEdge =
        props.step.requirements.edges &&
        props.step.requirements.edges.filter(
          edge => edge && edge.node && edge.node.id === element,
        )[0];
      if (!requirementEdge) {
        return;
      }
      const requirement = requirementEdge.node;

      // Check that the new phone value is valid
      if (
        requirement.__typename === 'PhoneRequirement' &&
        typeof validate(values, props)[requirement.id] !== 'undefined'
      ) {
        return;
      }

      dispatch(startSubmit(formName));
      const newValue = values[element];

      if (typeof newValue !== 'string') {
        if (requirement.__typename === 'CheckboxRequirement' && typeof newValue === 'boolean') {
          // The user just (un-)checked a box, so we can call our API directly
          return UpdateRequirementMutation.commit({
            input: {
              requirement: requirement.id,
              value: newValue,
            },
          }).then(() => {
            dispatch(stopSubmit(formName));
            if (props.stepId) {
              fetchQuery(environment, refetchViewer, {
                stepId: props.stepId,
                isAuthenticated: props.isAuthenticated,
              });
            }
          });
        }
        return;
      }
      const input = {};
      if (requirement.__typename === 'DateOfBirthRequirement') {
        input.dateOfBirth = newValue;
      }
      if (requirement.__typename === 'FirstnameRequirement') {
        input.firstname = newValue;
      }
      if (requirement.__typename === 'LastnameRequirement') {
        input.lastname = newValue;
      }
      if (requirement.__typename === 'PhoneRequirement') {
        input.phone = `+33${newValue.charAt(0) === '0' ? newValue.substring(1) : newValue}`;
      }

      // To handle realtime updates
      // we call the api after 1 second inactivity
      // on each updated field, using timeout
      const timeout = callApiTimeout[requirement.id];
      if (timeout) {
        clearTimeout(timeout);
      }
      callApiTimeout[requirement.id] = setTimeout(() => {
        UpdateProfilePersonalDataMutation.commit({ input }).then(() => {
          dispatch(stopSubmit(formName));
          if (props.stepId) {
            fetchQuery(environment, refetchViewer, {
              stepId: props.stepId,
              isAuthenticated: props.isAuthenticated,
            });
          }
        });
      }, 1000);
    }
  });
};

const getLabel = (requirement: Requirement) => {
  if (requirement.__typename === 'FirstnameRequirement') {
    return <FormattedMessage id="form.label_firstname" />;
  }
  if (requirement.__typename === 'LastnameRequirement') {
    return <FormattedMessage id='global.name' />;
  }
  if (requirement.__typename === 'PhoneRequirement') {
    return <FormattedMessage id="mobile-phone" />;
  }
  if (requirement.__typename === 'DateOfBirthRequirement') {
    return <FormattedMessage id="user.profile.edit.birthday" />;
  }
  return '';
};

const getFormProps = (requirement: Requirement) => {
  if (requirement.__typename === 'DateOfBirthRequirement') {
    return {
      component: DateDropdownPicker,
      globalClassName: 'col-sm-12 col-xs-12',
      divClassName: 'row',
    };
  }
  if (requirement.__typename === 'CheckboxRequirement') {
    return { component, type: 'checkbox', divClassName: 'col-sm-12 col-xs-12' };
  }
  return { component, type: 'text', divClassName: 'col-sm-12 col-xs-12' };
};

export class RequirementsForm extends React.Component<Props> {
  render() {
    const { step, submitting, submitSucceeded } = this.props;
    return (
      <form>
        <div className="col-sm-12 col-xs-12 alert__form_succeeded-message">
          {submitting ? (
            <div>
              <i
                className="cap cap-spinner"
                style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}
              />{' '}
              <FormattedMessage id="current-registration" />
            </div>
          ) : submitSucceeded ? (
            <div>
              <i className="cap cap-android-checkmark-circle" />{' '}
              <FormattedMessage id="global.saved" />
            </div>
          ) : null}
        </div>
        {step.requirements.edges &&
          step.requirements.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .map(requirement => (
              <Field
                addonBefore={
                  requirement.__typename === 'PhoneRequirement' ? 'France +33' : undefined
                }
                id={requirement.id}
                key={requirement.id}
                name={requirement.id}
                label={requirement.__typename !== 'CheckboxRequirement' && getLabel(requirement)}
                {...getFormProps(requirement)}>
                {requirement.__typename === 'CheckboxRequirement' ? requirement.label : null}
              </Field>
            ))}
      </form>
    );
  }
}

const form = reduxForm({
  onChange,
  validate,
  form: formName,
})(RequirementsForm);

const getRequirementInitialValue = (requirement: Requirement): ?string | boolean => {
  if (requirement.__typename === 'CheckboxRequirement') {
    return requirement.viewerMeetsTheRequirement;
  }
  if (requirement.__typename === 'PhoneRequirement') {
    return requirement.viewerValue ? requirement.viewerValue.replace('+33', '') : null;
  }
  if (requirement.__typename === 'DateOfBirthRequirement') {
    return requirement.viewerDateOfBirth;
  }

  return requirement.viewerValue;
};

const mapStateToProps = (state: State, { step }: Props) => ({
  isAuthenticated: !!state.user.user,
  initialValues: step.requirements.edges
    ? step.requirements.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .reduce(
          (initialValues, requirement) => ({
            ...initialValues,
            [requirement.id]: getRequirementInitialValue(requirement),
          }),
          {},
        )
    : {},
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  step: graphql`
    fragment RequirementsForm_step on RequirementStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      requirements {
        edges {
          node {
            __typename
            id
            viewerMeetsTheRequirement @include(if: $isAuthenticated)
            ... on DateOfBirthRequirement {
              viewerDateOfBirth @include(if: $isAuthenticated)
            }
            ... on FirstnameRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on LastnameRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on PhoneRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on CheckboxRequirement {
              label
            }
          }
        }
      }
    }
  `,
});
