// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { connect, type MapStateToProps } from 'react-redux';
import { FormattedMessage, FormattedDate } from 'react-intl';
import moment from 'moment';
import type { Post_post } from './__generated__/Post_post.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';

type Props = {
  post: Post_post,
  features: Object,
};

export class Post extends React.Component<Props> {
  render() {
    const { post, features } = this.props;

    return (
      <li className="media media--news block block--bordered box">
        <a href={post.url} className="pull-left" alt="Post 8">
          {post.media ? (
            <img src={post.media.url} alt="" className="media-object" />
          ) : (
            <div className="bg--post  media-object">
              <svg
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="110px"
                height="110px"
                viewBox="-146.5 -110.5 335.5 301.5"
                enableBackground="new -146.5 -110.5 335.5 301.5"
                xmlSpace="preserve"
                style={{ margin: '0 auto', display: 'block ' }}>
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
          )}
        </a>
        <div className="media-body">
          <h3 className="media-title h3">
            <a href={post.url} alt={post.title}>
              {post.title}
            </a>
          </h3>
          <p className="excerpt  media--news__meta">
            {post.themes.map((theme, i) => (
              <span key={i}>
                <a key={i} href={theme.url}>
                  <span className="label label-default">{theme.title}</span>
                </a>
                {post.themes.length > i && ' '}
              </span>
            ))}
            <FormattedMessage
              id="global.byDate"
              values={{
                date: (
                  <FormattedDate
                    value={moment(post.publishedAt)}
                    day="numeric"
                    month="long"
                    year="numeric"
                  />
                ),
              }}
            />{' '}
            {post.authors.length > 0 && (
              <FormattedMessage
                id="global.byAuthor"
                values={{
                  author: (
                    <span>
                      {post.authors.map((author, i) => (
                        <span key={i}>
                          {features.profiles ? (
                            <a href={author.show_url}>{author.displayName}</a>
                          ) : (
                            author.displayName
                          )}
                          {post.authors.length > i + 1 && ', '}
                        </span>
                      ))}
                    </span>
                  ),
                }}
              />
            )}
          </p>
          <WYSIWYGRender className="media--news__text" value={post.abstract} />
        </div>
      </li>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = state => ({
  features: state.default.features,
});

const container = connect(mapStateToProps)(Post);

export default createFragmentContainer(
  container,
  graphql`
    fragment Post_post on Post {
      abstract
      url
      media {
        url
      }
      publishedAt
      title
      createdAt
      themes {
        title
        url
      }
      authors {
        id
        show_url
        vip
        displayName
      }
    }
  `,
);
