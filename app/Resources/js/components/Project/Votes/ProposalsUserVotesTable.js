// @flow
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm } from 'redux-form';
import { graphql, createFragmentContainer } from 'react-relay';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ProposalUserVoteItem from './ProposalUserVoteItem';
// import UpdateProposalVotesMutation from '../../../mutations/UpdateProposalVotesMutation';
import type { ProposalsUserVotesTable_step } from './__generated__/ProposalsUserVotesTable_step.graphql';
import type { ProposalsUserVotesTable_votes } from './__generated__/ProposalsUserVotesTable_votes.graphql';

type Props = {
  step: ProposalsUserVotesTable_step,
  votes: ProposalsUserVotesTable_votes,
};

type State = {
  items: Array<Object>,
};

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  //
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const onSubmit = () => {
  // const { step } = props;
  // const { items } = this.state;
  // if(items) {
  //   return UpdateProposalVotesMutation.commit({
  //     input: { ...data },
  //   })
  // }
};

export const formName = 'proposal-user-vote-form';

class ProposalsUserVotesTable extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      items: props.votes.edges.filter(Boolean).map(edge => edge.node),
    };
  }

  onDragEnd = result => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(this.state.items, result.source.index, result.destination.index);

    this.setState({
      items,
    });
  };

  render() {
    const { step, votes } = this.props;

    if (!step.votesRanking) {
      return (
        <form id="proposal-user-vote-form">
          <Row className="proposals-user-votes__table">
            {votes.edges &&
              votes.edges.filter(Boolean).map((edge, key) => (
                // $FlowFixMe
                <ProposalUserVoteItem key={key} vote={edge.node} step={step} />
              ))}
          </Row>
        </form>
      );
    }

    const { items } = this.state;

    return (
      <form id="proposal-user-vote-form">
        <Row className="proposals-user-votes__table">
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable">
              {provided => (
                <div ref={provided.innerRef}>
                  {items.map((vote, key) => (
                    <Draggable key={vote.proposal.id} draggableId={vote.proposal.id} index={key}>
                      {provided2 => (
                        <div
                          ref={provided2.innerRef}
                          {...provided2.draggableProps}
                          {...provided2.dragHandleProps}>
                          {/* $FlowFixMe */}
                          <ProposalUserVoteItem key={key} ranking={key} vote={vote} step={step} />
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
        <button type="submit">Valider</button>
      </form>
    );
  }
}

const form = reduxForm({
  onSubmit,
  form: formName,
})(ProposalsUserVotesTable);

export default createFragmentContainer(form, {
  votes: graphql`
    fragment ProposalsUserVotesTable_votes on ProposalVoteConnection {
      edges {
        node {
          ...ProposalUserVoteItem_vote
          proposal {
            id
          }
        }
      }
    }
  `,
  step: graphql`
    fragment ProposalsUserVotesTable_step on ProposalStep {
      id
      votesRanking
      ...ProposalUserVoteItem_step
    }
  `,
});
