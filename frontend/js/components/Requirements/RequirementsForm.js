// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import { reduxForm, Field, startSubmit, stopSubmit } from 'redux-form';
import { fetchQuery_DEPRECATED } from 'relay-runtime';
import component from '../Form/Field';
import UpdateRequirementMutation from '../../mutations/UpdateRequirementMutation';
import UpdateProfilePersonalDataMutation from '../../mutations/UpdateProfilePersonalDataMutation';
import CheckIdentificationCodeMutation, {
  type CheckIdentificationCodeMutationResponse,
} from '../../mutations/CheckIdentificationCodeMutation';
import type { Dispatch, State } from '~/types';
import DateDropdownPicker from '../Form/DateDropdownPicker';
import environment from '../../createRelayEnvironment';

export const formName = 'requirements-form';

type GoogleMapsAddress = {
  json: string,
  formatted: string,
};

// We can not use __generated__ relay flow type because it's wrong
type Requirement =
  | {
      +__typename: 'DateOfBirthRequirement',
      +id: string,
      +viewerMeetsTheRequirement: boolean,
      +viewerDateOfBirth: ?string,
    }
  | {
      +__typename: 'PostalAddressRequirement',
      +id: string,
      +viewerMeetsTheRequirement: boolean,
      +viewerAddress: ?GoogleMapsAddress,
    }
  | {
      +__typename: 'CheckboxRequirement',
      +id: string,
      +viewerMeetsTheRequirement: boolean,
      +label: string,
    }
  | {
      +__typename:
        | 'FirstnameRequirement'
        | 'LastnameRequirement'
        | 'PhoneRequirement'
        | 'IdentificationCodeRequirement'
        | 'PhoneVerifiedRequirement'
        | 'FranceConnectRequirement',
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

export const refetchViewer = graphql`
  query RequirementsForm_userQuery($stepId: ID!, $isAuthenticated: Boolean!) {
    step: node(id: $stepId) {
      ... on RequirementStep {
        ...RequirementsForm_step @arguments(isAuthenticated: $isAuthenticated)
        requirements {
          viewerMeetsTheRequirements @include(if: $isAuthenticated)
        }
      }
    }
  }
`;

const callApiTimeout: { [key: string]: TimeoutID } = {};

const checkIdentificationCode = (identificationCode: string) =>
  CheckIdentificationCodeMutation.commit({ input: { identificationCode } }).then(
    (response: CheckIdentificationCodeMutationResponse) => {
      if (response.checkIdentificationCode?.errorCode) {
        return response.checkIdentificationCode.errorCode;
      }
    },
  );

const asyncValidate = (values: FormValues, dispatch: Dispatch, props: Props): Promise<*> => {
  return new Promise((resolve, reject) => {
    const requirementEdge =
      props.step.requirements.edges &&
      props.step.requirements.edges.filter(
        edge => edge?.node?.__typename === 'IdentificationCodeRequirement',
      )[0];
    if (!requirementEdge) {
      return Promise.resolve();
    }
    const requirement = requirementEdge.node;
    // cast as string, because, some code can be numbers only
    const newValue = String(values.IdentificationCodeRequirement).toUpperCase();
    // if viewer has code dont update the requirement
    if (requirement.viewerValue || newValue.length < 8) {
      return Promise.resolve();
    }
    if (!requirement.viewerValue && newValue.length >= 8) {
      return checkIdentificationCode(newValue).then(response => {
        if (response) {
          const errors = {};
          errors.IdentificationCodeRequirement = response;
          reject(errors);
        } else {
          dispatch(startSubmit(formName));
          return UpdateProfilePersonalDataMutation.commit({
            input: { userIdentificationCode: newValue },
          }).then(() => {
            if (props.stepId) {
              fetchQuery_DEPRECATED(environment, refetchViewer, {
                stepId: props.stepId,
                isAuthenticated: props.isAuthenticated,
              });
            }
            dispatch(stopSubmit(formName));
          });
        }
      });
    }
    Promise.resolve();
  });
};

export const validate = (values: FormValues, props: Props) => {
  const errors = {};
  const { edges } = props.step.requirements;
  if (!edges) {
    return errors;
  }
  for (const edge of edges.filter(Boolean)) {
    const requirement = edge.node;
    if (!values[requirement.id]) {
      const fieldName =
        requirement.__typename === 'PostalAddressRequirement'
          ? 'PostalAddressText'
          : requirement.id;
      errors[fieldName] = 'global.required';
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
        props.step.requirements.edges?.filter(edge => edge?.node?.id === element).length > 0
          ? props.step.requirements.edges?.find(edge => edge?.node?.id === element)
          : props.step.requirements.edges?.find(edge => edge?.node?.__typename === element);
      if (!requirementEdge) {
        return;
      }
      const requirement = requirementEdge.node;
      const newValue = values[element];
      // Check that the new phone value is valid
      if (
        requirement.__typename === 'PhoneRequirement' &&
        typeof validate(values, props)[requirement.id] !== 'undefined'
      ) {
        return;
      }

      if (typeof newValue !== 'string') {
        if (requirement.__typename === 'CheckboxRequirement' && typeof newValue === 'boolean') {
          // The user just (un-)checked a box, so we can call our API directly
          dispatch(startSubmit(formName));

          return UpdateRequirementMutation.commit({
            input: {
              requirement: requirement.id,
              value: newValue,
            },
          }).then(() => {
            dispatch(stopSubmit(formName));

            if (props.stepId) {
              fetchQuery_DEPRECATED(environment, refetchViewer, {
                stepId: props.stepId,
                isAuthenticated: props.isAuthenticated,
              });
            }
          });
        }
        return;
      }
      // skip identificationCode, the update is in asyncValidate
      if (requirement.__typename === 'IdentificationCodeRequirement') {
        return;
      }
      const input = {};
      if (requirement.__typename === 'DateOfBirthRequirement') {
        input.dateOfBirth = newValue;
      }
      if (requirement.__typename === 'PostalAddressRequirement') {
        input.postalAddress = newValue;
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

      if (Object.keys(input).length < 1) {
        return;
      }
      // To handle realtime updates
      // we call the api after 1 second inactivity
      // on each updated field, using timeout
      const timeout = callApiTimeout[requirement.id];
      if (timeout) {
        clearTimeout(timeout);
      }
      dispatch(startSubmit(formName));

      callApiTimeout[requirement.id] = setTimeout(() => {
        UpdateProfilePersonalDataMutation.commit({ input }).then(() => {
          dispatch(stopSubmit(formName));
          if (props.stepId) {
            fetchQuery_DEPRECATED(environment, refetchViewer, {
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
    return <FormattedMessage id="global.name" />;
  }
  if (requirement.__typename === 'PhoneRequirement') {
    return <FormattedMessage id="mobile-phone" />;
  }
  if (requirement.__typename === 'DateOfBirthRequirement') {
    return <FormattedMessage id="form.label_date_of_birth" />;
  }
  if (requirement.__typename === 'PostalAddressRequirement') {
    return <FormattedMessage id="admin.fields.event.address" />;
  }
  if (requirement.__typename === 'IdentificationCodeRequirement') {
    return <FormattedMessage id="identification_code" />;
  }
  if (requirement.__typename === 'FranceConnectRequirement') {
    return <FormattedMessage id="france_connect" />;
  }
  if (requirement.__typename === 'PhoneVerifiedRequirement') {
    return <FormattedMessage id="verify.number.sms" />;
  }
  return '';
};

const getFormProps = (requirement: Requirement, change: any) => {
  if (requirement.__typename === 'DateOfBirthRequirement') {
    return {
      component: DateDropdownPicker,
      globalClassName: 'col-sm-12 col-xs-12',
      divClassName: 'row',
    };
  }
  if (requirement.__typename === 'PostalAddressRequirement') {
    return {
      component,
      type: 'address',
      divClassName: 'col-sm-12 col-xs-12',
      addressProps: {
        getAddress: addressComplete => change(requirement.id, JSON.stringify([addressComplete])),
      },
    };
  }
  if (requirement.__typename === 'CheckboxRequirement') {
    return { component, type: 'checkbox', divClassName: 'col-sm-12 col-xs-12' };
  }
  return { component, type: 'text', divClassName: 'col-sm-12 col-xs-12' };
};

export class RequirementsForm extends React.Component<Props> {
  render() {
    const { step, submitting, submitSucceeded, change } = this.props;
    const requirements = step.requirements?.edges
      ?.filter(Boolean)
      .map(edge => edge.node)
      .filter(requirement => requirement.__typename !== 'PhoneVerifiedRequirement');
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
        {requirements &&
          requirements.length > 0 &&
          requirements.map(requirement => {
            return (
              <Field
                addonBefore={
                  requirement.__typename === 'PhoneRequirement' ? 'France +33' : undefined
                }
                minlength={
                  requirement.__typename === 'IdentificationCodeRequirement' ? 8 : undefined
                }
                id={
                  requirement.__typename === 'IdentificationCodeRequirement'
                    ? 'IdentificationCodeRequirement'
                    : requirement.id
                }
                key={requirement.id}
                disabled={
                  requirement.__typename === 'IdentificationCodeRequirement' &&
                  requirement.viewerValue
                }
                placeholder={
                  requirement.__typename === 'IdentificationCodeRequirement' &&
                  !requirement.viewerValue
                    ? 'Ex: 25FOVC10'
                    : null
                }
                name={
                  requirement.__typename === 'PostalAddressRequirement'
                    ? 'PostalAddressText'
                    : requirement.__typename === 'IdentificationCodeRequirement'
                    ? 'IdentificationCodeRequirement'
                    : requirement.id
                }
                label={requirement.__typename !== 'CheckboxRequirement' && getLabel(requirement)}
                {...getFormProps(requirement, change)}>
                {requirement.__typename === 'CheckboxRequirement' ? requirement.label : null}
              </Field>
            );
          })}
      </form>
    );
  }
}

const form = reduxForm({
  onChange,
  validate,
  asyncValidate,
  asyncChangeFields: ['IdentificationCodeRequirement'],
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
  if (requirement.__typename === 'PostalAddressRequirement') {
    return requirement.viewerAddress ? requirement.viewerAddress.json : null;
  }
  return requirement.viewerValue;
};

const mapStateToProps = (state: State, { step }: Props) => ({
  isAuthenticated: !!state.user.user,
  initialValues: step.requirements.edges
    ? step.requirements.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .reduce((initialValues, requirement) => {
          if (requirement.__typename === 'PostalAddressRequirement') {
            return {
              ...initialValues,
              PostalAddressText: requirement.viewerAddress
                ? requirement.viewerAddress.formatted
                : null,
              [requirement.id]: getRequirementInitialValue(requirement),
            };
          }
          if (requirement.__typename === 'IdentificationCodeRequirement') {
            return {
              ...initialValues,
              IdentificationCodeRequirement: requirement.viewerValue
                ? requirement.viewerValue
                : null,
              [requirement.id]: getRequirementInitialValue(requirement),
            };
          }
          return {
            ...initialValues,
            [requirement.id]: getRequirementInitialValue(requirement),
          };
        }, {})
    : {},
});

const container = connect<any, any, _, _, _, _>(mapStateToProps)(form);

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
            ... on PostalAddressRequirement {
              viewerAddress @include(if: $isAuthenticated) {
                formatted
                json
              }
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
            ... on IdentificationCodeRequirement {
              viewerValue @include(if: $isAuthenticated)
            }
            ... on FranceConnectRequirement {
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
