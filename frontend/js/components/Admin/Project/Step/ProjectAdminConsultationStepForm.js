// @flow

import React from 'react';
import { fetchQuery_DEPRECATED, graphql } from 'react-relay';
import { Field, FieldArray, arrayPush } from 'redux-form';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import select from '~/components/Form/Select';
import renderComponent from '~/components/Form/Field';
import environment from '~/createRelayEnvironment';
import { renderSubSection } from './ProjectAdminStepForm.utils';
import StepRequirementsList, { getUId, type Requirement } from './StepRequirementsList';
import type { Dispatch } from '~/types';
import { type FranceConnectAllowedData } from '~/components/Admin/Project/Step/ProjectAdminStepForm';

type Props = {|
  requirements?: Array<Requirement>,
  dispatch: Dispatch,
  consultations: Array<{| label: string, value: string |}>,
  fcAllowedData: FranceConnectAllowedData,
|};

export const getAvailableConsultations = graphql`
  query ProjectAdminConsultationStepFormConsultationsQuery($term: String) {
    availableConsultations(term: $term) {
      id
      title
    }
  }
`;

export const loadConsultationOptions = (
  initialConsultations: ?Array<{| label: string, value: string |}>,
  term: ?string,
) => {
  return fetchQuery_DEPRECATED(environment, getAvailableConsultations, {
    term: term === '' ? null : term,
  }).then(data => {
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
  fcAllowedData,
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
        defaultOptions
        cacheOptions
        loadOptions={term => loadConsultationOptions(consultations, term)}
        clearable
      />
      {renderSubSection('requirements')}
      <FieldArray
        name="requirements"
        component={StepRequirementsList}
        formName="stepForm"
        requirements={requirements}
        fcAllowedData={fcAllowedData}
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
        type="textarea"
        name="requirementsReason"
        id="step-requirementsReason"
        label={<FormattedMessage id="reason-for-collection" />}
        component={renderComponent}
      />
    </>
  );
};

export default connect<any, any, _, _, _, _>()(ProjectAdminConsultationStepForm);
