// @flow
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import ProposalUserVoteItem from './ProposalUserVoteItem';
import UpdateProposalVoteMutation from '../../../mutations/UpdateProposalVoteMutation';


type Props = {
  step: Object,
};

type State = {
  items: Object
};


// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => { //
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const onSubmit = (values, dispatch, props) => {
  // const { step } = props;
  const { items } = this.state;

  console.log(items);

  const data = {
    // step: step,
    // votes: items
  };

  if(items) {
    return UpdateProposalVoteMutation.commit({
      input: { ...data },
    })
  }
};

export const formName = 'proposal-user-vote-form';

class ProposalsUserVotesTable extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      items: props.step.viewerVotes.edges.map(edge => edge.node),
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
    const { step } = this.props;
    const { items } = this.state;

    return (
      <form id="proposal-user-vote-form">
        <Row className="proposals-user-votes__table">
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                >
                  {items.map((node, key) => (
                    <Draggable key={node.proposal.id} draggableId={node.proposal.id} index={key}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ProposalUserVoteItem
                            key={key}
                            classment={key}
                            node={node}
                            step={step}
                          />
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
        <button type="submit">
          Valider
        </button>
      </form>
    );
  }
}

export default reduxForm({
    onSubmit,
    form: formName,
})(ProposalsUserVotesTable);
