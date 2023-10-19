import React from 'react'
import { Field } from 'redux-form'
import { createFragmentContainer, fetchQuery_DEPRECATED, graphql } from 'react-relay'
import type { IntlShape } from 'react-intl'
import { useIntl, FormattedMessage } from 'react-intl'
import { useDisclosure } from '@liinkiing/react-hooks'
import renderComponent from '~/components/Form/Field'
import type { ProjectPublishAdminForm_project } from '~relay/ProjectPublishAdminForm_project.graphql'
import '~relay/ProjectPublishAdminForm_project.graphql'
import select from '~/components/Form/Select'
import environment from '~/createRelayEnvironment'
import {
  ProjectBoxHeader,
  ProjectSmallFieldsContainer,
  PermalinkWrapper,
  ProjectBoxContainer,
  UpdateSlugIcon,
} from '../Form/ProjectAdminForm.style'
import useFeatureFlag from '~/utils/hooks/useFeatureFlag'
import UpdateSlugModal from '~/components/Admin/Project/Publish/UpdateSlugModal'
import { ICON_NAME } from '~ds/Icon/Icon'
import Flex from '~ui/Primitives/Layout/Flex'

export type FormValues = {
  publishedAt: string
  locale: {
    label: string
    value: string
  }
  archived: boolean
}
type Props = ReduxFormFormProps & {
  project: ProjectPublishAdminForm_project | null | undefined
  intl: IntlShape
}
const getLocaleOptions = graphql`
  query ProjectPublishAdminFormLocaleQuery {
    availableLocales(includeDisabled: false) {
      value: id
      label: traductionKey
    }
  }
`
export const loadLocaleOptions = (search: string | null | undefined) => {
  return fetchQuery_DEPRECATED(environment, getLocaleOptions, {
    title: search,
  }).then(data => {
    return data.availableLocales.map(u => ({
      value: u.value,
      label: <FormattedMessage id={u.label} />,
    }))
  })
}
export const validate = (props: FormValues) => {
  const { publishedAt } = props
  const errors: any = {}

  if (publishedAt === null) {
    errors.publishedAt = 'global.constraints.notBlank'
  }

  return errors
}
export const ProjectPublishAdminForm = ({ project }: Props) => {
  const hasFeatureMultilangue = useFeatureFlag('multilangue')
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const intl = useIntl()
  return (
    <div className="col-md-12">
      <ProjectBoxContainer className="box container-fluid">
        <ProjectBoxHeader>
          <h4>
            {intl.formatMessage({
              id: 'global.publication',
            })}
          </h4>
        </ProjectBoxHeader>
        <div className="box-content">
          <ProjectSmallFieldsContainer>
            <Field
              label={intl.formatMessage({
                id: 'global.date.text',
              })}
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
                label={intl.formatMessage({
                  id: 'form.label_locale',
                })}
                role="combobox"
                aria-autocomplete="list"
                aria-haspopup="true"
                loadOptions={loadLocaleOptions}
                placeholder={intl.formatMessage({
                  id: 'locale.all-locales',
                })}
              />
            )}
          </ProjectSmallFieldsContainer>
          <Field id="project-is-archived" type="checkbox" name="archived" component={renderComponent}>
            {intl.formatMessage({
              id: 'archive.project',
            })}
          </Field>
          <Flex alignItems="center" mb={4}>
            <PermalinkWrapper>
              <strong>
                {intl.formatMessage({
                  id: 'permalink',
                })}{' '}
                :
              </strong>{' '}
              <a href={project?.url} target="blank">
                {project?.url}
              </a>
            </PermalinkWrapper>
            <UpdateSlugIcon id="update-slug-icon" name={ICON_NAME.PENCIL} color="gray.500" onClick={onOpen} />
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
  )
}
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
})
