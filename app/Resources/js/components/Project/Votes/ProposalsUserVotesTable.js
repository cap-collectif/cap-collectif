// @flow
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm, FieldArray } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ProposalUserVoteItem from './ProposalUserVoteItem';
import type { ProposalsUserVotesTable_step } from './__generated__/ProposalsUserVotesTable_step.graphql';
import type { ProposalsUserVotesTable_votes } from './__generated__/ProposalsUserVotesTable_votes.graphql';

type RelayProps = {
  step: ProposalsUserVotesTable_step,
  votes: ProposalsUserVotesTable_votes,
};
type Props = RelayProps & {
  onSubmit: Function,
  deletable: boolean,
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

const renderMembers = ({ fields, votes, step, deletable }: Object) => {
  return (
    <div>
      {fields.map((member, index) => (
        <ProposalUserVoteItem
          key={index}
          member={member}
          vote={votes.edges[index].node}
          step={step}
          onDelete={deletable ? () => fields.remove(index) : null}
        />
      ))}
    </div>
  );
};

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
    const { step, votes, deletable } = this.props;

    if (!step.votesRanking) {
      return (
        <Row className="proposals-user-votes__table">
          <FieldArray
            step={step}
            votes={votes}
            deletable={deletable}
            name="votes"
            component={renderMembers}
          />
        </Row>
      );
    }

    const { items } = this.state;

    return (
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
    );
  }
}

const form = reduxForm({
  enableReinitialize: true,
})(ProposalsUserVotesTable);

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: RelayProps) => ({
  form: `proposal-user-vote-form-step-${props.step.id}`,
  initialValues: {
    votes:
      props.votes.edges &&
      props.votes.edges
        .filter(Boolean)
        .map(edge => ({ id: edge.node.id, anonymous: edge.node.anonymous })),
  },
});
const container = connect(mapStateToProps)(form);

export default createFragmentContainer(container, {
  votes: graphql`
    fragment ProposalsUserVotesTable_votes on ProposalVoteConnection {
      edges {
        node {
          id
          ...ProposalUserVoteItem_vote
          anonymous
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
