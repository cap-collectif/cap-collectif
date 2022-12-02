// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useSelector } from 'react-redux';
import type { PostCard_post$key } from '~relay/PostCard_post.graphql';
import type { AppBoxProps } from '~ui/Primitives/AppBox.type';
import AppBox from '~ui/Primitives/AppBox';
import { ICON_NAME } from '~ds/Icon/Icon';
import Card from '~ds/Card/Card';
import Flex from '../Primitives/Layout/Flex';
import Heading from '../Primitives/Heading';
import { formatInfo } from '../Project/ProjectCard.utils';

type Props = {|
  ...AppBoxProps,
  +post: PostCard_post$key,
|};

const FRAGMENT = graphql`
  fragment PostCard_post on Post {
    id
    title
    url
    media {
      url
    }
    themes {
      id
      title
    }
  }
`;

const PostCoverPlaceholder = ({ backgroundColor }: { backgroundColor: string }) => (
  <Card
    width="112px"
    borderRadius="accordion"
    overflow="hidden"
    height="78px"
    objectFit="cover"
    mr={4}
    flexShrink={0}
    p={3}
    bg={backgroundColor}>
    <svg
      x="0px"
      y="0px"
      viewBox="-146.5 -110.5 335.5 301.5"
      enableBackground="new -146.5 -110.5 335.5 301.5"
      xmlSpace="preserve"
      style={{ margin: '0 auto', display: 'block', height: '100%' }}>
      <line
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        x1="-51.639"
        y1="-51.638"
        x2="51.913"
        y2="-51.638"
      />
      <rect
        x="-51.639"
        y="-27.741"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        width="55.757"
        height="63.724"
      />
      <line
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        x1="28.02"
        y1="-11.809"
        x2="51.913"
        y2="-11.809"
      />
      <line
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        x1="20.052"
        y1="4.119"
        x2="51.913"
        y2="4.119"
      />
      <line
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        x1="20.052"
        y1="20.052"
        x2="51.913"
        y2="20.052"
      />
      <line
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        x1="20.052"
        y1="35.982"
        x2="51.913"
        y2="35.982"
      />
      <line
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        x1="-51.639"
        y1="51.913"
        x2="51.913"
        y2="51.913"
      />
      <line
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        x1="-51.639"
        y1="67.846"
        x2="51.913"
        y2="67.846"
      />
      <line
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        x1="-51.639"
        y1="83.777"
        x2="51.913"
        y2="83.777"
      />
      <line
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        x1="-51.639"
        y1="99.709"
        x2="51.913"
        y2="99.709"
      />
      <path
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        d="M115.637,147.5H-51.639c-19.914,0-31.861-11.946-31.861-31.863V-83.5H83.777v199.137C83.777,133.232,98.041,147.5,115.637,147.5c17.592,0,31.863-14.268,31.863-31.863V-51.638h-39.827"
      />
      <path
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit="10"
        d="M107.673-35.707h15.937v151.343c0,4.403-3.576,7.973-7.973,7.973s-7.964-3.569-7.964-7.973V-67.568H83.777"
      />
    </svg>
  </Card>
);

export const PostCard = ({ post: postQuery, ...props }: Props) => {
  const post = useFragment(FRAGMENT, postQuery);
  const backgroundColor = useSelector(state => state.default.parameters['color.btn.primary.bg']);

  return (
    <AppBox
      as="a"
      href={post.url}
      display="grid"
      width="100%"
      css={{ '&:hover': { textDecoration: 'none' } }}>
      <Card
        bg="white"
        p={2}
        flexDirection="row"
        overflow="hidden"
        display="flex"
        border="normal"
        position="relative"
        {...props}>
        {post.media?.url ? (
          <Card
            as="img"
            src={post.media?.url}
            alt="banner"
            width="112px"
            borderRadius="accordion"
            overflow="hidden"
            height="78px"
            objectFit="cover"
            mr={4}
            flexShrink={0}
            p={0}
          />
        ) : (
          <PostCoverPlaceholder backgroundColor={backgroundColor} />
        )}
        <Flex direction="column" overflow="hidden" justify="space-between">
          <Heading as="h4" mb={2} color="gray.900">
            {post.title}
          </Heading>
          <AppBox color="neutral-gray.700">
            {post.themes.length > 0 &&
              formatInfo(
                ICON_NAME.FOLDER_O,
                post.themes?.map(({ title }) => title).join(', ') || '',
                false,
              )}
          </AppBox>
        </Flex>
      </Card>
    </AppBox>
  );
};

PostCard.displayName = 'PostCard';

export default PostCard;
