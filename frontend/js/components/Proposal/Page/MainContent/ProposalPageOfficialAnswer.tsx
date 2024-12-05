import React from 'react'
import moment from 'moment'
import { createFragmentContainer, graphql } from 'react-relay'
import { FormattedMessage, FormattedDate } from 'react-intl'

import styled from 'styled-components'
import { Box, Skeleton } from '@cap-collectif/ui'
import BodyText from '~/components/Ui/Boxes/BodyText'
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon'
import colors from '~/utils/colors'
import UserAvatarList from '~/components/Ui/List/UserAvatarList'
import Avatar from '~/components/Ui/Medias/Avatar'
import DefaultAvatar from '~/components/User/DefaultAvatar'
import type { ProposalPageOfficialAnswer_proposal } from '~relay/ProposalPageOfficialAnswer_proposal.graphql'
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style'

type Props = {
  proposal: ProposalPageOfficialAnswer_proposal | null | undefined
}
const DecidorAvatarList = styled.div`
  display: flex;
  margin-bottom: 20px;

  .UserAvatarListWrapper > div:after {
    content: '★';
    height: 12px;
    border-radius: 10px;
    position: absolute;
    left: 18px;
    color: ${colors.white};
    padding: 1px 2px;
    z-index: 1;
    font-size: 8px;
    background: ${colors.yellow};
    top: 0px;
  }

  .UserAvatarListWrapper + span {
    font-weight: 600;
    margin-left: 15px;
    margin-right: 5px;
  }

  span + span {
    margin-left: 5px;
  }
`
const DecidorAvatar = styled(Avatar)`
  border: 1px solid ${colors.white} !important;
  box-shadow: 1px 1px ${colors.yellow}, -1px -1px ${colors.yellow}, -1px 1px ${colors.yellow}, 1px -1px ${colors.yellow};
`
const DecidorDefaultAvatar = styled(DefaultAvatar)`
  border: 1px solid ${colors.white} !important;
  box-shadow: 1px 1px ${colors.yellow}, -1px -1px ${colors.yellow}, -1px 1px ${colors.yellow}, 1px -1px ${colors.yellow} !important;
  border-radius: 20px;
`

const Placeholder = () => (
  <Box ml={4}>
    <Skeleton.Text width="100%" size="sm" mb={4} />
    <Skeleton.Text width="50%" size="sm" />
  </Box>
)

export const ProposalPageOfficialAnswer = ({ proposal }: Props) => {
  if (!proposal) return null
  if (!proposal.officialResponse || !proposal.officialResponse.isPublished) return null
  const authors = proposal.officialResponse.authors || []
  return (
    <Card withBorder>
      <CategoryContainer>
        <CategoryTitle>
          <CategoryCircledIcon paddingLeft={7}>
            <Icon name={ICON_NAME.stamp} size={20} color={colors.secondaryGray} />
          </CategoryCircledIcon>
          <h3 className="proposal__last__news__title">
            <FormattedMessage id="card.title.official.answer" />
          </h3>
        </CategoryTitle>
        <DecidorAvatarList>
          {authors?.length ? (
            <>
              <UserAvatarList max={3}>
                {authors?.map((author, index) =>
                  author.media?.url ? (
                    <DecidorAvatar size={25} alt={author.username} src={author.media?.url} key={index} />
                  ) : (
                    <DecidorDefaultAvatar size={25} key={index} className="img-circle avatar" />
                  ),
                )}
              </UserAvatarList>
              {authors?.length < 2 ? (
                <span>{authors[0].username}</span>
              ) : (
                <FormattedMessage
                  id="project-authors"
                  values={{
                    authorName: authors[0].username,
                    number: authors.length - 1,
                  }}
                />
              )}
              {' • '}
            </>
          ) : null}
          <FormattedDate
            value={moment(proposal.officialResponse?.publishedAt)}
            day="numeric"
            month="long"
            year="numeric"
            hour="numeric"
            minute="numeric"
          />
        </DecidorAvatarList>
        <Skeleton placeholder={<Placeholder />} isLoaded={proposal !== null}>
          {proposal && <BodyText maxLines={8} text={proposal.officialResponse?.body} />}
        </Skeleton>
      </CategoryContainer>
    </Card>
  )
}
export default createFragmentContainer(ProposalPageOfficialAnswer, {
  proposal: graphql`
    fragment ProposalPageOfficialAnswer_proposal on Proposal {
      id
      officialResponse {
        id
        body
        authors {
          id
          username
          media {
            id
            url
          }
        }
        publishedAt
        isPublished
      }
    }
  `,
})
