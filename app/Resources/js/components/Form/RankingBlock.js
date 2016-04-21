import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import RankingItem from './RankingItem';
import RankingSpot from './RankingSpot';
import { Row, Col, ListGroup } from 'react-bootstrap';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

const RankingBlock = React.createClass({
  propTypes: {
    field: PropTypes.object.isRequired,
    pickBoxItems: PropTypes.array,
    choiceBoxItems: PropTypes.array,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      allowOther: false,
      pickBoxItems: [],
      choiceBoxItems: [],
    };
  },

  render() {
    const { field, pickBoxItems, choiceBoxItems } = this.props;
    const nb = field.choices.length;
    return (
      <Row>
        <Col xs={6}>
          <ListGroup className="ranking__pick-box">
            {
              [...Array(nb)].map((x, i) => {
                const item = pickBoxItems[i];
                return (
                  <RankingSpot>
                    {
                      item
                      ? <RankingItem
                        choice={item}
                        id={'reply-' + field.id + '_choice-' + item.id}
                      />
                      : null
                    }
                  </RankingSpot>
                );
              })
            }
          </ListGroup>
        </Col>
        <Col xs={6}>
          <ListGroup className="ranking__choice-box">
            {
              [...Array(nb)].map((x, i) => {
                const item = choiceBoxItems[i];
                return (
                  <RankingSpot>
                    {
                      item
                        ? <RankingItem
                        choice={item}
                        id={'reply-' + field.id + '_choice-' + item.id}
                      />
                        : null
                    }
                  </RankingSpot>
                );
              })
            }
          </ListGroup>
        </Col>
      </Row>
    );
  },

});

export default DragDropContext(HTML5Backend)(RankingBlock);

export const ItemTypes = {
  ITEM: 'item',
}
