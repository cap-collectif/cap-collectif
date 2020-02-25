// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Field, formValueSelector } from 'redux-form';
import { createFragmentContainer, graphql } from 'react-relay';
import { type IntlShape, FormattedMessage } from 'react-intl';
import renderComponent from '~/components/Form/Field';
import type { GlobalState } from '~/types';

import {
  type ProjectAccessAdminForm_project,
  type ProjectVisibility,
} from '~relay/ProjectAccessAdminForm_project.graphql';
import { ProjectBoxHeader, ProjectAccessContainer } from '../Form/ProjectAdminForm.style';

export type FormValues = {|
  visibility: ProjectVisibility,
|};

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectAccessAdminForm_project,
  intl: IntlShape,
  formName: string,
  visibility: ProjectVisibility,
|};

export const ProjectAccessAdminForm = ({ visibility }: Props) => (
  <div className="col-md-12">
    <div className="box box-primary container-fluid">
      <ProjectBoxHeader>
        <h4>
          <FormattedMessage id="admin.settings.header.access" />
        </h4>
      </ProjectBoxHeader>
      <div className="box-content ml-20">
        <ProjectAccessContainer>
          <Field
            component={renderComponent}
            id="project-visibility-ME"
            name="visibility"
            type="radio"
            value="ME"
            radioChecked={visibility === 'ME'}>
            <FormattedMessage id="myself-visibility-only-me" />
          </Field>
          <Field
            component={renderComponent}
            id="project-visibility-ADMIN"
            name="visibility"
            type="radio"
            value="ADMIN"
            radioChecked={visibility === 'ADMIN'}>
            <FormattedMessage id="global-administrators" />
          </Field>
          <Field
            component={renderComponent}
            id="project-visibility-PUBLIC"
            name="visibility"
            type="radio"
            value="PUBLIC"
            radioChecked={visibility === 'PUBLIC'}>
            <FormattedMessage id="public-everybody" />
          </Field>
          <Field
            component={renderComponent}
            id="project-visibility-CUSTOM"
            name="visibility"
            type="radio"
            value="CUSTOM"
            radioChecked={visibility === 'CUSTOM'}>
            <FormattedMessage id="global.custom.feminine" />
          </Field>
        </ProjectAccessContainer>
      </div>
    </div>
  </div>
);

const mapStateToProps = (state: GlobalState) => ({
  visibility: formValueSelector('projectAdminForm')(state, 'visibility'),
});

export const container = connect(mapStateToProps)(ProjectAccessAdminForm);

export default createFragmentContainer(container, {
  project: graphql`
    fragment ProjectAccessAdminForm_project on Project {
      visibility
    }
  `,
});
