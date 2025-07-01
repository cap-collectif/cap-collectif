import * as React from 'react'
import { Accordion, CapInputSize, CapUIAccordionSize, FormLabel } from '@cap-collectif/ui'
import { Locale } from './Post.type'
import { Option } from '@components/Projects/ProjectConfig/ProjectConfigForm.utils'
import { useIntl } from 'react-intl'
import { FieldInput, FormControl } from '@cap-collectif/form'
import { useFormContext } from 'react-hook-form'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import ThemeListField from '@components/Form/ThemeListField'
import ProjectListField from '@components/Form/ProjectListField'
import useUrlState from '@hooks/useUrlState'
import { useAppContext } from '@components/AppProvider/App.context'

type PostFormSideProps = {
  availableLocales: Locale[]
  currentLocale: string
  setCurrentLocale: (value: string) => void
  selectedProposal: Option[]
}

const PostFormSide: React.FC<PostFormSideProps> = ({
  availableLocales,
  currentLocale,
  setCurrentLocale,
  selectedProposal,
}: PostFormSideProps) => {
  const intl = useIntl()
  const { control, setValue, setError, clearErrors, watch } = useFormContext()
  const multiLangue = useFeatureFlag('multilangue')
  const { viewerSession } = useAppContext()
  const [proposalIdFromUrl] = useUrlState('proposalId', '')

  const { isOrganizationMember, isAdmin, isProjectAdmin, isSuperAdmin } = viewerSession

  const isOrgaMemberOrProjectAdmin = isOrganizationMember || isProjectAdmin

  const displayProposalField = Boolean(proposalIdFromUrl) || selectedProposal.length > 0
  const displayThemesField = isAdmin
  const displayProjectsField = isAdmin || (isOrgaMemberOrProjectAdmin && !Boolean(proposalIdFromUrl))
  const disableProjectSelect = (isAdmin && Boolean(proposalIdFromUrl)) || (isAdmin && selectedProposal?.length > 0)

  const selectedProject = watch('projects')

  const handleProjectChange = React.useCallback(() => {
    if (!displayProjectsField || isAdmin || isSuperAdmin) return
    if (selectedProject.length === 0) {
      setError('projects', {
        type: 'manual',
        message: intl.formatMessage({ id: 'fill-field' }),
      })
    } else {
      clearErrors('projects')
    }
  }, [displayProjectsField, selectedProject, intl, setError, clearErrors])

  React.useEffect(() => {
    handleProjectChange()
  }, [selectedProject, handleProjectChange])

  return (
    <Accordion
      allowMultiple
      size={CapUIAccordionSize.Sm}
      sx={{ '.cap-accordion__button p': { fontWeight: 600 } }}
      defaultAccordion={['place']}
    >
      <Accordion.Item id="place" position="relative">
        <Accordion.Button>
          {intl.formatMessage({
            id: 'admin.fields.blog_post.group_linked_content',
          })}
        </Accordion.Button>
        <Accordion.Panel>
          {displayProposalField && (
            <FormControl name="proposals" control={control} key="proposals">
              <FormLabel htmlFor="proposals" label={intl.formatMessage({ id: 'admin.post.proposition' })} />
              <FieldInput
                type="text"
                id="proposals"
                name="proposals"
                control={control}
                disabled
                defaultValue={selectedProposal?.[0]?.label}
              />
            </FormControl>
          )}

          {displayThemesField && (
            <FormControl name="themes" control={control} key="themes">
              <FormLabel htmlFor="themes" label={intl.formatMessage({ id: 'admin.label.pages.themes' })} />
              <ThemeListField name="themes" id="themes" isMulti />
            </FormControl>
          )}

          {displayProjectsField && (
            <FormControl name="projects" control={control} key="projects">
              <FormLabel htmlFor="projects" label={intl.formatMessage({ id: 'admin.fields.blog_post.projects' })} />
              <ProjectListField
                name="projects"
                placeholder={intl.formatMessage({ id: 'select-projects' })}
                isMulti
                id="projects"
                disabled={disableProjectSelect}
              />
            </FormControl>
          )}

          {(isAdmin || isSuperAdmin) && (
            <FormControl name="displayedOnBlog" control={control} key="displayedOnBlog">
              <FieldInput type="checkbox" name={'displayedOnBlog'} control={control} id={'displayedOnBlog'}>
                {intl.formatMessage({ id: 'admin.fields.blog_post.displayedOnBlog' })}
              </FieldInput>
            </FormControl>
          )}
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item id="publication">
        <Accordion.Button>
          {intl.formatMessage({
            id: 'global.publication',
          })}
        </Accordion.Button>
        <Accordion.Panel>
          <FormControl name="publishedAt" control={control} key="publishedAt" mb={0}>
            <FormLabel htmlFor="publishedAt" label={intl.formatMessage({ id: 'global.admin.published_at' })} />
            <FieldInput type="dateHour" name={'publishedAt'} control={control} id={'publishedAt'}>
              {intl.formatMessage({ id: 'global.admin.published_at' })}
            </FieldInput>
          </FormControl>

          <FormControl name="isPublished" control={control} key="isPublished">
            <FieldInput type="checkbox" name={'isPublished'} control={control} id={'isPublished'}>
              {intl.formatMessage({ id: 'global.published' })}
            </FieldInput>
          </FormControl>

          <FormControl name="commentable" control={control} key="commentable">
            <FieldInput type="checkbox" name={'commentable'} control={control} id={'commentable'}>
              {intl.formatMessage({ id: 'admin.post.comments_authorised' })}
            </FieldInput>
          </FormControl>
        </Accordion.Panel>
      </Accordion.Item>

      {multiLangue && (
        <Accordion.Item id="multilingual">
          <Accordion.Button>
            {intl.formatMessage({
              id: 'capco.module.multilangue',
            })}
          </Accordion.Button>
          <Accordion.Panel>
            <FormControl name="currentLocale" control={control} key="currentLocale">
              <FormLabel htmlFor="currentLocale" label={intl.formatMessage({ id: 'admin.post.languages' })} />
              <FieldInput
                type="select"
                name="currentLocale"
                control={control}
                options={
                  availableLocales
                    ? availableLocales.map(locale => ({
                        value: locale.code,
                        label: intl.formatMessage({ id: locale.traductionKey }),
                      }))
                    : []
                }
                id="currentLocale"
                onChange={e => {
                  setValue('currentLocale', e)
                  setCurrentLocale(e)
                }}
              />
            </FormControl>
          </Accordion.Panel>
        </Accordion.Item>
      )}

      <Accordion.Item id="advanced">
        <Accordion.Button>
          {intl.formatMessage({
            id: 'admin.fields.blog_post.advanced',
          })}
        </Accordion.Button>
        <Accordion.Panel>
          <FormControl
            name={`${currentLocale}-metaDescription`}
            key={`${currentLocale}-metaDescription`}
            control={control}
          >
            <FormLabel
              htmlFor={`${currentLocale}-metaDescription`}
              label={intl.formatMessage({ id: 'global.meta.description' })}
            />
            <FieldInput
              type="textarea"
              id={`${currentLocale}-metaDescription`}
              name={`${currentLocale}-metaDescription`}
              control={control}
              variantSize={CapInputSize.Sm}
            />
          </FormControl>
          <FormControl name="customCode" control={control} key="customCode">
            <FormLabel htmlFor="customCode" label={intl.formatMessage({ id: 'admin.customcode' })} />
            <FieldInput
              type="textarea"
              name="customCode"
              placeholder={intl.formatMessage({ id: 'admin.customcode.placeholder' })}
              control={control}
              id="customCode"
            />
          </FormControl>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  )
}

export default PostFormSide
