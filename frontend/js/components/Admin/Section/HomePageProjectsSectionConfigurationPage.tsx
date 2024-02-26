import React from 'react'
import { connect } from 'react-redux'
import { Field, formValueSelector, reduxForm } from 'redux-form'
import { createFragmentContainer, graphql } from 'react-relay'
import type { IntlShape } from 'react-intl'
import { injectIntl } from 'react-intl'
import * as S from './HomePageProjectsSectionConfigurationPage.style'
import renderComponent from '~/components/Form/Field'
import type { Dispatch, GlobalState } from '~/types'
import Button from '~ds/Button/Button'
import UpdateHomePageProjectsSectionConfigurationMutation
  from '~/mutations/UpdateHomePageProjectsSectionConfigurationMutation'
import type {
  HomePageProjectsSectionConfigurationPageDisplayMostRecent_query$key,
} from '~relay/HomePageProjectsSectionConfigurationPageDisplayMostRecent_query.graphql'
import Flex from '~ui/Primitives/Layout/Flex'
import Icon from '~ds/Icon/Icon'
import { toast } from '~ds/Toast'
import type {
  HomePageProjectsSectionConfigurationDisplayMode,
  HomePageProjectsSectionConfigurationPage_homePageProjectsSectionConfiguration,
} from '~relay/HomePageProjectsSectionConfigurationPage_homePageProjectsSectionConfiguration.graphql'
import HomePageProjectsSectionConfigurationPageDisplayMostRecent
  from '~/components/Admin/Section/HomePageProjectsSectionConfigurationPageDisplayMostRecent'
import { handleTranslationChange } from '~/services/Translation'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'
import Text from '~ui/Primitives/Text'
import HomePageProjectsSectionConfigurationPageDisplayCustom
  from '~/components/Admin/Section/HomePageProjectsSectionConfigurationPageDisplayCustom'
import type {
  HomePageProjectsSectionConfigurationPageDisplayCustom_query$key,
} from '~relay/HomePageProjectsSectionConfigurationPageDisplayCustom_query.graphql'
import type {
  HomePageProjectsSectionConfigurationPageDisplayCustom_homePageProjectsSectionConfiguration$key,
} from '~relay/HomePageProjectsSectionConfigurationPageDisplayCustom_homePageProjectsSectionConfiguration.graphql'
import { normalizeNumberInput } from '~/components/Form/utils'

const formName = 'section-proposal-admin-form'
type Props = ReduxFormFormProps & {
  readonly displayMode: HomePageProjectsSectionConfigurationDisplayMode
  readonly homePageProjectsSectionConfiguration: HomePageProjectsSectionConfigurationPage_homePageProjectsSectionConfiguration
  readonly currentLanguage: string
  readonly maxProjectsDisplay: number
  readonly intl: IntlShape
  readonly paginatedProjectsFragmentRef: HomePageProjectsSectionConfigurationPageDisplayMostRecent_query$key
  readonly allProjectsFragmentRef: HomePageProjectsSectionConfigurationPageDisplayCustom_query$key
  readonly homePageProjectsSectionConfigurationFragmentRef: HomePageProjectsSectionConfigurationPageDisplayCustom_homePageProjectsSectionConfiguration$key
}
type FormValues = {
  readonly displayMode: HomePageProjectsSectionConfigurationDisplayMode
  readonly enabled: string
  readonly nbObjects: string
  readonly position: string
  readonly teaser: string | null | undefined
  readonly title: string
  readonly projects: ReadonlyArray<string>
}
const TEASER_MAX = 200

const asyncValidate = (values: FormValues, dispatch: Dispatch, { maxProjectsDisplay }: Props) => {
  return new Promise((resolve, reject) => {
    if (parseInt(values.nbObjects, 10) > maxProjectsDisplay) {
      const error: any = {}
      error.nbObjects = {
        id: 'n-maximum',
        values: {
          n: maxProjectsDisplay,
        },
      }
      return reject(error)
    }

    if (values?.teaser && values.teaser.length > TEASER_MAX) {
      const error: any = {}
      error.teaser = {
        id: 'characters-maximum',
        values: {
          quantity: TEASER_MAX,
        },
      }
      return reject(error)
    }

    if (values.title.trim() === '') {
      const error = {
        title: {
          id: 'error.fill.title',
        },
      }
      return reject(error)
    }

    return resolve()
  })
}

const onSubmit = async (values: FormValues, dispatch: Dispatch, { currentLanguage, intl }: Props) => {
  const { title, teaser, position, nbObjects, projects, displayMode, enabled } = values
  const translationsData = handleTranslationChange(
    [],
    {
      locale: currentLanguage,
      title,
      teaser,
    },
    currentLanguage,
  )
  const input = {
    position,
    displayMode,
    nbObjects,
    enabled: enabled === 'published',
    translations: translationsData,
    projects,
  }

  try {
    const { updateHomePageProjectsSectionConfiguration } =
      await UpdateHomePageProjectsSectionConfigurationMutation.commit({
        input,
      })
    const errorCode = updateHomePageProjectsSectionConfiguration?.errorCode

    if (errorCode === 'TOO_MANY_PROJECTS') {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({
          id: 'section.admin.form.error.projects.number',
        }),
      })
      return
    }

    if (errorCode === 'INVALID_FORM') {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({
          id: 'global.error.server.form',
        }),
      })
      return
    }

    toast({
      variant: 'success',
      content: intl.formatHTMLMessage({
        id: 'all.data.saved',
      }),
    })
  } catch (e) {
    mutationErrorToast(intl)
  }
}

export const HomePageProjectsSectionConfigurationPage = ({
  handleSubmit,
  homePageProjectsSectionConfiguration,
  displayMode,
  maxProjectsDisplay,
  intl,
  paginatedProjectsFragmentRef,
  allProjectsFragmentRef,
  homePageProjectsSectionConfigurationFragmentRef,
  submitting,
}: Props) => {
  return (
    <form method="POST" onSubmit={handleSubmit}>
      <S.SectionContainer>
        <h1>
          {intl.formatMessage({
            id: 'global.general',
          })}
        </h1>
        <S.SectionInner>
          <Field
            type="text"
            name="title"
            id="title"
            placeholder="global.participative.project"
            label={intl.formatMessage({
              id: 'global.title',
            })}
            component={renderComponent}
          />
          <Field
            type="textarea"
            name="teaser"
            id="teaser"
            placeholder="section-admin-teaser-placeholder"
            label={
              <Flex>
                <Text>
                  {intl.formatMessage({
                    id: 'admin.fields.project.teaser',
                  })}
                </Text>
                <Text ml={2} color="gray.500">
                  {intl.formatMessage({
                    id: 'global.optional',
                  })}
                </Text>
              </Flex>
            }
            component={renderComponent}
          />
          <Field
            type="number"
            normalize={normalizeNumberInput}
            name="position"
            id="position"
            label={intl.formatMessage({
              id: 'section-admin-display-order',
            })}
            component={renderComponent}
            min={0}
          />
        </S.SectionInner>
      </S.SectionContainer>

      <S.SectionContainer>
        <Flex direction="row" justify="space-between" alignItems="center">
          <h1>
            {intl.formatMessage({
              id: 'section-admin-display-settings',
            })}
          </h1>
          <S.PreviewLink direction="row" alignItems="center" mb={24}>
            <Icon color="inherit" name="PREVIEW" size="md" />
            <a href="/" target="_blank">
              {intl.formatMessage({
                id: 'global.preview',
              })}
            </a>
          </S.PreviewLink>
        </Flex>

        <S.SectionInner>
          <div>
            <Text mb={4}>
              {intl.formatMessage({
                id: 'section-admin-projects-selection',
              })}
            </Text>
            <Field
              type="radio"
              name="displayMode"
              id="section-display-mode-most-recent"
              component={renderComponent}
              value="MOST_RECENT"
            >
              <span>
                {intl.formatMessage({
                  id: 'section-admin-most-recents',
                })}
              </span>
            </Field>

            <Field
              type="radio"
              name="displayMode"
              id="section-display-mode-custom"
              component={renderComponent}
              value="CUSTOM"
            >
              <span>
                {intl.formatMessage({
                  id: 'global.custom.feminine.lowercase',
                })}
              </span>
            </Field>
          </div>

          {displayMode === 'MOST_RECENT' && (
            <HomePageProjectsSectionConfigurationPageDisplayMostRecent
              paginatedProjectsFragmentRef={paginatedProjectsFragmentRef}
              homePageProjectsSectionConfiguration={homePageProjectsSectionConfiguration}
              maxProjectsDisplay={maxProjectsDisplay}
            />
          )}

          {displayMode === 'CUSTOM' && (
            <HomePageProjectsSectionConfigurationPageDisplayCustom
              allProjectsFragmentRef={allProjectsFragmentRef}
              homePageProjectsSectionConfigurationFragmentRef={homePageProjectsSectionConfigurationFragmentRef}
              maxProjectsDisplay={maxProjectsDisplay}
              formName={formName}
            />
          )}
        </S.SectionInner>
      </S.SectionContainer>

      <S.SectionContainer>
        <h1>
          {intl.formatMessage({
            id: 'global.publication',
          })}
        </h1>

        <div>
          <Field
            type="radio"
            name="enabled"
            id="section-is-not-published"
            component={renderComponent}
            value="unpublished"
          >
            <span>
              {intl.formatMessage({
                id: 'post_is_not_public',
              })}
            </span>
          </Field>

          <Field type="radio" name="enabled" id="section-is-published" component={renderComponent} value="published">
            <span>
              {intl.formatMessage({
                id: 'admin.fields.section.enabled',
              })}
            </span>
          </Field>
        </div>
      </S.SectionContainer>

      <Button variant="primary" variantSize="big" type="submit" isLoading={submitting}>
        {intl.formatMessage({
          id: 'global.save',
        })}
      </Button>
    </form>
  )
}

const mapStateToProps = (state: GlobalState, { homePageProjectsSectionConfiguration }: Props) => {
  if (homePageProjectsSectionConfiguration) {
    const { title, teaser, position, displayMode, nbObjects, enabled, projects } = homePageProjectsSectionConfiguration
    const initialValues = {
      title,
      teaser,
      position,
      displayMode,
      nbObjects,
      enabled: enabled === true ? 'published' : 'unpublished',
      projects: projects?.edges?.map(edge => edge?.node?.id),
    }
    return {
      initialValues,
      displayMode: formValueSelector(formName)(state, 'displayMode'),
      currentLanguage: state.language.currentLanguage,
      maxProjectsDisplay: state.default.features.new_project_card === true ? 9 : 8,
    }
  }
}

const form = injectIntl(
  reduxForm({
    form: formName,
    onSubmit,
    asyncValidate,
    asyncChangeFields: ['nbObjects', 'teaser', 'title'],
  })(HomePageProjectsSectionConfigurationPage),
)
const HomePageProjectsSectionConfigurationPageConnected = connect<any, any>(mapStateToProps)(form)
const fragmentContainer = createFragmentContainer(HomePageProjectsSectionConfigurationPageConnected, {
  homePageProjectsSectionConfiguration: graphql`
    fragment HomePageProjectsSectionConfigurationPage_homePageProjectsSectionConfiguration on HomePageProjectsSectionConfiguration {
      id
      title
      position
      teaser
      displayMode
      enabled
      nbObjects
      projects {
        edges {
          node {
            id
          }
        }
      }
    }
  `,
})
export default fragmentContainer
