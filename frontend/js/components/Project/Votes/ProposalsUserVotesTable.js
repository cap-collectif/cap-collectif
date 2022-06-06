// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { injectIntl, type IntlShape } from 'react-intl';
import { reduxForm, FieldArray, arrayMove } from 'redux-form';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import {
  type DragStart,
  type DropResult,
  type DragUpdate,
  type DraggableStateSnapshot,
  type ResponderProvided,
} from 'react-beautiful-dnd';
import ProposalUserVoteItem from './ProposalUserVoteItem';
import type { ProposalsUserVotesTable_step } from '~relay/ProposalsUserVotesTable_step.graphql';
import type { ProposalsUserVotesTable_votes } from '~relay/ProposalsUserVotesTable_votes.graphql';
import type { State, Dispatch, FeatureToggles } from '~/types';
import config from '~/config';
import invariant from '~/utils/invariant';
import Context from '~/components/Ui/DragnDrop/Context/Context';
import List from '~/components/Ui/DragnDrop/List/List';
import Item from '~/components/Ui/DragnDrop/Item/Item';
import {
  NonDraggableItemContainer,
  VotePlaceholder,
  ItemPosition,
} from './ProposalsUserVotes.style';

type RelayProps = {|
  step: ProposalsUserVotesTable_step,
  votes: ProposalsUserVotesTable_votes,
|};

type Props = {|
  ...ReduxFormFormProps,
  ...RelayProps,
  dispatch: Dispatch,
  onSubmit: () => void,
  deletable: boolean,
  snapshot: DraggableStateSnapshot,
  intl: IntlShape,
  isDropDisabled?: boolean,
  features: FeatureToggles,
|};

type VotesProps = {|
  ...ReduxFormFieldArrayProps,
  ...RelayProps,
  deletable: boolean,
  votesMin: number,
|};

export const Wrapper: StyledComponent<
  { isDraggingOver: boolean, isDropDisabled: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  background-color: ${({ isDraggingOver }) => (isDraggingOver ? 'blue' : 'grey')};
  display: flex;
  flex-direction: column;
  opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : 'inherit')};
  transition: background-color 0.1s ease, opacity 0.1s ease;
  user-select: none;
`;

export const DraggableItem: StyledComponent<
  { isDragging: boolean },
  {},
  HTMLDivElement,
> = styled.div`
  background-color: ${({ isDragging }) => (isDragging ? 'green' : 'white')};
  box-shadow: ${({ isDragging }) => (isDragging ? `2px 2px 1px rgba(0,0,0,0.2)` : 'none')};
  user-select: none;
  transition: background-color 0.1s ease;
`;

let portal: ?HTMLElement = null;

if (config.canUseDOM && document) {
  portal = document.createElement('div');
  portal.classList.add('proposal-user-votes-portal');
  if (document.body) {
    document.body.appendChild(portal);
  }
}

const renderPlaceholders = (
  step: ProposalsUserVotesTable_step,
  length: number,
  isDraggable: boolean,
  startNumber?: number,
) => {
  return [...Array(length)].map((e, i) => {
    return (
      <VotePlaceholder key={i} isDraggable={isDraggable}>
        {isDraggable && (
          <ItemPosition>{typeof startNumber === 'number' ? startNumber + i : i}</ItemPosition>
        )}
        <div />
      </VotePlaceholder>
    );
  });
};

const renderMembers = ({ fields, votes, step, deletable, votesMin }: VotesProps): any => (
  <React.Fragment>
    {fields.map((member: string, index: number) => {
      const voteInReduxForm: ?{ id: string, public: boolean } = fields.get(index);
      invariant(voteInReduxForm, 'The vote should be found.');
      const voteId = voteInReduxForm.id;
      const voteEdge =
        votes.edges && votes.edges.filter(Boolean).filter(edge => edge.node.id === voteId)[0];
      if (!voteEdge) return null;
      const vote = voteEdge.node;
      return (
        <NonDraggableItemContainer>
          <ProposalUserVoteItem
            key={index}
            member={member}
            isVoteVisibilityPublic={voteInReduxForm.public}
            vote={vote}
            step={step}
            onDelete={
              deletable
                ? () => {
                    fields.remove(index);
                  }
                : null
            }
          />
        </NonDraggableItemContainer>
      );
    })}
    {votesMin &&
      step?.viewerVotes &&
      step?.viewerVotes.totalCount < votesMin &&
      renderPlaceholders(step, votesMin - fields.length, false)}
  </React.Fragment>
);

const renderDraggableMembers = ({
  fields,
  votes,
  step,
  deletable,
  votesMin,
  form,
}: {|
  ...VotesProps,
  ...Props,
|}): any => {
  if (!votes.edges) return null;

  return (
    <div style={{ width: '100%' }}>
      <List id={`droppable${form}`} hasPositionDisplayed>
        {fields.map((member: string, index: number) => {
          const voteInReduxForm: ?{ id: string, public: boolean } = fields.get(index);
          invariant(voteInReduxForm, 'The vote should be found.');
          const voteId = voteInReduxForm.id;
          const voteEdge =
            votes.edges && votes.edges.filter(Boolean).filter(edge => edge.node.id === voteId)[0];
          if (!voteEdge) return null;
          const vote = voteEdge.node;

          return (
            <Item
              id={vote.proposal.id}
              key={vote.proposal.id}
              position={index}
              width="100%"
              center
              mobileTop>
              <ProposalUserVoteItem
                member={member}
                isVoteVisibilityPublic={voteInReduxForm.public}
                vote={vote}
                step={step}
                onDelete={deletable ? () => fields.remove(index) : null}
              />
            </Item>
          );
        })}
      </List>
      {votesMin &&
        step?.viewerVotes &&
        step?.viewerVotes.totalCount < votesMin &&
        renderPlaceholders(step, votesMin - fields.length, true, fields.length + 1)}
    </div>
  );
};

export class ProposalsUserVotesTable extends React.Component<Props> {
  onDragStart = (start: DragStart, provided: ResponderProvided) => {
    const { votes, intl } = this.props;

    // Add a little vibration if the browser supports it.
    // Add's a nice little physical feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate(100);
    }

    const title: string = this.getTitle(votes, start);

    provided.announce(intl.formatMessage({ id: 'dragndrop-drag-start' }, { title }));
  };

  onDragUpdate = (update: DragUpdate, provided: ResponderProvided) => {
    const { votes, intl } = this.props;

    const title: string = this.getTitle(votes, update);

    if (update.destination) {
      provided.announce(
        intl.formatMessage(
          { id: 'dragndrop-drag-update' },
          { title, position: update.destination.index + 1 },
        ),
      );
    }
  };

  onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    const { votes, intl, dispatch, form } = this.props;

    const title = this.getTitle(votes, result);

    // cancel (esc)
    if (result.reason === 'CANCEL') {
      provided.announce(
        intl.formatMessage(
          { id: 'dragndrop-drag-cancel' },
          { title, position: result.source.index + 1 },
        ),
      );

      return;
    }

    // dropped outside the list
    if (!result.destination) {
      provided.announce(intl.formatMessage({ id: 'dragndrop-drag-outside' }));

      return;
    }
    // no movement
    if (result.destination.index === result.source.index) {
      provided.announce(intl.formatMessage({ id: 'dragndrop-drag-no-movement' }));

      return;
    }

    dispatch(arrayMove(form, 'votes', result.source.index, result.destination.index));

    if (result.destination) {
      provided.announce(
        intl.formatMessage(
          { id: 'dragndrop-drag-end' },
          { title, position: result.destination.index + 1 },
        ),
      );
    }
  };

  getTitle = (
    votes: ProposalsUserVotesTable_votes,
    position: DragStart | DragUpdate | DropResult,
  ) => {
    const draggedProposal =
      votes.edges && votes.edges.filter(el => el && el.node.proposal.id === position.draggableId);
    invariant(draggedProposal && draggedProposal[0], 'Dragged proposal should be found.');
    return draggedProposal[0].node.proposal.title;
  };

  render() {
    const { form, step, votes, deletable, isDropDisabled = false, features } = this.props;

    if (!step.votesRanking) {
      return (
        <div className="proposals-user-votes__table">
          <FieldArray
            step={step}
            votes={votes}
            votesMin={features.votes_min && step.votesMin ? step.votesMin : 1}
            deletable={deletable}
            name="votes"
            component={renderMembers}
          />
        </div>
      );
    }

    return (
      <div className="proposals-user-votes__table" style={{ boxSizing: 'border-box' }}>
        <Context
          onDragEnd={this.onDragEnd}
          onDragStart={this.onDragStart}
          onDragUpdate={this.onDragUpdate}
          isDisabled={isDropDisabled}>
          <FieldArray
            step={step}
            votes={votes}
            votesMin={features.votes_min && step.votesMin ? step.votesMin : 1}
            form={form}
            deletable={deletable}
            name="votes"
            component={renderDraggableMembers}
          />
        </Context>
      </div>
    );
  }
}

const form = reduxForm({
  enableReinitialize: true,
})(ProposalsUserVotesTable);

export const getFormName = (step: { +id: string }) => `proposal-user-vote-form-step-${step.id}`;

const mapStateToProps = (state: State, props: RelayProps) => ({
  features: state.default.features,
  form: getFormName(props.step),
  initialValues: {
    votes:
      props.votes.edges &&
      props.votes.edges
        .filter(Boolean)
        .map(edge => ({ id: edge.node.id, public: !edge.node.anonymous })),
  },
});
const container = connect<any, any, _, _, _, _>(mapStateToProps)(injectIntl(form));

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
            title
          }
        }
      }
    }
  `,
  step: graphql`
    fragment ProposalsUserVotesTable_step on ProposalStep {
      id
      votesRanking
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
        totalCount
      }
      votesLimit
      votesMin
      ...ProposalUserVoteItem_step
    }
  `,
});
