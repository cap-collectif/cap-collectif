// @flow

import React from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { renderSubSection } from './ProjectAdminStepForm';

const ProjectAdminSynthesisStepForm = () => (
  <>
    {renderSubSection('global.synthesis')}
    <FormattedMessage id="step.status.future" />
  </>
);

export default connect()(ProjectAdminSynthesisStepForm);
