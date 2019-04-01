// @flow
import * as React from 'react';
import { Row, Col } from 'react-bootstrap';
import { graphql, createFragmentContainer } from 'react-relay';
import type { ProposalMediaResponse_medias } from '~relay/ProposalMediaResponse_medias.graphql';

type Props = {
  medias: ProposalMediaResponse_medias,
};

export class ProposalMediaResponse extends React.PureComponent<Props> {
  render() {
    const { medias } = this.props;
    if (!medias || medias.length === 0) {
      return null;
    }
    return (
      <Row>
        {medias.map((media, key) => (
          <Col xs={12} md={12} lg={12} key={key}>
            <i className="capco cap-file-1-1" />
            &nbsp;
            <a className="external-link" href={media.url} rel="noopener noreferrer">
              {media.name} ({media.size})
            </a>
          </Col>
        ))}
      </Row>
    );
  }
}

export default createFragmentContainer(
  ProposalMediaResponse,
  graphql`
    fragment ProposalMediaResponse_medias on Media @relay(plural: true) {
      id
      name
      size
      url
    }
  `,
);
