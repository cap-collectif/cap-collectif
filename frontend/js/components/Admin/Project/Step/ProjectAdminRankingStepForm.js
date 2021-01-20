// @flow

import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Field } from 'redux-form';
import component from '~/components/Form/Field';
import { renderSubSection } from './ProjectAdminStepForm.utils';
import { ProjectSmallFieldsContainer } from '../Form/ProjectAdminForm.style';

export const ProjectAdminRankingStepForm = () => (
  <>
    {renderSubSection('ranking-preview')}
    <ProjectSmallFieldsContainer>
      <Field
        type="number"
        min={0}
        name="nbOpinionsToDisplay"
        id="step-nbOpinionsToDisplay"
        component={component}
        label={<FormattedMessage id="admin.fields.step.nb_opinions" />}
      />
      <Field
        type="number"
        min={0}
        name="nbVersionsToDisplay"
        id="step-nbVersionsToDisplay"
        component={component}
        label={<FormattedMessage id="admin.fields.step.nb_versions" />}
      />
    </ProjectSmallFieldsContainer>
  </>
);

export default connect()(ProjectAdminRankingStepForm);
