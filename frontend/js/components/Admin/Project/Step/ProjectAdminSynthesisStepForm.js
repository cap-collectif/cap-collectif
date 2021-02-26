// @flow

import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { renderSubSection } from './ProjectAdminStepForm.utils';

export const ProjectAdminSynthesisStepForm = () => (
  <>
    {renderSubSection('global.synthesis')}
    <FormattedMessage id="step.status.future" />
  </>
);

export default connect<any, any, _, _, _, _>()(ProjectAdminSynthesisStepForm);
