// @flow
import React from 'react';
import { Field } from 'redux-form';
import { createFragmentContainer, fetchQuery_DEPRECATED, graphql } from 'react-relay';
import { type IntlShape, FormattedMessage } from 'react-intl';
import { useDisclosure } from '@liinkiing/react-hooks';
import renderComponent from '~/components/Form/Field';
import { type ProjectPublishAdminForm_project } from '~relay/ProjectPublishAdminForm_project.graphql';
import select from '~/components/Form/Select';
import environment from '~/createRelayEnvironment';
import {
  ProjectBoxHeader,
  ProjectSmallFieldsContainer,
  PermalinkWrapper,
  ProjectBoxContainer,
  UpdateSlugIcon,
} from '../Form/ProjectAdminForm.style';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import UpdateSlugModal from '~/components/Admin/Project/Publish/UpdateSlugModal';
import { ICON_NAME } from '~ds/Icon/Icon';
import Flex from '~ui/Primitives/Layout/Flex';

export type FormValues = {|
  publishedAt: string,
  locale: {|
    label: string,
    value: string,
  |},
  archived: boolean,
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
  return fetchQuery_DEPRECATED(environment, getLocaleOptions, {
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

export const ProjectPublishAdminForm = ({ project, intl }: Props) => {
  const hasFeatureMultilangue = useFeatureFlag('multilangue');
  const { isOpen, onOpen, onClose } = useDisclosure(false);
  return (
    <div className="col-md-12">
      <ProjectBoxContainer className="box container-fluid">
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
            {hasFeatureMultilangue && (
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
            )}
          </ProjectSmallFieldsContainer>
          <Field
            id="project-is-archived"
            type="checkbox"
            name="archived"
            component={renderComponent}>
            <FormattedMessage id="archive.project" />
          </Field>
          <Flex alignItems="center" mb={4}>
            <PermalinkWrapper>
              <strong>
                <FormattedMessage id="permalink" /> :
              </strong>{' '}
              <a href={project?.url} target="blank">
                {project?.url}
              </a>
            </PermalinkWrapper>
            <UpdateSlugIcon
              id="update-slug-icon"
              name={ICON_NAME.PENCIL}
              color="gray.500"
              onClick={onOpen}
            />
            <UpdateSlugModal
              show={isOpen}
              onClose={onClose}
              project={project}
              projectId={project?.id ?? ''}
              intl={intl}
            />
          </Flex>
        </div>
      </ProjectBoxContainer>
    </div>
  );
};

export default createFragmentContainer(ProjectPublishAdminForm, {
  project: graphql`
    fragment ProjectPublishAdminForm_project on Project {
      id
      publishedAt
      locale {
        value: id
        label: traductionKey
      }
      url
      archived
      ...UpdateSlugModal_project
    }
  `,
});
