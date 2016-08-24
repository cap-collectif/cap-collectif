import React, { PropTypes } from 'react';
import { Row } from 'react-bootstrap';
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
    return (
      <div>
        <Row>
          {
            posts && posts.map((post, index) => <Post post={post} key={index} />)
          }
        </Row>
      </div>
    );
  },

});

export default connect()(ProposalPageBlog);
