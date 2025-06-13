import * as React from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import { useDisclosure } from '@liinkiing/react-hooks'
import { Tag, Tooltip, CapUIIcon, Icon } from '@cap-collectif/ui'
import UserGroupModal from './UserGroupModal'
import type { RenderCustomAccess_project$key } from '~relay/RenderCustomAccess_project.graphql'
type Props = {
  readonly project: RenderCustomAccess_project$key
  readonly isOnProjectCard?: boolean
}
const FRAGMENT = graphql`
  fragment RenderCustomAccess_project on Project
  @argumentDefinitions(count: { type: "Int", defaultValue: 10 }, cursor: { type: "String" }) {
    restrictedViewers(first: $count, after: $cursor) {
      totalUserCount
    }
    archived
    ...UserGroupModal_project @arguments(count: $count, cursor: $cursor)
  }
`

const RenderCustomAccess = ({ project, isOnProjectCard = false }: Props): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure(false)
  const intl = useIntl()
  const data = useFragment(FRAGMENT, project)
  let nbUserInGroups = 0

  if (data != null && data.restrictedViewers != null && data.restrictedViewers.totalUserCount != null) {
    nbUserInGroups = data.restrictedViewers.totalUserCount
  }

  return (
    <React.Fragment>
      <Tooltip
        id="tooltip"
        label={intl.formatMessage(
          {
            id: 'only-visible-by',
          },
          {
            num: nbUserInGroups,
          },
        )}
      >
        <Tag
          id="restricted-access"
          variantColor="infoGray"
          onClick={onOpen}
          mr={isOnProjectCard ? 4 : 0}
        >
          <Icon name={CapUIIcon.Lock} />
          <FormattedMessage id="restrictedaccess" />
        </Tag>
      </Tooltip>

      <UserGroupModal project={data} show={isOpen} handleClose={onClose} />
    </React.Fragment>
  )
}

export default RenderCustomAccess
