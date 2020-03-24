// @flow

import React from 'react';
import { fetchQuery, graphql } from 'react-relay';
import { Field, FieldArray, arrayPush } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import select from '~/components/Form/Select';
import renderComponent from '~/components/Form/Field';
import environment from '~/createRelayEnvironment';
import { renderSubSection } from './ProjectAdminStepForm';
import StepRequirementsList, { getUId, type Requirement } from './StepRequirementsList';
import type { Dispatch } from '~/types';

type Props = {|
  requirements?: Array<Requirement>,
  dispatch: Dispatch,
  consultations: Array<{| label: string, value: string |}>,
|};

export const getAvailableConsultations = graphql`
  query ProjectAdminConsultationStepFormConsultationsQuery {
    availableConsultations {
      id
      title
    }
  }
`;

export const loadConsultationOptions = (
  initialConsultations: ?Array<{| label: string, value: string |}>,
) => {
  return fetchQuery(environment, getAvailableConsultations, {}).then(data => {
    const consultations = data.availableConsultations.map(c => ({
      value: c.id,
      label: c.title,
    }));
    if (initialConsultations?.length)
      initialConsultations.forEach(consultation => {
        if (!consultations.some(c => c.value === consultation.value))
          consultations.push(consultation);
      });
    return consultations;
  });
};

export const ProjectAdminConsultationStepForm = ({
  requirements,
  dispatch,
  consultations,
}: Props) => {
  return (
    <>
      {renderSubSection('global.consultation')}
      <Field
        selectFieldIsObject
        debounce
        autoload
        labelClassName="control-label"
        inputClassName="fake-inputClassName"
        component={select}
        multi
        name="consultations"
        id="step-consultations"
        placeholder=" "
        label={<FormattedMessage id="one-or-more-consultation-step" />}
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="true"
        loadOptions={() => loadConsultationOptions(consultations)}
        clearable
      />
      {renderSubSection('requirements')}
      <FieldArray
        name="requirements"
        component={StepRequirementsList}
        formName="stepForm"
        requirements={requirements}
      />
      <Button
        id="js-btn-create-step"
        bsStyle="primary"
        className="btn-outline-primary box-content__toolbar mb-20"
        onClick={() =>
          dispatch(
            arrayPush('stepForm', 'requirements', {
              uniqueId: getUId(),
              id: null,
              type: 'CHECKBOX',
            }),
          )
        }>
        <i className="fa fa-plus-circle" /> <FormattedMessage id="global.add" />
      </Button>
      <Field
        type="editor"
        name="requirementsReason"
        id="step-requirementsReason"
        label={<FormattedMessage id="reason-for-collection" />}
        component={renderComponent}
      />
    </>
  );
};

export default connect()(ProjectAdminConsultationStepForm);
