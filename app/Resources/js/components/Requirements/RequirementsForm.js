// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import { reduxForm, Field, type FormProps } from 'redux-form';
import component from '../Form/Field';
import type { RequirementsForm_step } from './__generated__/RequirementsForm_step.graphql';
import UpdateRequirementMutation from '../../mutations/UpdateRequirementMutation';
import UpdateProfilePersonalDataMutation from '../../mutations/UpdateProfilePersonalDataMutation';

export const formName = 'requirements-form';

type Props = FormProps & {
  step: RequirementsForm_step,
};

const validate = (values, props: Props) => {
  const errors = {};
  if (!props.step.requirements.edges) {
    return errors;
  }
  for (const edge of props.step.requirements.edges) {
    if (edge) {
      const requirement = edge.node;
      if (!values[requirement.id]) {
        errors[requirement.id] = 'global.required';
      } else if (requirement.__typename === 'PhoneRequirement') {
        const phone = values[requirement.id];
        if (!/^[0-9]+$/.test(phone) || phone.length < 9 || phone.length > 10) {
          errors[requirement.id] = 'profile.constraints.phone.invalid';
        }
      }
    }
  }
  return errors;
};

let timeout = null;

const onChange = (values, dispatch, props, previousValues) => {
  Object.keys(values).forEach(element => {
    if (previousValues[element] !== values[element]) {
      const requirement = props.step.requirements.edges.filter(
        edge => edge.node && edge.node.id === element,
      )[0].node;
      const newValue = values[element];
      if (requirement.__typename === 'CheckboxRequirement') {
        return UpdateRequirementMutation.commit({
          input: {
            requirement: requirement.id,
            value: newValue,
          },
        }).then(() => {});
      }
      const input = {};
      if (requirement.__typename === 'FirstnameRequirement') {
        input.firstname = newValue;
      }
      if (requirement.__typename === 'LastnameRequirement') {
        input.lastname = newValue;
      }
      if (requirement.__typename === 'PhoneRequirement') {
        input.phone = `+33${newValue.charAt(0) === '0' ? newValue.substring(1) : newValue}`;
      }
      // $FlowFixMe
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        UpdateProfilePersonalDataMutation.commit({ input }).then(() => {});
      }, 1500);
    }
  });
};

const getLabel = (requirement: Object) => {
  if (requirement.__typename === 'FirstnameRequirement') {
    return <FormattedMessage id="form.label_firstname" />;
  }
  if (requirement.__typename === 'LastnameRequirement') {
    return <FormattedMessage id="group.title" />;
  }
  if (requirement.__typename === 'PhoneRequirement') {
    return <FormattedMessage id="mobile-phone" />;
  }
  return '';
};

const getType = (requirement: Object) => {
  if (requirement.__typename === 'CheckboxRequirement') {
    return 'checkbox';
  }
  return 'text';
};

export class RequirementsForm extends React.Component<Props> {
  render() {
    const { step } = this.props;
    return (
      <form>
        {step.requirements.edges &&
          step.requirements.edges
            .filter(Boolean)
            .map(edge => edge.node)
            .map(requirement => (
              <Field
                addonBefore={
                  requirement.__typename === 'PhoneRequirement' ? 'France +33' : undefined
                }
                divClassName={
                  requirement.__typename !== 'CheckboxRequirement'
                    ? 'col-sm-6 col-xs-12'
                    : 'col-sm-12 col-xs-12'
                }
                key={requirement.id}
                name={requirement.id}
                label={requirement.__typename !== 'CheckboxRequirement' && getLabel(requirement)}
                component={component}
                type={getType(requirement)}
                // id={"requirements_"+requirement.id}
              >
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
  enableReinitialize: true,
  form: formName,
})(RequirementsForm);

const mapStateToProps: MapStateToProps<*, *, *> = (state, { step }: Props) => ({
  initialValues: step.requirements.edges
    ? step.requirements.edges
        .filter(Boolean)
        .map(edge => edge.node)
        .reduce(
          (o, requirement) => ({
            ...o,
            [requirement.id]:
              typeof requirement.viewerValue !== 'undefined'
                ? requirement.viewerValue
                : requirement.viewerMeetsTheRequirement,
          }),
          {},
        )
    : {},
});

const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  step: graphql`
    fragment RequirementsForm_step on ProposalStep {
      requirements {
        edges {
          node {
            __typename
            id
            viewerMeetsTheRequirement
            ... on FirstnameRequirement {
              viewerValue
            }
            ... on LastnameRequirement {
              viewerValue
            }
            ... on PhoneRequirement {
              viewerValue
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
