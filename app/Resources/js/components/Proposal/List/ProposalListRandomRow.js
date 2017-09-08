// @flow
import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProposalListOrderSorting from './ProposalListOrderSorting';
import PropalListRandomMessage from './PropalListRandomMessage';

type Props = { orderByVotes: boolean };

class ProposalListRandomRow extends React.Component<Props> {
  static defaultProps = {
    orderByVotes: false,
  };

  render() {
    // eslint-disable-next-line react/prop-types
    const { orderByVotes } = this.props;
    return (
      <div>
        <Row>
          <Col xs={4} md={4}>
            <ProposalListOrderSorting orderByVotes={orderByVotes} />
          </Col>
          <Col xs={8} md={8}>
            <PropalListRandomMessage />
          </Col>
        </Row>
      </div>
    );
  }
}

export default ProposalListRandomRow;
