import React, { PropTypes } from 'react';
import { Row } from 'react-bootstrap';
import { IntlMixin, FormattedMessage } from 'react-intl';
import Post from './Post';

const ProposalPageBlog = React.createClass({
  displayName: 'ProposalPageBlog',
  propTypes: {
    proposal: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    this.loadProposalBlogPosts();
  },

  render() {
    const { proposal } = this.props;
    const { votesCount, posts } = proposal;
    return (
      <div>
        <h2>
          <FormattedMessage
            message={this.getIntlMessage('proposal.vote.count')}
            num={votesCount}
          />
        </h2>
        <Row>
          {
            posts.map((post, index) => <Post post={post} key={index} />)
          }
        </Row>
      </div>
    );
  },

});

export default ProposalPageBlog;
