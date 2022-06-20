// @flow
import React from 'react';
import { useIntl } from 'react-intl';
import { graphql, useFragment } from 'react-relay';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import useIsMobile from '~/utils/hooks/useIsMobile';
import type { BlockPost_post$key } from '~relay/BlockPost_post.graphql';

type Props = {| +post: BlockPost_post$key |};

const FRAGMENT = graphql`
  fragment BlockPost_post on Post {
    title
    url
    media {
      name
      url
    }
    authors {
      id
      username
      url
    }
    themes {
      id
      title
      url
    }
    abstract
    publishedAt
  }
`;

/*  
The following is just a react encapsulation of the content that was previously
in the src/Capco/AppBundle/Resources/views/Blog/blockPost.html.twig file.
It is mandatory to allow frontend navigation within all steps of a project.
This is neither a rework nor a DS migration. It may come later if/when we decide to
refresh this page
*/
export const BlockPost = ({ post: dataPost }: Props) => {
  const post = useFragment(FRAGMENT, dataPost);
  const profiles = useFeatureFlag('profiles');
  const intl = useIntl();
  const isMobile = useIsMobile();

  if (!post) return null;

  const { title, authors, url, themes, abstract, publishedAt, media } = post;

  return (
    <li className="media media--news block block--bordered box">
      {media ? (
        <a href={url} className="pull-left">
          <img
            src={media.url}
            className="media-object"
            alt={media.name}
            style={{
              maxHeight: isMobile ? 300 : 150,
              width: isMobile ? '100%' : 192,
              objectFit: 'cover',
            }}
          />
        </a>
      ) : (
        <a href={url} className="pull-left">
          <div className="bg--post media-object">
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              width="110px"
              height="110px"
              viewBox="-146.5 -110.5 335.5 301.5"
              enableBackground="new -146.5 -110.5 335.5 301.5"
              xmlSpace="preserve"
              style={{ margin: '0 auto', display: 'block' }}>
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
          </div>
        </a>
      )}
      <div className="media-body">
        <h2 className="media-title" style={{ fontSize: 24 }}>
          <a href={url}>{title}</a>
        </h2>
        <p className="excerpt media--news__meta">
          {themes.map(theme => (
            <a href={theme.url} className="mr-5">
              <span className="label label-default">{theme.title}</span>
            </a>
          ))}
          {intl.formatDate(publishedAt, {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          {authors.length > 0 ? (
            <>
              {' '}
              {intl.formatMessage({ id: 'global.written_by' })}{' '}
              {authors.map((author, idx) => {
                let username;
                if (profiles) {
                  username = <a href={author.url}>{author.username}</a>;
                } else username = <span>{author.username}</span>;
                return (
                  <>
                    {username}
                    {idx !== authors.length - 1 && authors.length > 1 ? ', ' : null}
                  </>
                );
              })}
            </>
          ) : null}
        </p>
        {abstract ? <p className="media--news__text">{abstract}</p> : null}
      </div>
    </li>
  );
};

export default BlockPost;
