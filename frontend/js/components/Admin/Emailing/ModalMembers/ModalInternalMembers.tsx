import * as React from 'react'
import { graphql, QueryRenderer } from 'react-relay'
import type { IntlShape } from 'react-intl'
import { useIntl } from 'react-intl'
import { Modal } from 'react-bootstrap'
import { ModalContainer } from '~/components/Admin/Emailing/MailParameter/common.style'
import environment, { graphqlError } from '~/createRelayEnvironment'
import type { EmailingCampaignPageQueryResponse } from '~relay/EmailingCampaignPageQuery.graphql'
import InternalMembers, { USERS_PAGINATION } from './InternalMembers'
import type { EmailingCampaignInternalList } from '~relay/Parameter_emailingCampaign.graphql'
import Spinner from '~ds/Spinner/Spinner'
import Flex from '~ui/Primitives/Layout/Flex'
type Props = {
  readonly onClose: () => void
  readonly show: boolean
  readonly type: EmailingCampaignInternalList
}

const renderInternalMembers = ({
  error,
  props,
}: ReactRelayReadyState & {
  props: EmailingCampaignPageQueryResponse | null | undefined
}) => {
  if (error) return graphqlError
  if (props) return <InternalMembers query={props} key="InternalMembers" />
  return (
    <Flex direction="row" justify="center">
      <Spinner size="m" />
    </Flex>
  )
}

const getMailingListName = (type: EmailingCampaignInternalList, intl: IntlShape): string => {
  switch (type) {
    case 'REGISTERED':
      return intl.formatMessage({
        id: 'default-mailing-list-registered',
      })

    case 'CONFIRMED':
      return intl.formatMessage({
        id: 'default-mailing-list-registered-confirmed',
      })

    case 'NOT_CONFIRMED':
      return intl.formatMessage({
        id: 'default-mailing-list-registered-not-confirmed',
      })

    default:
      return ''
  }
}

export const ModalInternalMembers = ({ show, onClose, type }: Props) => {
  const intl = useIntl()
  return (
    <ModalContainer animation={false} show={show} onHide={onClose} bsSize="small" aria-labelledby="modal-title">
      <Modal.Header closeButton>
        <Modal.Title id="modal-title">{getMailingListName(type, intl)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ModalInternalMembersQuery($count: Int!, $cursor: String, $emailConfirmed: Boolean) {
              ...InternalMembers_query @arguments(count: $count, cursor: $cursor, emailConfirmed: $emailConfirmed)
            }
          `}
          variables={{
            count: USERS_PAGINATION,
            emailConfirmed: type === 'REGISTERED' ? null : type === 'CONFIRMED',
          }}
          render={({ error, props, retry }) =>
            renderInternalMembers({
              error,
              props,
              retry,
            })
          }
        />
      </Modal.Body>
    </ModalContainer>
  )
}
export default ModalInternalMembers
