import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import ProposalListFilterSorting from './ProposalListFilterSorting';
import ProposalRandom from './ProposalRandom';

export const ProposalListRandomRow = React.createClass({
  propTypes: {
    orderByVotes: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      orderByVotes: false,
    };
  },

  render() {
    const { orderByVotes } = this.props;
    return (
      <div>
        <Row>
          <Col xs={4} md={4}>
            <ProposalListFilterSorting orderByVotes={orderByVotes} />
          </Col>
          <Col xs={8} md={8}>
            <ProposalRandom />
          </Col>
        </Row>
      </div>
    );
  },
});

export default connect()(ProposalListRandomRow);
