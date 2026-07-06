import { FieldInput, FormControl } from '@cap-collectif/form'
import { Accordion, CapUIAccordionSize, FormLabel } from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import DistrictListField from '@components/BackOffice/Form/DistrictListField'
import AdvancedSidePanel from '@components/BackOffice/Form/Panels/AdvancedSidePanel'
import MultilangueSidePanel from '@components/BackOffice/Form/Panels/MultilangueSidePanel'
import PublicationSidePanel from '@components/BackOffice/Form/Panels/PublicationSidePanel'
import ProjectListField from '@components/BackOffice/Form/ProjectListField'
import StepListField from '@components/BackOffice/Form/StepListField'
import ThemeListField from '@components/BackOffice/Form/ThemeListField'
import { Locale } from '@components/BackOffice/Posts/Post.type'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { useIntl } from 'react-intl'
import { Locales } from 'types'
import { DisabledParams, EventFormValues, getRefusedReasons, isFieldDisabled, ModerationStatus } from './utils'

type PostFormSideProps = {
  availableLocales: Locale[]
  currentLocale: string
  setCurrentLocale: (value: Locales) => void
  disabledParams: DisabledParams
}

const EventFormSide: React.FC<PostFormSideProps> = ({
  availableLocales,
  currentLocale,
  setCurrentLocale,
  disabledParams,
}: PostFormSideProps) => {
  const intl = useIntl()
  const {
    control,
    watch,
    setValue,
    formState: {
      defaultValues: { author: initialAuthor, status: initialStatus },
    },
  } = useFormContext<EventFormValues>()
  const { viewerSession } = useAppContext()
  const { isAdmin, isProjectAdmin, isSuperAdmin, isAdminOrganization } = viewerSession
  const allowUsersToProposeEvents = useFeatureFlag('allow_users_to_propose_events')
  const displayThemesField = isAdmin
  const refusedReasons = getRefusedReasons(intl)

  const id = watch('id')
  const projects = watch('projects')
  const steps = watch('steps')
  const status = watch('status')

  React.useEffect(() => {
    setValue(
      'steps',
      steps.filter(step => projects.map(p => p.value).includes(step.projectId)),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects])

  const isOnlyProjectAdmin = !isAdmin && isProjectAdmin

  const showModeration =
    id &&
    !initialAuthor?.isAdmin &&
    !isAdminOrganization &&
    initialStatus?.labels &&
    allowUsersToProposeEvents &&
    !isOnlyProjectAdmin
  const isModerationDisabled = isSuperAdmin ? false : initialStatus?.labels?.[0] !== ModerationStatus.AWAITING
  const isDisabled = isFieldDisabled(disabledParams)
  const isDisabledExceptForAdmin = isFieldDisabled(disabledParams, true)

  return (
    <Accordion
      allowMultiple
      size={CapUIAccordionSize.md}
      sx={{ '.cap-accordion__button p': { fontWeight: 600 } }}
      defaultAccordion={['place']}
      color="white"
    >
      <Accordion.Item id="place" position="relative">
        <Accordion.Button>
          {intl.formatMessage({
            id: 'admin.fields.blog_post.group_linked_content',
          })}
        </Accordion.Button>
        <Accordion.Panel>
          {displayThemesField && (
            <FormControl name="themes" control={control}>
              <FormLabel htmlFor="themes" label={intl.formatMessage({ id: 'admin.label.pages.themes' })} />
              <ThemeListField name="themes" id="themes" isMulti disabled={isDisabledExceptForAdmin} />
            </FormControl>
          )}
          <FormControl name="projects" control={control}>
            <FormLabel htmlFor="projects" label={intl.formatMessage({ id: 'admin.fields.blog_post.projects' })} />
            <ProjectListField
              name="projects"
              placeholder={intl.formatMessage({ id: 'select-projects' })}
              isMulti
              id="projects"
            />
          </FormControl>
          {projects?.length ? (
            <FormControl name="steps" control={control}>
              <FormLabel htmlFor="steps" label={intl.formatMessage({ id: 'global.steps' })} />
              <StepListField name="steps" isMulti id="steps" projectIds={projects.map(p => p.value)} value={steps} />
            </FormControl>
          ) : null}
          <FormControl name="districts" control={control}>
            <FormLabel htmlFor="districts" label={intl.formatMessage({ id: 'admin.label.project_district' })} />
            <DistrictListField
              name="districts"
              placeholder={intl.formatMessage({ id: 'select-projects' })}
              isMulti
              id="districts"
            />
          </FormControl>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item id="publication">
        <PublicationSidePanel
          showPublished={!showModeration}
          isDisabledExceptForAdmin={isDisabledExceptForAdmin}
          isDisabled={isDisabled}
        >
          {showModeration ? (
            <>
              <FormControl name="status" control={control}>
                <FieldInput
                  id="status"
                  name="status"
                  control={control}
                  type="radio"
                  disabled={isModerationDisabled}
                  choices={[
                    {
                      id: ModerationStatus.APPROVED,
                      label: intl.formatMessage({ id: 'admin.action.recent_contributions.validate.button' }),
                      useIdAsValue: true,
                    },
                    {
                      id: ModerationStatus.REFUSED,
                      label: intl.formatMessage({ id: 'btn_preview_decline' }),
                      useIdAsValue: true,
                    },
                  ]}
                />
              </FormControl>
              {status?.labels?.includes(ModerationStatus.REFUSED) ? (
                <>
                  <FormControl name="refusedReason" control={control}>
                    <FormLabel
                      htmlFor="refusedReason"
                      label={intl.formatMessage({ id: 'admin.action.recent_contributions.unpublish.input_label' })}
                    />
                    <FieldInput
                      type="select"
                      name="refusedReason"
                      id="refusedReason"
                      control={control}
                      // @ts-ignore TODO FIX DS
                      disabled={isModerationDisabled}
                      options={refusedReasons}
                    />
                  </FormControl>
                  <FormControl name="comment" control={control}>
                    <FormLabel htmlFor="comment" label={intl.formatMessage({ id: 'details' })} />
                    <FieldInput
                      type="textarea"
                      name="comment"
                      id="comment"
                      control={control}
                      disabled={isModerationDisabled}
                    />
                  </FormControl>
                </>
              ) : null}
            </>
          ) : null}
        </PublicationSidePanel>
      </Accordion.Item>
      <Accordion.Item id="multilingual">
        <MultilangueSidePanel availableLocales={availableLocales} setCurrentLocale={setCurrentLocale} />
      </Accordion.Item>
      <Accordion.Item id="advanced">
        <AdvancedSidePanel
          showTransfer={allowUsersToProposeEvents && !(!isAdmin && isProjectAdmin)}
          currentLocale={currentLocale}
          isDisabledExceptForAdmin={isDisabledExceptForAdmin}
        />
      </Accordion.Item>
    </Accordion>
  )
}

export default EventFormSide
