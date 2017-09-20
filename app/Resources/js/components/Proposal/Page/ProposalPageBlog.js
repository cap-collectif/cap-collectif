import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import Post from '../../Blog/Post';
import { fetchProposalPosts } from '../../../redux/modules/proposal';

export const ProposalPageBlog = React.createClass({
  propTypes: {
    proposal: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  },

  componentDidMount() {
    const { dispatch, proposal } = this.props;
    dispatch(fetchProposalPosts(proposal.id));
  },

  render() {
    const { proposal } = this.props;
    const { posts } = proposal;
    if (!posts || posts.length === 0) {
      return (
        <p>
          <FormattedMessage id="proposal.no_posts" />
        </p>
      );
    }
    return (
      <ul className="media-list" style={{ marginTop: 30 }}>
        {posts.map((post, index) => <Post post={post} key={index} />)}
      </ul>
    );
  },
});

const mapStateToProps = state => {
  return {
    proposal: state.proposal.proposalsById[state.proposal.currentProposalId],
  };
};

export default connect(mapStateToProps)(ProposalPageBlog);
