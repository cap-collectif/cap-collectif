import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import { graphql, useFragment } from 'react-relay'
import Tooltip from '~ds/Tooltip/Tooltip'
import Tag from '~ds/Tag/Tag'
import type { RenderPrivateAccessLegacy_project$key } from '~relay/RenderPrivateAccessLegacy_project.graphql'
import { ICON_NAME } from '~ds/Icon/Icon'

type Props = {
  project: RenderPrivateAccessLegacy_project$key
  isOnProjectCard?: boolean
}
const FRAGMENT = graphql`
  fragment RenderPrivateAccessLegacy_project on Project {
    visibility
    archived
  }
`

const RenderPrivateAccessLegacy = ({ project, isOnProjectCard = false }: Props): JSX.Element => {
  const data = useFragment(FRAGMENT, project)
  let visibleBy = 'global.draft.only_visible_by_you'

  if (data && data.visibility && data.visibility === 'ADMIN') {
    visibleBy = 'only-visible-by-administrators'
  }

  return (
    <Tooltip placement="top" label={<FormattedMessage id={visibleBy} />}>
      <Tag
        id="restricted-access"
        icon={ICON_NAME.LOCK}
        variant="neutral-gray"
        color={data.archived ? 'neutral-gray.500' : 'neutral-gray.800'}
        mr={isOnProjectCard ? 4 : 0}
      >
        <FormattedMessage id="restrictedaccess" />
      </Tag>
    </Tooltip>
  )
}

export default RenderPrivateAccessLegacy
