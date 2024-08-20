import * as React from 'react'
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom'
import debounce from 'debounce-promise'
import moment from 'moment'
import { createFragmentContainer, graphql } from 'react-relay'
import { useDisclosure } from '@liinkiing/react-hooks'
import { injectIntl } from 'react-intl'
import { reduxForm, registerField } from 'redux-form'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'
import { Form } from './MailParameterPage.style'
import ParameterPage, { DEFAULT_MAILING_LIST } from '~/components/Admin/Emailing/MailParameter/Parameter'
import ContentPage from '~/components/Admin/Emailing/MailParameter/Content'
import SendingPage from '~/components/Admin/Emailing/MailParameter/Sending'
import type { Dispatch, GlobalState } from '~/types'
import ModalCancelSending from '~/components/Admin/Emailing/MailParameter/ModalCancelSending/ModalCancelSending'
import UpdateEmailingCampaignMutation from '~/mutations/UpdateEmailingCampaignMutation'
import type { MailParameterPage_emailingCampaign } from '~relay/MailParameterPage_emailingCampaign.graphql'
import '~relay/MailParameterPage_emailingCampaign.graphql'
import type { MailParameterPage_query } from '~relay/MailParameterPage_query.graphql'
import '~relay/MailParameterPage_query.graphql'
import Header, { formName, PATHS } from './Header/Header'
import SendEmailingCampaignMutation from '~/mutations/SendEmailingCampaignMutation'
import stripHtml from '@shared/utils/stripHTML'
import { DATE_ISO8601_FORMAT } from '~/shared/date'
import { fromGlobalId } from '@shared/utils/fromGlobalId'
import type { MailParameterPage_viewer } from '~relay/MailParameterPage_viewer.graphql'
import { toast } from '~ds/Toast'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'

const REGISTER_FIELDS = [
  'title',
  'senderEmail',
  'mailingList',
  'mailSubject',
  'project',
  'mailContent',
  'sendingSchedule',
  'plannedDate',
]
type Values = {
  title: string
  senderEmail: string
  mailingList: string | null | undefined
  emailingGroup: string | null | undefined
  mailSubject: string | null | undefined
  project: string | null | undefined
  mailContent: string | null | undefined
  sendingSchedule: boolean
  plannedDate?: string | null | undefined
}
type Props = ReduxFormFormProps & {
  readonly emailingCampaign: MailParameterPage_emailingCampaign
  readonly query: MailParameterPage_query
  readonly viewer: MailParameterPage_viewer
  readonly dispatch: Dispatch
  readonly registeredFieldsName: string[]
}

const handleChangeEmailingCampaign = (values: Values, dispatch: Dispatch, props: Props) => {
  const { title, senderEmail, mailingList, mailSubject, mailContent, sendingSchedule, plannedDate } = values
  const { emailingCampaign, pristine, intl } = props
  const { type } = fromGlobalId(mailingList)

  if (pristine) {
    return
  }

  return UpdateEmailingCampaignMutation.commit({
    input: {
      id: emailingCampaign.id,
      name: title,
      senderEmail,
      senderName: emailingCampaign.senderName,
      mailingList:
        type !== 'Group' && type !== 'Project' && mailingList && !DEFAULT_MAILING_LIST.includes(mailingList)
          ? mailingList
          : undefined,
      emailingGroup: type === 'Group' ? mailingList : undefined,
      project: type === 'Project' ? mailingList : undefined,
      mailingInternal: DEFAULT_MAILING_LIST.includes(mailingList) ? mailingList : null,
      object: mailSubject,
      content: mailContent,
      sendAt: sendingSchedule && plannedDate ? moment(plannedDate).format(DATE_ISO8601_FORMAT) : null,
    },
  })
    .then(response => {
      if (response.updateEmailingCampaign?.error) {
        if (response.updateEmailingCampaign.error === 'TOO_LATE')
          return toast({ content: intl.formatMessage({ id: 'date-sendAt-before-now' }), variant: 'danger' })

        return mutationErrorToast(intl)
      }
      return toast({ content: intl.formatMessage({ id: 'label.draft.saved' }), variant: 'success' })
    })
    .catch(() => {
      return mutationErrorToast(intl)
    })
}

const onSubmit = (values: Values, dispatch: Dispatch, props: Props) => {
  const { intl } = props

  return SendEmailingCampaignMutation.commit({
    input: {
      id: props.emailingCampaign.id,
    },
  })
    .then(response => {
      if (response.sendEmailingCampaign?.error) return mutationErrorToast(intl)
      return toast({ content: intl.formatMessage({ id: 'contact.email.sent_success' }), variant: 'success' })
    })
    .catch(() => {
      return mutationErrorToast(intl)
    })
}

const validate = (
  { title, senderEmail, mailingList, project, mailSubject, mailContent, sendingSchedule, plannedDate }: Values,
  props,
) => {
  const { intl } = props
  const now = moment()
  const errors: any = {}

  if (!title) {
    const fieldName = intl.formatMessage({
      id: 'campaign-title',
    })
    errors.title = {
      id: 'global.field.mandatory.dynamic',
      values: {
        fieldName,
      },
    }
  }

  if (!senderEmail) {
    const fieldName = (
      <Link to="/" key="senderEmail">
        {intl.formatMessage({
          id: 'sender-address',
        })}
      </Link>
    )
    errors.senderEmail = {
      id: 'global.field.mandatory.dynamic',
      values: {
        fieldName,
      },
    }
  }

  if (!mailingList && !project) {
    const fieldName = (
      <Link to={PATHS.PARAMETER} key="mailingList">
        {intl.formatMessage({
          id: 'recipient',
        })}
      </Link>
    )
    errors.mailingList = {
      id: 'global.field.mandatory.dynamic',
      values: {
        fieldName,
      },
    }
  }

  if (!mailSubject) {
    const fieldName = (
      <Link to={PATHS.CONTENT} key="mailSubject">
        {intl.formatMessage({
          id: 'mail-subject',
        })}
      </Link>
    )
    errors.mailSubject = {
      id: 'global.field.mandatory.dynamic',
      values: {
        fieldName,
      },
    }
  }

  if (!mailContent || !stripHtml(mailContent)) {
    const fieldName = (
      <Link to={PATHS.CONTENT} key="mailContent">
        {intl.formatMessage({
          id: 'mail-content',
        })}
      </Link>
    )
    errors.mailContent = {
      id: 'global.field.mandatory.dynamic',
      values: {
        fieldName,
      },
    }
  }

  if (sendingSchedule && !plannedDate) {
    const fieldName = (
      <Link to={PATHS.SENDING} key="plannedDate">
        {intl.formatMessage({
          id: 'send-parameter',
        })}
      </Link>
    )
    errors.plannedDate = {
      id: 'global.field.mandatory.dynamic',
      values: {
        fieldName,
      },
    }
  }

  if (sendingSchedule && plannedDate && !moment(plannedDate).isAfter(now)) {
    errors.plannedDate = {
      id: 'date-sendAt-before-now',
    }
  }

  return errors
}

export const MailParameterPage = ({
  emailingCampaign,
  query,
  submitFailed,
  handleSubmit,
  invalid,
  dispatch,
  registeredFieldsName,
  viewer,
}: Props) => {
  const baseNameUrl = `/admin/mailingCampaign/edit/${emailingCampaign.id}`
  const formDisabled = emailingCampaign.status === 'SENT' || emailingCampaign.status === 'PLANNED'
  const showError: boolean = invalid && submitFailed
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const organization = viewer?.organizations?.[0]
  React.useEffect(() => {
    /**
     * All fields are not registered 'cause we have fields on different page.
     * So, to have a real good validation, we have to register all fields.
     */
    const hasSameFieldsRegistered = isEqual(REGISTER_FIELDS.sort(), registeredFieldsName.sort())

    if (!hasSameFieldsRegistered) {
      REGISTER_FIELDS.map(fieldName => {
        dispatch(registerField(formName, fieldName, 'Field'))
      })
    }
  }, [dispatch, registeredFieldsName])
  return (
    <Form
      id={formName}
      onKeyDown={e => {
        if (e.keyCode === 13) {
          e.preventDefault()
          return false
        }
      }}
      onSubmit={handleSubmit}
    >
      <Router basename={baseNameUrl}>
        <Header
          emailingCampaign={emailingCampaign}
          disabled={formDisabled}
          setModalCancelOpen={onOpen}
          showError={showError}
        />

        <Switch>
          <Route exact path={PATHS.PARAMETER}>
            <ParameterPage
              emailingCampaign={emailingCampaign}
              query={query}
              mailingListOwner={organization ?? viewer}
              projectOwner={organization ?? viewer}
              disabled={formDisabled}
              showError={showError}
            />
          </Route>

          <Route exact path={PATHS.CONTENT}>
            <ContentPage emailingCampaign={emailingCampaign} disabled={formDisabled} showError={showError} />
          </Route>

          <Route exact path={PATHS.SENDING}>
            <SendingPage emailingCampaign={emailingCampaign} disabled={formDisabled} showError={showError} />
          </Route>
        </Switch>

        <ModalCancelSending emailingCampaign={emailingCampaign} show={isOpen} onClose={onClose} />
      </Router>
    </Form>
  )
}
const MailParameterPageForm = reduxForm({
  onSubmit,
  validate,
  form: formName,
  onChange: debounce(handleChangeEmailingCampaign, 1000),
})(MailParameterPage)

const mapStateToProps = (state: GlobalState, props: Props) => ({
  initialValues: {
    senderEmail: props.emailingCampaign.senderEmail,
    sendingSchedule: !!props.emailingCampaign.sendAt,
    plannedDate: props.emailingCampaign.sendAt || null,
    title: props.emailingCampaign.name,
    mailContent: props.emailingCampaign.content,
    mailSubject: props.emailingCampaign.object,
    mailingList:
      props.emailingCampaign.mailingInternal ||
      props.emailingCampaign.mailingList?.id ||
      props.emailingCampaign.emailingGroup?.id ||
      props.emailingCampaign.project?.id ||
      null,
  },
  registeredFieldsName: state.form[formName]?.registeredFields
    ? Object.keys(state.form[formName].registeredFields)
    : [],
})

const MailParameterPageConnected = connect(mapStateToProps)(injectIntl(MailParameterPageForm))
export default createFragmentContainer(MailParameterPageConnected, {
  emailingCampaign: graphql`
    fragment MailParameterPage_emailingCampaign on EmailingCampaign {
      id
      name
      senderEmail
      senderName
      object
      content
      mailingList {
        id
      }
      project {
        id
      }
      mailingInternal
      sendAt
      status
      emailingGroup {
        id
      }
      ...Header_emailingCampaign
      ...Parameter_emailingCampaign
      ...Content_emailingCampaign
      ...Sending_emailingCampaign
      ...ModalCancelSending_emailingCampaign
    }
  `,
  query: graphql`
    fragment MailParameterPage_query on Query {
      ...Parameter_query
    }
  `,
  viewer: graphql`
    fragment MailParameterPage_viewer on User
    @argumentDefinitions(
      mlAffiliations: { type: "[MailingListAffiliation!]" }
      projectAffiliations: { type: "[ProjectAffiliation!]" }
    ) {
      ...Parameter_mailingListOwner @arguments(mlAffiliations: $mlAffiliations)
      ...Parameter_projectOwner @arguments(projectAffiliations: $projectAffiliations)
      organizations {
        ...Parameter_mailingListOwner @arguments(mlAffiliations: $mlAffiliations)
        ...Parameter_projectOwner @arguments(projectAffiliations: $projectAffiliations)
      }
    }
  `,
})
