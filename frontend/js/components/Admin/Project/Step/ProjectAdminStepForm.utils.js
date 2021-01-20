// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ProjectBoxHeader } from '../Form/ProjectAdminForm.style';

export const renderSubSection = (label: string) => (
  <ProjectBoxHeader>
    <h5>
      <FormattedMessage id={label} />
    </h5>
  </ProjectBoxHeader>
);
