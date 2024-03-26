import * as React from 'react'
import { connect } from 'react-redux'
import { createFragmentContainer, graphql } from 'react-relay'
import { Field, reduxForm, formValueSelector, submit } from 'redux-form'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import { Modal } from 'react-bootstrap'
import CloseButton from '~/components/Form/CloseButton'
import SubmitButton from '~/components/Form/SubmitButton'
import component from '~/components/Form/Field'
import Icon, { ICON_NAME } from '~ds/Icon/Icon'
import type { Dispatch, GlobalState } from '~/types'
import { Container, InfoContainer, ButtonSave } from './ModalCreateMailingList.style'
import CreateMailingListMutation from '~/mutations/CreateMailingListMutation'
import type { ModalCreateMailingList_project } from '~relay/ModalCreateMailingList_project.graphql'
import CreateEmailingCampaignMutation from '~/mutations/CreateEmailingCampaignMutation'
import colors from '~/styles/modules/colors'
import Text from '~ui/Primitives/Text'
import InfoMessage from '~ds/InfoMessage/InfoMessage'
import Link from '~ds/Link/Link'
import Tooltip from '~ds/Tooltip/Tooltip'
import Flex from '~ui/Primitives/Layout/Flex'
import type { ModalCreateMailingList_viewer } from '~relay/ModalCreateMailingList_viewer.graphql'
import { toast } from '~ds/Toast'
import { mutationErrorToast } from '~/components/Utils/MutationErrorToast'

const formName = 'form-create-mailing-list'
type Props = ReduxFormFormProps & {
  show: boolean
  onClose: () => void
  members: string[]
  refusingCount: number
  project: ModalCreateMailingList_project
  viewer: ModalCreateMailingList_viewer
  mailingListName: string
  dispatch: Dispatch
}
type Values = {
  mailingListName: string
}

const createEmailingCampaign = (mailingListId: string, intl: IntlShape) => {
  return CreateEmailingCampaignMutation.commit({
    input: {
      mailingList: mailingListId,
    },
  })
    .then(response => {
      if (response.createEmailingCampaign?.error) return mutationErrorToast(intl)

      if (response.createEmailingCampaign?.emailingCampaign?.id) {
        window.location.replace(`/admin/mailingCampaign/edit/${response.createEmailingCampaign.emailingCampaign.id}`)
      }
    })
    .catch(() => {
      return mutationErrorToast(intl)
    })
}

const createMailingList = (
  projectId: string,
  members: string[],
  mailingListName: string,
  onClose: () => void,
  organizationId: string | null | undefined,
  withRedirection: boolean,
  intl: IntlShape,
) => {
  return CreateMailingListMutation.commit({
    input: {
      name: mailingListName,
      userIds: members,
      project: projectId,
      owner: organizationId,
    },
  })
    .then(response => {
      onClose()

      if (response.createMailingList?.error) return mutationErrorToast(intl)

      if (withRedirection && response.createMailingList?.mailingList) {
        createEmailingCampaign(response.createMailingList.mailingList.id, intl)
      }
      return toast({
        content: `${intl.formatMessage(
          { id: 'success-create-mailing-list' },
          {
            name: response.createMailingList?.mailingList?.name,
          },
        )}<br/><a href="/admin/mailingList/list">
          ${intl.formatMessage({ id: 'action_show' })}
        </a>`,
        variant: 'success',
      })
    })
    .catch(() => {
      return mutationErrorToast(intl)
    })
}

const onSubmit = (values: Values, dispatch: Dispatch, props: Props) => {
  const { project, onClose, members, viewer, intl } = props
  const { mailingListName } = values
  const organization = viewer?.organizations?.[0]
  createMailingList(project.id, members, mailingListName, onClose, organization?.id, true, intl)
}

const ModalCreateMailingList = ({
  show,
  onClose,
  members,
  refusingCount,
  project,
  dispatch,
  mailingListName,
  pristine,
  viewer,
}: Props) => {
  const intl = useIntl()
  const organization = viewer?.organizations?.[0]
  return (
    <Container animation={false} show={show} onHide={onClose} bsSize="large" aria-labelledby="modal-title">
      <Modal.Header closeButton>
        <Modal.Title id="modal-title">
          <FormattedMessage id="create-mailing-list" />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form>
          <Field
            type="text"
            name="mailingListName"
            label={<FormattedMessage id="title-list" />}
            component={component}
            id="mailing-list-name"
          />

          <InfoContainer>
            <Icon name={ICON_NAME.USER_O} size="md" color="gray.500" mr={1} />
            <Text>
              <span className="count-members">{members.length - refusingCount}</span>
              <FormattedMessage
                id="global.members"
                values={{
                  num: members.length - refusingCount,
                }}
              />
            </Text>
            <Tooltip
              label={intl.formatMessage(
                {
                  id: 'has-consent-to-internal-email',
                },
                {
                  num: members.length - refusingCount,
                },
              )}
            >
              <Flex ml={1}>
                <Icon name={ICON_NAME.CIRCLE_INFO} size="md" color="blue.500" />
              </Flex>
            </Tooltip>
            <Text as="span" className="project-title">
              {` - « ${project.title} »`}
            </Text>
          </InfoContainer>
        </form>
        <InfoMessage variant="warning" mt={4}>
          <InfoMessage.Title>
            {intl.formatMessage({
              id: 'rgpd.external.unsubscribe',
            })}
          </InfoMessage.Title>
          <InfoMessage.Content>
            <Text
              as="span"
              style={{
                fontSize: '1.0rem',
              }}
            >
              {intl.formatMessage({
                id: 'rgpd.external.unsubscribe.message',
              })}
            </Text>
            <Link
              href="https://aide.cap-collectif.com/article/121-exporter-les-donnees-utilisateurs"
              target="_blank"
              style={{
                color: colors.orange[900],
              }}
            >
              {intl.formatMessage({
                id: 'learn.more',
              })}
            </Link>
          </InfoMessage.Content>
        </InfoMessage>
      </Modal.Body>

      <Modal.Footer>
        <ButtonSave
          type="button"
          onClick={() =>
            createMailingList(project.id, members, mailingListName, onClose, organization?.id, false, intl)
          }
          disabled={pristine}
        >
          <FormattedMessage id="global.save" />
        </ButtonSave>

        <div>
          <CloseButton onClose={onClose} label="editor.undo" />
          <SubmitButton
            label="global.continue"
            onSubmit={() => dispatch(submit(formName))}
            bsStyle="primary"
            disabled={pristine}
          />
        </div>
      </Modal.Footer>
    </Container>
  )
}

const form = reduxForm({
  onSubmit,
  form: formName,
  enableReinitialize: true,
})(ModalCreateMailingList)
const selectorForm = formValueSelector(formName)

const mapStateToProps = (state: GlobalState) => ({
  mailingListName: selectorForm(state, 'mailingListName') || '',
})

const ModalCreateMailingListConnected = connect(mapStateToProps)(form)
export default createFragmentContainer(ModalCreateMailingListConnected, {
  project: graphql`
    fragment ModalCreateMailingList_project on Project {
      id
      title
    }
  `,
  viewer: graphql`
    fragment ModalCreateMailingList_viewer on User {
      organizations {
        id
      }
    }
  `,
})
