import React from 'react';
import { IntlMixin } from 'react-intl';
import { Row } from 'react-bootstrap';
import IdeaListItem from './IdeaListItem';

const IdeasList = React.createClass({
  propTypes: {
    ideas: React.PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { ideas } = this.props;
    if (ideas.length > 0) {
      return (
        <Row>
          {
            ideas.map(idea => <IdeaListItem key={idea.id} idea={idea} />)
          }
        </Row>
      );
    }
    return null;
  },

});

export default IdeasList;
