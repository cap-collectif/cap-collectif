// @flow
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { graphql, createFragmentContainer, type RelayRefetchProp } from 'react-relay';
import ProposalUserVoteItem from './ProposalUserVoteItem';

type Props = {
  step: Object,
};

type State = {
  items: Object
};


// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
});

class ProposalsUserVotesTable extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      items: this.props.step,
    };
  }

  onDragEnd = (result) => { // result
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.setState({
      items,
    });
  };

  render() {
    // const { step } = this.props;
    const { items } = this.state;

    console.log(items);

    return (
      <Row className="proposals-user-votes__table">
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                {items.viewerVotes.edges.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                          snapshot.isDragging,
                          provided.draggableProps.style
                        )}
                      >
                        <ProposalUserVoteItem key={index} classment={index} proposal={item.node.proposal} step={item} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </Row>
    );
  }
}

export default ProposalsUserVotesTable;
