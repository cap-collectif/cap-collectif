import * as React from 'react'
import { useIntl } from 'react-intl'
import moment from 'moment'
import { FormProvider, useForm } from 'react-hook-form'
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import '@shared/utils/yupExtensions'
import { Button, Flex, InfoMessage, Text } from '@cap-collectif/ui'
import { BreadCrumbItemType } from '@components/BackOffice/BreadCrumb/BreadCrumbItem'
import { useNavBarContext } from '@components/BackOffice/NavBar/NavBar.context'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import useFeatureFlag from '@shared/hooks/useFeatureFlag'
import { dangerToast, mutationErrorToast, successToast } from '@shared/utils/toasts'
import UpdateEmailingCampaignMutation from '@mutations/UpdateEmailingCampaignMutation'
import SendEmailingCampaignMutation from '@mutations/SendEmailingCampaignMutation'
import type { EmailingCampaignFormWrapperQuery } from '@relay/EmailingCampaignFormWrapperQuery.graphql'
import type {
  EmailingCampaignFormWrapper_emailingCampaign$data,
  EmailingCampaignFormWrapper_emailingCampaign$key,
} from '@relay/EmailingCampaignFormWrapper_emailingCampaign.graphql'
import MailjetSandboxMessage from '../MailjetSandboxMessage'
import { EMAILING_CAMPAIGNS_URL, INTERNAL_LIST_REGISTERED } from '../utils'
import type {
  EmailingCampaignFormContext,
  EmailingCampaignFormValues,
  RecipientOption,
  RecipientOptionGroup,
  RecipientType,
} from './EmailingCampaign.type'
import EmailingCampaignParameters, { RecipientSummary } from './EmailingCampaignParameters'
import EmailingCampaignContent from './EmailingCampaignContent'
import EmailingCampaignSending from './EmailingCampaignSending'
import CancelSendingModal from './CancelSendingModal'

const QUERY = graphql`
  query EmailingCampaignFormWrapperQuery(
    $id: ID!
    $mlAffiliations: [MailingListAffiliation!]
    $projectAffiliations: [ProjectAffiliation!]
  ) {
    emailingCampaign: node(id: $id) {
      ... on EmailingCampaign {
        ...EmailingCampaignFormWrapper_emailingCampaign
      }
    }
    senderEmails {
      address
    }
    groups {
      edges {
        node {
          id
          title
        }
      }
    }
    users(first: 0, emailConfirmed: true, superAdmin: true) {
      totalCount
    }
    usersRefusing: users(first: 0, consentInternalCommunication: false, emailConfirmed: true, superAdmin: true) {
      totalCount
    }
    participants(first: 0, emailConfirmed: true) {
      totalCount
    }
    participantsRefusing: participants(first: 0, consentInternalCommunication: false, emailConfirmed: true) {
      totalCount
    }
    viewer {
      mailingLists(affiliations: $mlAffiliations) {
        edges {
          node {
            id
            name
          }
        }
      }
      projects(affiliations: $projectAffiliations) {
        edges {
          node {
            id
            title
          }
        }
      }
      organizations {
        mailingLists(affiliations: $mlAffiliations) {
          edges {
            node {
              id
              name
            }
          }
        }
        projects(affiliations: $projectAffiliations) {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    }
  }
`

const FRAGMENT = graphql`
  fragment EmailingCampaignFormWrapper_emailingCampaign on EmailingCampaign {
    id
    name
    senderEmail
    senderName
    object
    content
    sendAt
    status
    preview
    mailingInternal
    mailingList {
      id
      name
      project {
        title
      }
      consentingUsers: users(first: 0, consentInternalCommunicationOnly: true) {
        totalCount
      }
    }
    emailingGroup {
      id
      title
      allUsers: users(first: 0) {
        totalCount
      }
      refusingUsers: users(first: 0, consentInternalCommunication: false) {
        totalCount
      }
    }
    project {
      id
      title
      emailableContributors {
        totalCount
      }
    }
  }
`

const formName = 'emailing-campaign-form'
const SEND_AT_FORMAT = 'YYYY-MM-DD HH:mm:ss'

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim()

const getSavedRecipient = (campaign: EmailingCampaignFormWrapper_emailingCampaign$data): string | null =>
  campaign.mailingInternal ?? campaign.mailingList?.id ?? campaign.emailingGroup?.id ?? campaign.project?.id ?? null

// Same precedence as getSavedRecipient
const getSavedRecipientType = (campaign: EmailingCampaignFormWrapper_emailingCampaign$data): RecipientType | null => {
  if (campaign.mailingInternal) return 'INTERNAL'
  if (campaign.mailingList) return 'MAILING_LIST'
  if (campaign.emailingGroup) return 'GROUP'
  if (campaign.project) return 'PROJECT'
  return null
}

const getSavedRecipientOption = (
  campaign: EmailingCampaignFormWrapper_emailingCampaign$data,
  internalLabel: string,
): RecipientOption | null => {
  const value = getSavedRecipient(campaign)
  switch (getSavedRecipientType(campaign)) {
    case 'INTERNAL':
      return { value: value!, label: internalLabel, type: 'INTERNAL' }
    case 'MAILING_LIST':
      return { value: value!, label: campaign.mailingList!.name, type: 'MAILING_LIST' }
    case 'GROUP':
      return { value: value!, label: campaign.emailingGroup!.title, type: 'GROUP' }
    case 'PROJECT':
      return { value: value!, label: campaign.project!.title, type: 'PROJECT' }
    default:
      return null
  }
}

type Props = {
  readonly emailingCampaign: EmailingCampaignFormWrapper_emailingCampaign$key
  readonly query: Omit<EmailingCampaignFormWrapperQuery['response'], 'emailingCampaign'>
}

const EmailingCampaignForm: React.FC<Props> = ({ emailingCampaign: emailingCampaignRef, query }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const isEmailingGroupEnabled = useFeatureFlag('emailing_group')
  const campaign = useFragment(FRAGMENT, emailingCampaignRef)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isSending, setIsSending] = React.useState(false)
  // A sent, sending or planned campaign can no longer be edited (a planned one must be canceled first)
  const isDisabled = campaign.status !== 'DRAFT'
  const savedRecipient = getSavedRecipient(campaign)

  // Recipients the viewer can choose: an organization member uses the lists and projects of its organization
  const owner = query.viewer.organizations?.[0] ?? query.viewer
  const recipientOptions = React.useMemo(() => {
    const mailingLists: RecipientOption[] = (owner.mailingLists?.edges ?? [])
      .map(edge => edge?.node)
      .filter(Boolean)
      .map(node => ({ value: node!.id, label: node!.name, type: 'MAILING_LIST' }))
    // The "all registered users" list and the user groups are reserved to admins (see the update mutation)
    if (viewerSession.isAdmin) {
      mailingLists.push({
        value: INTERNAL_LIST_REGISTERED,
        label: intl.formatMessage({ id: 'users' }),
        type: 'INTERNAL',
      })
    }
    const projects: RecipientOption[] = (owner.projects?.edges ?? [])
      .map(edge => edge?.node)
      .filter(Boolean)
      .map(node => ({ value: node!.id, label: node!.title, type: 'PROJECT' }))
    const groups: RecipientOption[] =
      viewerSession.isAdmin && isEmailingGroupEnabled
        ? (query.groups?.edges ?? [])
            .map(edge => edge?.node)
            .filter(Boolean)
            .map(node => ({ value: node!.id, label: node!.title, type: 'GROUP' }))
        : []

    // The saved recipient stays displayed and selectable even when the viewer can no longer choose it (e.g. emailing_group disabled)
    const savedOption = getSavedRecipientOption(campaign, intl.formatMessage({ id: 'users' }))
    if (savedOption && ![...mailingLists, ...projects, ...groups].some(option => option.value === savedOption.value)) {
      const target = savedOption.type === 'PROJECT' ? projects : savedOption.type === 'GROUP' ? groups : mailingLists
      target.push(savedOption)
    }

    if (projects.length === 0 && groups.length === 0) return { options: mailingLists, flat: mailingLists }

    const grouped: RecipientOptionGroup[] = [
      { label: intl.formatMessage({ id: 'admin-menu-emailing-list' }), options: mailingLists },
      ...(projects.length > 0
        ? [{ label: intl.formatMessage({ id: 'project-participants' }), options: projects }]
        : []),
      ...(groups.length > 0 ? [{ label: intl.formatMessage({ id: 'admin.label.group' }), options: groups }] : []),
    ]

    return { options: grouped, flat: [...mailingLists, ...projects, ...groups] }
  }, [owner, query.groups, viewerSession.isAdmin, isEmailingGroupEnabled, campaign, intl])

  const recipientPlaceholder = intl.formatMessage({
    id:
      recipientOptions.flat.some(option => option.type === 'GROUP') &&
      recipientOptions.flat.some(option => option.type === 'PROJECT')
        ? 'select-list-project-or-group'
        : recipientOptions.flat.some(option => option.type === 'GROUP')
        ? 'select-list-or-group'
        : recipientOptions.flat.some(option => option.type === 'PROJECT')
        ? 'select-list-or-project'
        : 'select-mailing-list',
  })

  const recipientSummary: RecipientSummary | null = React.useMemo(() => {
    if (campaign.mailingList) {
      return {
        recipient: { type: 'MAILING_LIST', id: campaign.mailingList.id, name: campaign.mailingList.name },
        consentingCount: campaign.mailingList.consentingUsers.totalCount,
        projectTitle: campaign.mailingList.project?.title,
      }
    }
    if (campaign.emailingGroup) {
      return {
        recipient: { type: 'GROUP', id: campaign.emailingGroup.id, name: campaign.emailingGroup.title },
        consentingCount: campaign.emailingGroup.allUsers.totalCount - campaign.emailingGroup.refusingUsers.totalCount,
      }
    }
    if (campaign.project) {
      return {
        recipient: { type: 'PROJECT', id: campaign.project.id, name: campaign.project.title },
        consentingCount: campaign.project.emailableContributors.totalCount,
      }
    }
    if (campaign.mailingInternal === INTERNAL_LIST_REGISTERED) {
      return {
        recipient: { type: 'INTERNAL', name: intl.formatMessage({ id: 'default-mailing-list-registered' }) },
        consentingCount:
          query.users.totalCount +
          query.participants.totalCount -
          query.usersRefusing.totalCount -
          query.participantsRefusing.totalCount,
      }
    }
    return null
  }, [campaign, query, intl])

  const schema = React.useMemo(() => {
    const requiredMessage = intl.formatMessage({ id: 'global.required' })
    const requiredToSend = (field: yup.StringSchema) =>
      field.when('$isSending', { is: true, then: schema => schema.notBlank(requiredMessage) })

    return yup.object().shape({
      name: yup.string().notBlank(requiredMessage),
      senderEmail: requiredToSend(yup.string()),
      recipient: yup
        .string()
        .nullable()
        .when('$isSending', { is: true, then: schema => schema.required(requiredMessage) }),
      object: requiredToSend(yup.string()),
      content: yup.string().when('$isSending', {
        is: true,
        then: schema => schema.test('not-blank-html', requiredMessage, value => stripHtml(value ?? '') !== ''),
      }),
      sendAt: yup
        .string()
        .nullable()
        .when('sendingMode', {
          is: (mode: EmailingCampaignFormValues['sendingMode']) => mode?.labels?.[0] === 'PLANNED',
          then: schema =>
            schema
              .required(requiredMessage)
              .test('in-the-future', intl.formatMessage({ id: 'date-sendAt-before-now' }), value =>
                moment(value).isAfter(moment()),
              ),
        }),
    })
  }, [intl])

  // Mutated before each validation: react-hook-form passes this same object to the resolver as the yup context
  const validationContext = React.useRef<EmailingCampaignFormContext>({ isSending: false })

  const methods = useForm<EmailingCampaignFormValues>({
    defaultValues: {
      name: campaign.name,
      senderEmail: campaign.senderEmail,
      recipient: savedRecipient,
      object: campaign.object,
      content: campaign.content,
      sendingMode: { labels: [campaign.sendAt ? 'PLANNED' : 'NOW'] },
      sendAt: campaign.sendAt ? moment(campaign.sendAt).format(SEND_AT_FORMAT) : null,
    },
    resolver: yupResolver(schema),
    context: validationContext.current,
  })
  const { handleSubmit, watch, reset, getValues, setValue, formState } = methods

  const { setBreadCrumbItems } = useNavBarContext()
  const name = watch('name')
  React.useEffect(() => {
    setBreadCrumbItems([
      { title: intl.formatMessage({ id: 'admin-menu-campaign-list' }), href: EMAILING_CAMPAIGNS_URL },
      { title: name || campaign.name, href: '' },
    ] as BreadCrumbItemType[])
    return () => setBreadCrumbItems([])
  }, [intl, name, campaign.name, setBreadCrumbItems])

  const update = async (values: EmailingCampaignFormValues): Promise<boolean> => {
    // An unchanged recipient keeps its saved type, even when it is no longer among the options (e.g. emailing_group disabled)
    const recipientType =
      values.recipient === savedRecipient
        ? getSavedRecipientType(campaign)
        : recipientOptions.flat.find(option => option.value === values.recipient)?.type
    const isPlanned = values.sendingMode?.labels?.[0] === 'PLANNED'

    try {
      const response = await UpdateEmailingCampaignMutation.commit({
        input: {
          id: campaign.id,
          name: values.name,
          senderEmail: values.senderEmail,
          senderName: campaign.senderName,
          mailingList: recipientType === 'MAILING_LIST' ? values.recipient : null,
          emailingGroup: recipientType === 'GROUP' ? values.recipient : null,
          project: recipientType === 'PROJECT' ? values.recipient : null,
          mailingInternal: recipientType === 'INTERNAL' ? values.recipient : null,
          object: values.object,
          content: values.content,
          sendAt: isPlanned && values.sendAt ? moment(values.sendAt).format(SEND_AT_FORMAT) : null,
        },
      })
      const error = response.updateEmailingCampaign?.error
      if (error) {
        if (error === 'TOO_LATE') dangerToast(intl.formatMessage({ id: 'date-sendAt-before-now' }))
        else mutationErrorToast(intl)
        return false
      }
      // The saved values become the new reference of the form, so that leaving the page is not blocked.
      // The fields stay editable during the request: what was typed meanwhile is kept, as unsaved changes.
      reset(values, { keepValues: true })
      const latestValues = getValues()
      ;(Object.keys(latestValues) as Array<keyof EmailingCampaignFormValues>).forEach(key => {
        if (JSON.stringify(latestValues[key]) !== JSON.stringify(values[key]))
          setValue(key, latestValues[key], { shouldDirty: true })
      })
      return true
    } catch {
      mutationErrorToast(intl)
      return false
    }
  }

  const validateAndRun = (isSendingContext: boolean, run: (values: EmailingCampaignFormValues) => Promise<void>) => {
    validationContext.current.isSending = isSendingContext
    return handleSubmit(run)()
  }

  const onSaveDraft = () =>
    validateAndRun(false, async values => {
      setIsSaving(true)
      const isSaved = await update(values)
      setIsSaving(false)
      if (isSaved) successToast(intl.formatMessage({ id: 'label.draft.saved' }))
    })

  // Used before sending a test email, which is built from the saved campaign
  const saveDraftSilently = () =>
    new Promise<boolean>(resolve => {
      validateAndRun(false, async values => {
        resolve(await update(values))
      }).then(() => resolve(false))
    })

  const onSend = () =>
    validateAndRun(true, async values => {
      setIsSending(true)
      const isSaved = await update(values)
      if (!isSaved) {
        setIsSending(false)
        return
      }
      try {
        const response = await SendEmailingCampaignMutation.commit({ input: { id: campaign.id } })
        if (response.sendEmailingCampaign?.error) mutationErrorToast(intl)
        else successToast(intl.formatMessage({ id: 'contact.email.sent_success' }))
      } catch {
        mutationErrorToast(intl)
      }
      setIsSending(false)
    })

  return (
    <FormProvider {...methods}>
      <Flex id={formName} direction="column" spacing={6} width="100%" mt={6}>
        <MailjetSandboxMessage />
        <Flex direction="row" width="100%" spacing={6} align="flex-start">
          <Flex direction="column" spacing={6} width="70%">
            <EmailingCampaignParameters
              disabled={isDisabled}
              senderEmails={query.senderEmails.map(senderEmail => senderEmail.address)}
              recipientOptions={recipientOptions.options}
              recipientPlaceholder={recipientPlaceholder}
              recipientSummary={watch('recipient') === savedRecipient ? recipientSummary : null}
            />
            <EmailingCampaignContent
              emailingCampaignId={campaign.id}
              disabled={isDisabled}
              preview={campaign.content && stripHtml(campaign.content) ? campaign.preview ?? null : null}
              saveDraft={saveDraftSilently}
            />

            {Object.keys(formState.errors).length > 0 ? (
              <InfoMessage variant="danger">
                <InfoMessage.Content>
                  {intl.formatMessage({ id: 'admin.fields.question_choice.required' })}
                </InfoMessage.Content>
              </InfoMessage>
            ) : null}

            <Flex direction="row" spacing={4}>
              {campaign.status === 'DRAFT' ? (
                <>
                  <Button
                    variant="primary"
                    variantColor="primary"
                    variantSize="big"
                    isLoading={isSending}
                    disabled={isSaving}
                    onClick={onSend}
                    data-cy="send-emailing-campaign"
                  >
                    {intl.formatMessage({ id: 'check-and-send' })}
                  </Button>
                  <Button
                    variant="secondary"
                    variantColor="primary"
                    variantSize="big"
                    isLoading={isSaving}
                    disabled={isSending}
                    onClick={onSaveDraft}
                    data-cy="save-emailing-campaign"
                  >
                    {intl.formatMessage({ id: 'global.save_as_draft' })}
                  </Button>
                </>
              ) : null}
              {campaign.status === 'PLANNED' ? <CancelSendingModal emailingCampaignId={campaign.id} /> : null}
              <Button
                variant="tertiary"
                variantColor="hierarchy"
                variantSize="big"
                onClick={() => (window.location.href = EMAILING_CAMPAIGNS_URL)}
              >
                {intl.formatMessage({ id: 'global.back' })}
              </Button>
            </Flex>
          </Flex>
          <Flex direction="column" spacing={6} width="30%">
            <EmailingCampaignSending disabled={isDisabled} status={campaign.status} sendAt={campaign.sendAt ?? null} />
          </Flex>
        </Flex>
      </Flex>
    </FormProvider>
  )
}

type WrapperProps = {
  readonly emailingCampaignId: string
}

const EmailingCampaignFormWrapper: React.FC<WrapperProps> = ({ emailingCampaignId }) => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const { emailingCampaign, ...query } = useLazyLoadQuery<EmailingCampaignFormWrapperQuery>(QUERY, {
    id: emailingCampaignId,
    mlAffiliations: viewerSession.isAdmin ? null : ['OWNER'],
    projectAffiliations: viewerSession.isAdmin ? null : ['OWNER'],
  })

  // Unknown id, or a campaign the viewer is not allowed to see (the node is then null)
  if (!emailingCampaign) {
    return (
      <Flex direction="column" alignItems="flex-start" spacing={4} m={6} bg="white" borderRadius="accordion" p={6}>
        <Text>{intl.formatMessage({ id: 'the-page-you-are-looking-for-cant-be-found' })}</Text>
        <Button
          variant="secondary"
          variantColor="primary"
          onClick={() => (window.location.href = EMAILING_CAMPAIGNS_URL)}
        >
          {intl.formatMessage({ id: 'global.back' })}
        </Button>
      </Flex>
    )
  }

  return <EmailingCampaignForm emailingCampaign={emailingCampaign} query={query} />
}

export default EmailingCampaignFormWrapper
