import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { ListGroupItem } from 'react-bootstrap';

const RankingSpot = React.createClass({
  propTypes: {
    children: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { id } = this.props;
    return (
      <ListGroupItem className="ranking__spot">
        {this.props.children}
      </ListGroupItem>
    );
  },

});

export default RankingSpot;
