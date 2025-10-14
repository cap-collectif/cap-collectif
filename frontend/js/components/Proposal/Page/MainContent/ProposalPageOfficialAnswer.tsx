import React from 'react';
import moment from 'moment';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { Box, Flex, Skeleton } from '@cap-collectif/ui';
import BodyText from '~/components/Ui/Boxes/BodyText';
import Icon, { ICON_NAME } from '@shared/ui/LegacyIcons/Icon';
import colors from '~/utils/colors';
import type { ProposalPageOfficialAnswer_proposal$data } from '~relay/ProposalPageOfficialAnswer_proposal.graphql';
import {
  Card,
  CategoryContainer,
  CategoryCircledIcon,
  CategoryTitle,
} from '~/components/Proposal/Page/ProposalPage.style';
import UserAvatar from '~/components/User/UserAvatar';

type Props = {
  proposal: ProposalPageOfficialAnswer_proposal$data | null | undefined,
};

const Placeholder = () => (
  <Box ml={4}>
    <Skeleton.Text width="100%" size="sm" mb={4} />
    <Skeleton.Text width="50%" size="sm" />
  </Box>
);

export const ProposalPageOfficialAnswer = ({ proposal }: Props) => {
  if (!proposal) return null;
  if (!proposal.officialResponse || !proposal.officialResponse.isPublished) return null;
  const authors = proposal.officialResponse.authors || [];
  return (
    <Card withBorder>
      <CategoryContainer>
        <CategoryTitle>
          <CategoryCircledIcon paddingLeft={7}>
            <Icon name={ICON_NAME.stamp} size={20} color={colors.secondaryGray} />
          </CategoryCircledIcon>
          <h2 className="proposal__last__news__title">
            <FormattedMessage id="card.title.official.answer" />
          </h2>
        </CategoryTitle>
        <Flex mb={5} gap={1}>
          {authors?.length ? (
            <>
              <UserAvatar user={authors[0]} size="sm" border="2px solid" borderColor="yellow.500" />
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
        </Flex>
        <Skeleton placeholder={<Placeholder />} isLoaded={proposal !== null}>
          {proposal && <BodyText maxLines={8} text={proposal.officialResponse?.body} />}
        </Skeleton>
      </CategoryContainer>
    </Card>
  );
};
export default createFragmentContainer(ProposalPageOfficialAnswer, {
  proposal: graphql`
    fragment ProposalPageOfficialAnswer_proposal on Proposal {
      id
      officialResponse {
        id
        body
        authors {
          ...UserAvatar_user
          id
          username
        }
        publishedAt
        isPublished
      }
    }
  `,
});
