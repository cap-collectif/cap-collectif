import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { IntlMixin } from 'react-intl';
import Post from '../../Blog/Post';
import { fetchProposalPosts } from '../../../redux/modules/proposal';

const ProposalPageBlog = React.createClass({
  displayName: 'ProposalPageBlog',
  propTypes: {
    proposal: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  componentDidMount() {
    const { dispatch, proposal } = this.props;
    dispatch(fetchProposalPosts(proposal.id));
  },

  render() {
    const { proposal } = this.props;
    const { posts } = proposal;
    if (!posts || posts.length === 0) {
      return <p>Aucune actualité</p>;
    }
    return (
        <ul className="media-list">
          {
            posts.map((post, index) => <Post post={post} key={index} />)
          }
        </ul>
    );
  },

});

const mapStateToProps = (state) => {
  return {
    proposal: state.proposal.proposals[state.proposal.currentProposalById],
  };
};

export default connect(mapStateToProps)(ProposalPageBlog);
