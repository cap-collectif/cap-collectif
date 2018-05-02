// @flow
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { reduxForm, FieldArray, arrayMove, type FieldArrayProps, type FormProps } from 'redux-form';
import { connect, type MapStateToProps } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DraggableProvided,
  type DroppableProvided,
} from 'react-beautiful-dnd';
import ProposalUserVoteItem from './ProposalUserVoteItem';
import type { ProposalsUserVotesTable_step } from './__generated__/ProposalsUserVotesTable_step.graphql';
import type { ProposalsUserVotesTable_votes } from './__generated__/ProposalsUserVotesTable_votes.graphql';
import type { State } from '../../../types';

type RelayProps = {
  step: ProposalsUserVotesTable_step,
  votes: ProposalsUserVotesTable_votes,
};
type Props = FormProps &
  RelayProps & {
    onSubmit: Function,
    deletable: boolean,
  };

type VotesProps = FieldArrayProps &
  RelayProps & {
    deletable: boolean,
  };

const renderMembers = ({ fields, votes, step, deletable }: VotesProps) => {
  return (
    <div>
      {fields.map((member, index) => (
        /* $FlowFixMe */
        <ProposalUserVoteItem
          key={index}
          member={member}
          vote={votes.edges && votes.edges[index].node}
          step={step}
          onDelete={deletable ? () => fields.remove(index) : null}
        />
      ))}
    </div>
  );
};

const renderDraggableMembers = ({ fields, votes, step, deletable }: VotesProps) => {
  if (!votes.edges) {
    return null;
  }
  return (
    <div>
      {fields.map((member, key) => {
        const voteId = fields.get(key).id;
        const voteEdge =
          votes.edges &&
          votes.edges.filter(Boolean).filter(edge => edge.node && edge.node.id === voteId)[0];
        if (!voteEdge) return null;
        const vote = voteEdge.node;
        return (
          <Draggable key={key} draggableId={vote.proposal.id} index={key}>
            {(provided: DraggableProvided) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}>
                {/* $FlowFixMe */}
                <ProposalUserVoteItem
                  member={member}
                  vote={vote}
                  step={step}
                  onDelete={deletable ? () => fields.remove(key) : null}
                />
              </div>
            )}
          </Draggable>
        );
      })}
    </div>
  );
};

class ProposalsUserVotesTable extends React.Component<Props> {
  onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    this.props.dispatch(
      arrayMove(this.props.form, 'votes', result.source.index, result.destination.index),
    );
  };

  render() {
    const { form, step, votes, deletable } = this.props;

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

    return (
      <Row className="proposals-user-votes__table">
        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId={`droppable${form}`}>
            {(provided: DroppableProvided) => (
              <div ref={provided.innerRef}>
                <FieldArray
                  step={step}
                  votes={votes}
                  deletable={deletable}
                  name="votes"
                  component={renderDraggableMembers}
                />
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
