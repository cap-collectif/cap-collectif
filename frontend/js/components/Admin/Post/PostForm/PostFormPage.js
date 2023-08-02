// @flow
import * as React from 'react';
import {
  graphql,
  type GraphQLTaggedNode,
  type PreloadedQuery,
  usePreloadedQuery,
} from 'react-relay';
import { useIntl } from 'react-intl';

import moment from 'moment';
import { type PostFormPageQuery as PostFormPageQueryType } from '~relay/PostFormPageQuery.graphql';
import PostForm from './PostForm';

type Props = {|
  +queryReference: PreloadedQuery<PostFormPageQueryType>,
  +postId: string,
  +isAdmin: boolean,
  +proposalId: string,
|};

export const PostFormPageQuery: GraphQLTaggedNode = graphql`
  query PostFormPageQuery(
    $postId: ID!
    $affiliations: [ProjectAffiliation!]
    $isAdmin: Boolean!
    $proposalId: ID!
    $hasProposal: Boolean!
  ) {
    ...PostForm_query @arguments(affiliations: $affiliations, isAdmin: $isAdmin, postId: $postId)
    post: node(id: $postId) {
      ... on Post {
        id
        title
        authors {
          id
          username
        }
        abstract
        body
        media {
          id
          url
          name
        }
        isPublished
        publishedAt
        commentable
        displayedOnBlog
        translations {
          locale
          title
          body
          abstract
          metaDescription
        }
        metaDescription
        customCode
        relatedContent {
          __typename
          ... on Project {
            id
            title
          }
          ... on Proposal {
            id
            title
          }
          ... on Theme {
            id
            title
          }
        }
      }
    }
    proposal: node(id: $proposalId) @include(if: $hasProposal) {
      ... on Proposal {
        id
        title
      }
    }
    viewer {
      isSuperAdmin
      isProjectAdmin
      id
      username
      organizations {
        id
        displayName
      }
    }
    locales {
      id
      traductionKey
      code
      isDefault
    }
  }
`;

const PostFormPage = ({ queryReference, postId, isAdmin }: Props): React.Node => {
  const query = usePreloadedQuery<PostFormPageQueryType>(PostFormPageQuery, queryReference);
  const { post, locales } = query;
  const currentLocale = locales.find(locale => locale.isDefault);
  const intl = useIntl();
  const getTranslations = () => {
    return locales.reduce((acc, locale) => {
      const trans =
        post?.translations?.find(translation => translation.locale === locale.code) || null;
      const initialForLocal = {};
      if (trans) {
        initialForLocal[`${trans.locale}-title`] = trans.title;
        initialForLocal[`${trans.locale}-body`] = trans.body;
        initialForLocal[`${trans.locale}-abstract`] = trans.abstract;
        initialForLocal[`${trans.locale}-meta_description`] = trans.metaDescription;
      } else {
        initialForLocal[`${locale.code}-title`] = null;
        initialForLocal[`${locale.code}-body`] = null;
        initialForLocal[`${locale.code}-abstract`] = null;
        initialForLocal[`${locale.code}-meta_description`] = null;
      }
      return { ...acc, [`${locale.code}`]: initialForLocal };
    }, {});
  };

  const getInitialValues = () => {
    if (!postId) {
      return {
        ...getTranslations(),
        languages: currentLocale?.code || '',
        author: {
          value: query.viewer.id,
          label: query.viewer.username,
        },
        locales: locales.map(locale => locale.code),
        isAdmin,
        isProjectAdmin: query.viewer.isProjectAdmin,
        isSuperAdmin: query.viewer.isSuperAdmin,
        proposal: query.proposal?.title || null,
        proposalId: query.proposal?.id || null,
        has_comments: false,
        is_published: false,
        is_displayed: !!isAdmin,
        published_at: moment().format('YYYY-MM-DD HH:mm:ss'),
      };
    }

    const projects = post?.relatedContent?.filter(related => related.__typename === 'Project');
    const themes = post?.relatedContent?.filter(related => related.__typename === 'Theme');
    const proposal = post?.relatedContent?.filter(related => related.__typename === 'Proposal');
    return {
      ...getTranslations(),
      author:
        !!post?.authors && post?.authors?.length > 0
          ? post?.authors?.map(author => ({
              value: author?.id,
              label: author?.username,
            }))
          : null,
      media: post?.media,
      published_at: post?.publishedAt,
      custom_code: post?.customCode,
      has_comments: post?.commentable,
      is_published: post?.isPublished,
      is_displayed: post?.displayedOnBlog,
      languages: currentLocale?.code || '',
      locales: locales.map(locale => locale.code),
      isAdmin,
      isProjectAdmin: query.viewer.isProjectAdmin,
      isSuperAdmin: query.viewer.isSuperAdmin,
      project:
        projects && projects.length > 0
          ? projects.map(project => ({ value: project.id || null, label: project.title || '' }))
          : null,
      theme:
        themes && themes.length > 0
          ? themes.map(theme => ({ value: theme.id || null, label: theme.title || '' }))
          : null,
      proposal: proposal && proposal.length > 0 && proposal[0]?.title ? proposal[0]?.title : null,
      proposalId: proposal && proposal.length > 0 && proposal[0]?.id ? proposal[0]?.id : null,
    };
  };
  return (
    <React.Suspense>
      <PostForm
        initialValues={getInitialValues()}
        query={query}
        intl={intl}
        isAdmin={isAdmin}
        locales={locales}
      />
    </React.Suspense>
  );
};

export default PostFormPage;
