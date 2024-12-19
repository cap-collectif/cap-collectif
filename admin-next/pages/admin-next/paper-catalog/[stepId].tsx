import * as React from 'react'
import { NextPage } from 'next'
import { useIntl } from 'react-intl'
import { PageProps } from 'types'
import withPageAuthRequired from '@utils/withPageAuthRequired'
import { useRouter } from 'next/router'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { StepIdQuery } from '@relay/StepIdQuery.graphql'
import { Flex, Spinner, CapUIIconSize, Box, Button, CapUIIcon, Heading, Icon } from '@cap-collectif/ui'
import ProposalCard from '@components/Proposal/ProposalCard'
import styled from 'styled-components'
import { ProposalCard_proposal$key } from '@relay/ProposalCard_proposal.graphql'

export interface PaperCatalogPageProps {
  stepId: string
}

export const QUERY = graphql`
  query StepIdQuery($id: ID!) {
    node(id: $id) {
      ... on SelectionStep {
        proposals(first: 10000, orderBy: [{ field: CATEGORY, direction: DESC }, { field: COST, direction: ASC }]) {
          edges {
            node {
              ...ProposalCard_proposal
              district {
                name
              }
            }
          }
        }
      }
    }
  }
`

const Print = styled(Box)`
  @media print {
    width: 100% !important;
    padding: 0 !important;
    .no-print {
      display: none !important;
    }
    .proposalCard {
      height: 23.5vh !important;
    }
    .proposalCard.break {
      page-break-after: always;
    }
    .areaHeading {
      page-break-before: always;
    }
    .areaHeading h1 {
      font-size: 20px !important;
    }
  }
  .proposalCard:last-child {
    border-bottom: none !important;
  }
`

type Array = {
  district: string
}[]

const groupBy = (arr: Array) => {
  return arr.reduce((acc: any, cur) => {
    acc[cur['district']] = [...(acc[cur['district']] || []), cur]
    return acc
  }, {})
}

const NO_AREA = 'NO_AREA'

const PaperCatalogPage: React.FC<PaperCatalogPageProps> = ({ stepId }) => {
  const intl = useIntl()

  const response = useLazyLoadQuery<StepIdQuery>(QUERY, { id: stepId })
  if (!response.node) return null

  const proposals = response.node.proposals?.edges?.map(edge => ({
    ...edge?.node,
    district: edge?.node?.district?.name || NO_AREA,
  }))

  if (!proposals || !proposals.length) return null

  const groupedByAreaProposals = groupBy(proposals)
  const areas = Object.keys(groupedByAreaProposals)
  return (
    <Print margin="auto" width="1200px" id="mainContainer" px="5.33%">
      <Button
        zIndex={10}
        variant="primary"
        leftIcon={CapUIIcon.Print}
        variantSize="big"
        position="fixed"
        right="40px"
        top="40px"
        className="no-print"
        onClick={() => window.print()}
      >
        {intl.formatMessage({ id: 'print-the-catalog' })}
      </Button>
      {areas.map((area, index) => {
        return (
          <Box key={index}>
            <Flex
              alignItems="center"
              className="areaHeading"
              mt={1}
              mx={4}
              pb={2}
              borderBottom="2px solid #C4C4C4"
              display={area === NO_AREA ? 'none' : 'flex'}
            >
              <Icon name={CapUIIcon.Pin} size={CapUIIconSize.Lg} color="gray.500" mr={2} />
              <Heading as="h1" fontSize="25px" lineHeight="initial">
                {area}
              </Heading>
            </Flex>
            {groupedByAreaProposals[area].map((proposal: ProposalCard_proposal$key, idx: number) => {
              if (!proposal) return null
              return <ProposalCard key={idx} proposal={proposal} className={idx && !((idx + 1) % 4) ? 'break' : ''} />
            })}
          </Box>
        )
      })}
    </Print>
  )
}

const PaperCatalog: NextPage<PageProps> = () => {
  const router = useRouter()
  const { stepId } = router.query
  if (stepId) {
    return (
      <React.Suspense
        fallback={
          <Flex alignItems="center" justifyContent="center">
            <Spinner size={CapUIIconSize.Xxl} color="gray.150" />
          </Flex>
        }
      >
        <PaperCatalogPage stepId={String(stepId)} />
      </React.Suspense>
    )
  }
  return null
}

export const getServerSideProps = withPageAuthRequired

export default PaperCatalog
