import type { FC } from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl, IntlShape } from 'react-intl'
import type {
  Contributor_contributor$key,
  PlatformAnalyticsContributorContributionType,
} from '@relay/Contributor_contributor.graphql'
import { Flex, Text, headingStyles, CapUIFontWeight, CapUIFontSize } from '@cap-collectif/ui'
import UserAvatar from '@components/UserAvatar/UserAvatar'

interface ContributorProps {
  contributor: Contributor_contributor$key
}

const FRAGMENT = graphql`
  fragment Contributor_contributor on PlatformAnalyticsTopContributor {
    user {
      username
      ...UserAvatar_user
    }
    contributions {
      type
      totalCount
    }
  }
`

const getContributionWording = (type: PlatformAnalyticsContributorContributionType, intl: IntlShape, count: number) => {
  switch (type) {
    case 'PROPOSAL':
    case 'OPINION':
      return intl.formatMessage({ id: 'count-proposal' }, { num: count })
    case 'OPINION_VERSION':
      return intl.formatMessage({ id: 'amendment-count' }, { count })
    case 'REPLY':
      return intl.formatMessage({ id: 'shortcut.answer' }, { num: count })
    case 'SOURCE':
      return intl.formatMessage({ id: 'source-count' }, { count })
    case 'ARGUMENT':
      return intl.formatMessage({ id: 'argument-count' }, { count })
    case 'COMMENT':
      return intl.formatMessage({ id: 'comments-count' }, { count })
    case 'DEBATE_ARGUMENT':
      return intl.formatMessage({ id: 'count-debate-argument' }, { num: count })
    default:
      throw Error()
  }
}

const Contributor: FC<ContributorProps> = ({ contributor: contributorFragment }) => {
  const contributor = useFragment(FRAGMENT, contributorFragment)
  const intl = useIntl()
  const { user, contributions } = contributor

  return (
    <Flex direction="column" align="center" width="25%">
      <UserAvatar user={user} size="xl" mb={2} />

      <Text color="blue.900" {...headingStyles.h5} fontWeight={CapUIFontWeight.Semibold} uppercase mb={1}>
        {user.username}
      </Text>

      {contributions.map(contribution => (
        <Text color="gray.900" key={contribution.type} fontSize={CapUIFontSize.Caption} capitalize>
          {getContributionWording(contribution.type, intl, contribution.totalCount)}
        </Text>
      ))}
    </Flex>
  )
}

export default Contributor
