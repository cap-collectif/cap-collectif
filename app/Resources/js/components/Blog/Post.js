import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin, FormattedDate } from 'react-intl';

export const Post = React.createClass({
  displayName: 'Post',
  propTypes: {
    post: PropTypes.object.isRequired,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { post, features } = this.props;
    return (
        <li className="media media--news block block--bordered box">
          <a href="/blog/post-8" className="pull-left" alt="Post 8">
              <img role="presentation" />
          </a>
          <div className="media-body">
            <h2 className="media-title h3">
              <a href={post._links.show} alt={post.title}>{ post.title }</a>
            </h2>
            <p className="excerpt  media--news__meta">
              {
                post.themes.map((theme, i) => <a key={i} href={theme.url}><span className="label label-default">{theme.title}</span></a>)
              }
              Le <FormattedDate date={post.publishedAt} />
              par { post.authors.map((author, i) =>
                <span key={i}>
                  {
                    features.profiles
                      ? <a href={author._links.show}>{author.displayName}</a>
                      : author.displayName
                  }
                  {
                    post.authors.length > i && ','
                  }
                </span>
              )}
            </p>
            <p className="media--news__text">{ post.abstract }</p>
          </div>
        </li>
      );
  },

});

const mapStateToProps = (state) => {
  return {
    features: state.default.features,
  };
};

export default connect(mapStateToProps)(Post);
