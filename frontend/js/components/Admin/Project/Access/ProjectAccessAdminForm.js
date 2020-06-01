// @flow
import React from 'react';
import { connect } from 'react-redux';
import { Field, formValueSelector } from 'redux-form';
import { createFragmentContainer, graphql, fetchQuery } from 'react-relay';
import { type IntlShape, FormattedMessage } from 'react-intl';
import renderComponent from '~/components/Form/Field';
import type { GlobalState } from '~/types';
import environment from '~/createRelayEnvironment';
import select from '~/components/Form/Select';

import {
  type ProjectAccessAdminForm_project,
  type ProjectVisibility,
} from '~relay/ProjectAccessAdminForm_project.graphql';
import {
  ProjectBoxHeader,
  ProjectAccessContainer,
  ProjectBoxContainer,
} from '../Form/ProjectAdminForm.style';

export type FormValues = {|
  visibility: ProjectVisibility,
  restrictedViewerGroups: Array<{| label: string, value: string |}>,
|};

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectAccessAdminForm_project,
  intl: IntlShape,
  formName: string,
  visibility: ProjectVisibility,
  initialGroups: Array<{| label: string, value: string |}>,
|};

export const getGroups = graphql`
  query ProjectAccessAdminFormGroupsQuery {
    groups {
      id
      title
    }
  }
`;

export const loadGroupOptions = (initialGroups: ?Array<{| label: string, value: string |}>) => {
  return fetchQuery(environment, getGroups, {}).then(data => {
    const groups = data.groups.map(c => ({
      value: c.id,
      label: c.title,
    }));
    if (initialGroups?.length)
      initialGroups.forEach(consultation => {
        if (!groups.some(c => c.value === consultation.value)) groups.push(consultation);
      });
    return groups;
  });
};

export const ProjectAccessAdminForm = ({ visibility, initialGroups }: Props) => (
  <div className="col-md-12">
    <ProjectBoxContainer className="box container-fluid">
      <ProjectBoxHeader>
        <h4>
          <FormattedMessage id="admin.settings.header.access" />
        </h4>
      </ProjectBoxHeader>
      <div className="box-content">
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
        {visibility === 'CUSTOM' && (
          <Field
            selectFieldIsObject
            debounce
            autoload
            labelClassName="control-label"
            inputClassName="fake-inputClassName"
            component={select}
            multi
            name="restrictedViewerGroups"
            id="project-restrictedViewerGroups"
            placeholder=" "
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="true"
            loadOptions={() => loadGroupOptions(initialGroups)}
            clearable
          />
        )}
      </div>
    </ProjectBoxContainer>
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
