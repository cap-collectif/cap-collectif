// @flow
import * as React from 'react';
import { Row } from 'react-bootstrap';
import styled from 'styled-components';
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
  type DraggableStateSnapshot,
  type DroppableStateSnapshot,
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

const Wrapper = styled.div`
    #background-color: ${({ isDraggingOver }) => (isDraggingOver ? 'blue' : 'grey')};
    display: flex;
    flex-direction: column;
    #opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : 'inherit')};
    transition: background-color 0.1s ease, opacity 0.1s ease;
    user-select: none;
`;

const DraggableItem = styled.div`
  #background-color: ${({ isDragging }) => (isDragging ? 'green' : 'white')};
  #box-shadow: ${({ isDragging }) => (isDragging ? `2px 2px 1px rgba(0,0,0,0.2)` : 'none')};
  user-select: none;
  transition: background-color 0.1s ease;
`;

const renderMembers = ({ fields, votes, step, deletable }: VotesProps) => {
  return (
    <div>
      {fields.map((member, index) => (
        /* $FlowFixMe */
        <ProposalUserVoteItem
          key={index}
          member={member}
          isVoteVisibilityPublic={fields.get(index).public}
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
      {fields.map((member, index) => {
        const voteId = fields.get(index).id;
        const voteEdge =
          votes.edges &&
          votes.edges.filter(Boolean).filter(edge => edge.node && edge.node.id === voteId)[0];
        if (!voteEdge) return null;
        const vote = voteEdge.node;
        return (
          <Draggable key={vote.proposal.id} draggableId={vote.proposal.id} index={index}>
            {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => {
              const child = (
                <div className="proposals-user-votes__draggable-item">
                  <DraggableItem
                    innerRef={provided.innerRef}
                    isDragging={snapshot.isDragging}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}>
                    {/* $FlowFixMe */}
                    <ProposalUserVoteItem
                      member={member}
                      ranking={index + 1}
                      isVoteVisibilityPublic={fields.get(index).public}
                      vote={vote}
                      step={step}
                      showDraggableIcon={fields.length > 1}
                      onDelete={deletable ? () => fields.remove(index) : null}
                    />
                  </DraggableItem>
                  {provided.placeholder}
                </div>
              );
              // Use portal here https://github.com/atlassian/react-beautiful-dnd/blob/master/stories/src/portal/portal-app.jsx
              // This will fix position in the modal
              // TODO @Amelie52
              // https://github.com/atlassian/react-beautiful-dnd#warning-position-fixed
              return child;
            }}
          </Draggable>
        );
      })}
    </div>
  );
};

export class ProposalsUserVotesTable extends React.Component<Props> {
  onDragStart = () => {
    // Add a little vibration if the browser supports it.
    // Add's a nice little physical feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }
  };

  onDragEnd = (result: DropResult) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }
    // no movement
    if (result.destination.index === result.source.index) {
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
      <Row className="proposals-user-votes__table" style={{ boxSizing: 'border-box' }}>
        <DragDropContext onDragEnd={this.onDragEnd} onDragStart={this.onDragStart}>
          <Droppable droppableId={`droppable${form}`}>
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => {
              return (
                <Wrapper
                  isDraggingOver={snapshot.isDraggingOver}
                  innerRef={provided.innerRef}
                  {...provided.droppableProps}>
                  <FieldArray
                    step={step}
                    votes={votes}
                    deletable={deletable}
                    name="votes"
                    component={renderDraggableMembers}
                  />
                  {provided.placeholder}
                </Wrapper>
              );
            }}
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
        .map(edge => ({ id: edge.node.id, public: !edge.node.anonymous })),
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
