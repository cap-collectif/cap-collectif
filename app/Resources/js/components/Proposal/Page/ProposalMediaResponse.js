import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';

export const ProposalMediaResponse = React.createClass({
  propTypes: {
    medias: PropTypes.array.isRequired,
  },

  render() {
    const { medias } = this.props;
    if (!medias || medias.length === 0) {
      return null;
    }
    return (
      <Row>
        {medias.map((media, key) => {
          return (
            <Col xs={12} md={12} lg={12} key={key}>
              <i className="capco cap-file-1-1" />&nbsp;
              <a className="external-link" href={media.url} rel="noopener noreferrer">
                {media.name} ({media.size})
              </a>
            </Col>
          );
        })}
      </Row>
    );
  },
});

export default ProposalMediaResponse;
