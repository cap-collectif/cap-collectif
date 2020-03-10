// @flow
import React from 'react';
import { Field } from 'redux-form';
import {createFragmentContainer, fetchQuery, graphql} from 'react-relay';
import { type IntlShape, FormattedMessage } from 'react-intl';
import renderComponent from '~/components/Form/Field';
import { type ProjectPublishAdminForm_project } from '~relay/ProjectPublishAdminForm_project.graphql';
import { ProjectBoxHeader, ProjectSmallFieldsContainer } from '../Form/ProjectAdminForm.style';
import select from "~/components/Form/Select";
import environment from "~/createRelayEnvironment";

export type FormValues = {|
  publishedAt: string,
  locale: {|
    label: string,
    value: string
  |}
|};

type Props = {|
  ...ReduxFormFormProps,
  project: ?ProjectPublishAdminForm_project,
  intl: IntlShape,
|};

const getLocaleOptions = graphql`
  query ProjectPublishAdminFormLocaleQuery {
    availableLocales(includeDisabled: false) {
      value: id
      label: traductionKey      
    }
  }
`;

export const loadLocaleOptions = (search: ?string) => {
  return fetchQuery(environment, getLocaleOptions, {
    title: search,
  }).then(data => {
    return data.availableLocales.map(u => ({
      value: u.value,
      label: <FormattedMessage id={u.label} />,
    }));
  });
};

export const validate = (props: FormValues) => {
  const { publishedAt } = props;
  const errors = {};

  if (publishedAt === null) {
    errors.publishedAt = 'global.constraints.notBlank';
  }

  return errors;
};

export const ProjectPublishAdminForm = ({ project }: Props) => (
  <div className="col-md-12">
    <div className="box box-primary container-fluid">
      <ProjectBoxHeader>
        <h4>
          <FormattedMessage id="global.publication" />
        </h4>
      </ProjectBoxHeader>
      <div className="box-content">
        <ProjectSmallFieldsContainer>
          <Field
            label={<FormattedMessage id="global.date.text" />}
            id="project-publishedAt"
            name="publishedAt"
            type="datetime"
            component={renderComponent}
            addonAfter={<i className="cap-calendar-2" />}
          />
          <Field
            selectFieldIsObject
            autoload
            labelClassName="control-label"
            component={select}
            id="project-locale"
            name="locale"
            label={<FormattedMessage id="form.label_locale" />}
            role="combobox"
            aria-autocomplete="list"
            aria-haspopup="true"
            loadOptions={loadLocaleOptions}
            placeholder={<FormattedMessage id="locale.all-locales" />}
          />
        </ProjectSmallFieldsContainer>
        <p>
          <strong>
            <FormattedMessage id="permalink" /> :
          </strong>{' '}
          <a href={project?.url} target="blank">
            {project?.url}
          </a>
        </p>
      </div>
    </div>
  </div>
);

export default createFragmentContainer(ProjectPublishAdminForm, {
  project: graphql`
    fragment ProjectPublishAdminForm_project on Project @relay(mask: false) {
      publishedAt
      locale {
        value: id
        label: traductionKey
      }
      url
    }
  `,
});
