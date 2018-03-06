import React from 'react';
import { Row } from 'react-bootstrap';
import IdeaListItem from './IdeaListItem';

const IdeasList = React.createClass({
  propTypes: {
    ideas: React.PropTypes.array.isRequired
  },

  render() {
    const { ideas } = this.props;
    if (ideas.length > 0) {
      return <Row>{ideas.map(idea => <IdeaListItem key={idea.id} idea={idea} />)}</Row>;
    }
    return null;
  }
});

export default IdeasList;
