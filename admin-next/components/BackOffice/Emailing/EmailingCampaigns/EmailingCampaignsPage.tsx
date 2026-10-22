import {
  Button,
  CapUIIcon,
  CapUISpotIcon,
  CapUISpotIconSize,
  Flex,
  Heading,
  Search,
  SpotIcon,
  Text,
} from '@cap-collectif/ui'
import { useAppContext } from '@components/BackOffice/AppProvider/App.context'
import CreateEmailingCampaignMutation from '@mutations/CreateEmailingCampaignMutation'
import type { EmailingCampaignsPageQuery } from '@relay/EmailingCampaignsPageQuery.graphql'
import debounce from '@shared/utils/debounce-promise'
import { mutationErrorToast } from '@shared/utils/toasts'
import TablePlaceholder from '@ui/Table/TablePlaceholder'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import EmailingHelpLink from '../EmailingHelpLink'
import MailjetSandboxMessage from '../MailjetSandboxMessage'
import { CONNECTION_NODES_PER_PAGE, getEmailingCampaignUrl } from '../utils'
import EmailingCampaignList from './EmailingCampaignList'

const QUERY = graphql`
  query EmailingCampaignsPageQuery($count: Int!, $affiliations: [EmailingCampaignAffiliation!]) {
    viewer {
      ...EmailingCampaignList_viewer
      allCampaigns: emailingCampaigns(affiliations: $affiliations) {
        totalCount
      }
      ...EmailingCampaignList_emailingCampaignOwner @arguments(count: $count, affiliations: $affiliations)
      organizations {
        id
        allCampaigns: emailingCampaigns(affiliations: $affiliations) {
          totalCount
        }
        ...EmailingCampaignList_emailingCampaignOwner @arguments(count: $count, affiliations: $affiliations)
      }
    }
  }
`

const CreateEmailingCampaignButton: React.FC<{ organizationId: string | null; variantSize: 'small' | 'big' }> = ({
  organizationId,
  variantSize,
}) => {
  const intl = useIntl()
  const [isCreating, setIsCreating] = React.useState(false)

  const onCreate = () => {
    setIsCreating(true)
    // Within an organization, the campaign belongs to the organization rather than to its creator
    return CreateEmailingCampaignMutation.commit({ input: { owner: organizationId } })
      .then(response => {
        const id = response.createEmailingCampaign?.emailingCampaign?.id
        if (response.createEmailingCampaign?.error || !id) {
          setIsCreating(false)
          return mutationErrorToast(intl)
        }
        window.location.href = getEmailingCampaignUrl(id)
      })
      .catch(() => {
        setIsCreating(false)
        mutationErrorToast(intl)
      })
  }

  return (
    <Button
      variant="primary"
      variantColor="primary"
      variantSize={variantSize}
      leftIcon={CapUIIcon.Add}
      isLoading={isCreating}
      onClick={onCreate}
      data-cy="create-emailing-campaign-button"
    >
      {intl.formatMessage({ id: 'create-mail' })}
    </Button>
  )
}

const EmailingCampaignsNoResult: React.FC<{ organizationId: string | null }> = ({ organizationId }) => {
  const intl = useIntl()

  return (
    <Flex direction="row" spacing={8} bg="white" py="96px" px="111px" borderRadius="normal">
      <SpotIcon name={CapUISpotIcon.EMAIL_SEND} size={CapUISpotIconSize.Lg} />
      <Flex direction="column" color="blue.900" align="flex-start" width="300px">
        <Heading as="h3" mb={2}>
          {intl.formatMessage({ id: 'empty.emailingCampaign' })}
        </Heading>
        <Text mb={8}>{intl.formatMessage({ id: 'empty.emailingCampaign.indication' })}</Text>
        <CreateEmailingCampaignButton organizationId={organizationId} variantSize="big" />
      </Flex>
    </Flex>
  )
}

const EmailingCampaignsPage: React.FC = () => {
  const intl = useIntl()
  const { viewerSession } = useAppContext()
  const [term, setTerm] = React.useState('')
  const onTermChange = debounce((value: string) => setTerm(value), 400)

  const { viewer } = useLazyLoadQuery<EmailingCampaignsPageQuery>(QUERY, {
    count: CONNECTION_NODES_PER_PAGE,
    affiliations: viewerSession.isAdmin ? null : ['OWNER'],
  })
  // An organization member manages the campaigns of its organization
  const organization = viewer.organizations?.[0] ?? null
  const owner = organization ?? viewer
  const organizationId = organization?.id ?? null

  return (
    <Flex direction="column" spacing={6}>
      <MailjetSandboxMessage />
      {owner.allCampaigns.totalCount > 0 ? (
        <Flex direction="column" p={8} spacing={4} bg="white" borderRadius="normal" overflow="hidden">
          <Flex direction="row" spacing={6} align="center">
            <CreateEmailingCampaignButton organizationId={organizationId} variantSize="small" />
            <Search
              id="search-emailing-campaign"
              onChange={onTermChange}
              value={term}
              placeholder={intl.formatMessage({ id: 'admin.emailing-campaigns.search' })}
              aria-label={intl.formatMessage({ id: 'admin.emailing-campaigns.search' })}
            />
            <EmailingHelpLink helpLabel="about-campaigns" />
          </Flex>
          <React.Suspense fallback={<TablePlaceholder rowsCount={20} columnsCount={4} />}>
            <EmailingCampaignList
              emailingCampaignOwner={owner}
              viewer={viewer}
              term={term}
              resetTerm={() => setTerm('')}
            />
          </React.Suspense>
        </Flex>
      ) : (
        <>
          <EmailingHelpLink helpLabel="about-campaigns" />
          <EmailingCampaignsNoResult organizationId={organizationId} />
        </>
      )}
    </Flex>
  )
}

export default EmailingCampaignsPage
