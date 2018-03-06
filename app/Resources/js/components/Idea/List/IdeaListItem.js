import React from 'react';
import { Col } from 'react-bootstrap';
import IdeaPreview from '../Preview/IdeaPreview';

const IdeaListItem = React.createClass({
  propTypes: {
    idea: React.PropTypes.object.isRequired
  },

  render() {
    const { idea } = this.props;
    return (
      <Col xs={12} sm={6} md={4} lg={3}>
        <IdeaPreview idea={idea} />
      </Col>
    );
  }
});

export default IdeaListItem;
