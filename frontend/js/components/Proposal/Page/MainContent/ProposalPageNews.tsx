import React, { useState } from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage } from 'react-intl'
import { NavItem } from 'react-bootstrap'

import styled from 'styled-components'
import { Button, Box, Flex, Card, Text, Icon, CapUIIcon, CapUIIconSize } from '@cap-collectif/ui'
import colors from '~/utils/colors'
import NewsCard from '~/components/Ui/News/NewsCard'
import type { ProposalPageNews_proposal$data } from '~relay/ProposalPageNews_proposal.graphql'
import {
  Card as LegacyCard,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style'
import ProposalNewsCreateModal from '~/components/Proposal/Page/Blog/ProposalNewsCreateModal'

type Props = {
  proposal: ProposalPageNews_proposal$data | null | undefined
  goToBlog: () => void
}
export const NewsCardHolder = styled.div`
  > .Card {
    margin-bottom: 15px;
  }

  > li {
    list-style: none;
    svg {
      margin-right: 8px;
    }
    a {
      display: flex;
      align-items: center;
    }
  }

  #card-add-proposal-news {
    svg {
      margin: auto;
    }
  }
`
export const ProposalPageNews = ({ proposal, goToBlog }: Props) => {
  const [showModal, displayModal] = useState(false)
  if (!proposal) return null
  const news = proposal?.news?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    .filter(Boolean)
    .filter(e => e.title !== 'Réponse officielle')
  // Cet homme est diplomé
  const viewerIsAuthor = typeof proposal.viewerDidAuthor !== 'undefined' ? proposal.viewerDidAuthor : false
  if ((!news || !news.length) && (!proposal.isProposalAuthorAllowedToAddNews || !viewerIsAuthor)) return null
  const checkNews = news && news.length > 0
  return (
    <LegacyCard>
      <CategoryContainer>
        <ProposalNewsCreateModal show={showModal} displayModal={displayModal} proposal={proposal} />
        <Flex>
          <CategoryTitle>
            <CategoryCircledIcon paddingLeft={9}>
              {/** @ts-ignore size en dur */}
              <Icon name={CapUIIcon.Newspaper} size={20} color={colors.secondaryGray} />
            </CategoryCircledIcon>
            <h3>
              <FormattedMessage id={checkNews ? 'menu.news' : 'proposal.admin.news'} />
            </h3>
          </CategoryTitle>
          <Box>
            {checkNews && proposal.isProposalAuthorAllowedToAddNews && viewerIsAuthor && (
              <>
                <Button
                  id="add-proposal-news"
                  variant="secondary"
                  leftIcon={CapUIIcon.Add}
                  variantColor="primary"
                  variantSize="small"
                  className="mb-20"
                  onClick={() => displayModal(true)}
                >
                  <FormattedMessage id="global.add" />
                </Button>
              </>
            )}
          </Box>
        </Flex>
        <NewsCardHolder>
          {news && news.length > 0 ? (
            <>
              <NewsCard post={news[0] || null} />
              {news && news.length > 1 && <NewsCard post={news[1] || null} />}
              {news && news.length > 2 && (
                <NavItem eventKey="blog" onClick={goToBlog}>
                  <Icon name={CapUIIcon.Add} size={CapUIIconSize.Sm} color="currentColor" />
                  <FormattedMessage id="global.more" />
                </NavItem>
              )}
            </>
          ) : null}
          {!news ||
            (news.length === 0 && proposal.isProposalAuthorAllowedToAddNews && viewerIsAuthor && (
              <Card
                // @ts-ignore Polymorphic stuff
                as={Flex}
                flexDirection="column"
                alignContent="center"
                textAlign="center"
                id="card-add-proposal-news"
                backgroundColor="#fafafa"
                border="none"
                justifyContent="center"
                width="100%"
                height="100%"
                pt={70}
                pb={91}
              >
                {/** @ts-ignore size en dur */}
                <Icon name={CapUIIcon.Newspaper} size={40} color="#BEC4CB" />
                <h4 color="gray.900">
                  <FormattedMessage id="add-proposal-news" />
                </h4>
                <Text color="gray.600" fontSize={14}>
                  <FormattedMessage id="proposal-news-body" />
                </Text>
                <Button
                  id="add-proposal-news"
                  leftIcon={CapUIIcon.Add}
                  variant="primary"
                  margin="auto"
                  mt={3}
                  variantColor="primary"
                  variantSize="small"
                  onClick={() => displayModal(true)}
                >
                  <FormattedMessage id="global.add" />
                </Button>
              </Card>
            ))}
        </NewsCardHolder>
      </CategoryContainer>
    </LegacyCard>
  )
}
export default createFragmentContainer(ProposalPageNews, {
  proposal: graphql`
    fragment ProposalPageNews_proposal on Proposal @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      news {
        edges {
          node {
            id
            title
            ...NewsCard_post
          }
        }
      }
      isProposalAuthorAllowedToAddNews
      ...ProposalNewsCreateModal_proposal
      viewerDidAuthor @include(if: $isAuthenticated)
    }
  `,
})
