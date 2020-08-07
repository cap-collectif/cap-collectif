// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { submit, isDirty, isSubmitting } from 'redux-form';
import styled, { type StyledComponent } from 'styled-components';
import { connect } from 'react-redux';
import { graphql, createFragmentContainer } from 'react-relay';
import ProposalsUserVotesTable from './ProposalsUserVotesTable';
import SubmitButton from '../../Form/SubmitButton';
import UpdateProposalVotesMutation from '../../../mutations/UpdateProposalVotesMutation';
import type { ProposalsUserVotesStep_step } from '~relay/ProposalsUserVotesStep_step.graphql';
import WYSIWYGRender from '../../Form/WYSIWYGRender';
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper';
import colors from '~/utils/colors';

type RelayProps = {|
  step: ProposalsUserVotesStep_step,
|};
type Props = {|
  ...RelayProps,
  dispatch: Function,
  dirty: boolean,
  submitting: boolean,
  isAuthenticated: boolean,
|};

export const VoteTableContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  .not-enough-votes-title {
    font-weight: 600;
  }
  .not-enough-votes-subtitle {
    color: ${colors.darkGray};
  }
  .empty-element {
    display: flex;
    width: 100%;
    height: 50px;
    border: 2px ${colors.gray};
    border-style: dotted;
  }

  .list-dragndrop {
    display: flex;
    width: 100%;
    ul,
    li {
      display: flex;
      flex-direction: column;
      width: 100%;
    }
    li {
      .item-line {
        align-items: center;
        display: flex;
        flex-direction: row;
        margin-bottom: 10px;
      }
      .item-content {
        width: 100%;
        div {
          display: flex;
          width: 100%;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
      }
      .list-number {
        background-color: ${colors.primaryColor};
        padding-left: 10px;
        padding-right: 10px;
        border-radius: 10px;
        margin-right: 15px;
        color: white;
        height: fit-content;
      }
    }
  }
`;

export class ProposalsUserVotesStep extends React.Component<Props> {
  onSubmit = (values: { votes: Array<{ public: boolean, id: string }> }) => {
    const { step, isAuthenticated } = this.props;
    return UpdateProposalVotesMutation.commit({
      input: {
        step: step.id,
        votes: values.votes.map(v => ({ id: v.id, anonymous: !v.public })),
      },
      isAuthenticated,
    });
  };

  createRemainingVoteArray = (start: number, end: number) => {
    // $FlowFixMe
    return Array.from({ length: end - start }, (v: any, k: number) => start + k + 1);
  };

  getTitle = (title: string) => {
    const windowWidth = window.innerWidth;

    let maxItemLength;

    if (windowWidth > 400) {
      maxItemLength = 85;
    } else {
      maxItemLength = 60;
    }

    return title.length > maxItemLength ? `${title.substring(0, maxItemLength)}...` : title;
  };

  render() {
    const { step, dirty, submitting, dispatch } = this.props;
    const { votesRanking } = step;
    const keyTradProjectCount = step.form?.isProposalForm
      ? isInterpellationContextFromStep(step)
        ? 'count.interpellation'
        : 'count-proposal'
      : 'count-questions';

    if (!step.viewerVotes) {
      return null;
    }

    // eslint-disable-next-line no-unused-vars
    const renderVotesMinSection = () => {
      if (!step.votesMin || !step?.viewerVotes?.totalCount) {
        return null;
      }
      return (
        <>
          <div>
            <span className="not-enough-votes-title">
              {`${step.viewerVotes.totalCount}/`}
              <FormattedMessage id="mandatory-vote" values={{ num: step?.votesMin }} />
            </span>
          </div>
          <div className="mb-20">
            <span className="not-enough-votes-subtitle">
              <FormattedMessage
                id="vote-to-validate-your-participation"
                values={{ num: step?.votesMin - step?.viewerVotes.totalCount }}
              />
            </span>
          </div>
        </>
      );
    };

    // TODO Tiens Agui, souviens toi que j'ai fait mon max ici
    // const renderProposalUserVoteTable = () => {
    //   return (
    //     <Context onDragEnd={() => {}}>
    //       <List id={`${step.title}-vote-list`}>
    //         {step?.viewerVotes?.edges &&
    //           step?.viewerVotes?.edges
    //             .filter(Boolean)
    //             .map(edge => edge.node)
    //             .filter(Boolean)
    //             .map((vote, index) => {
    //               return (
    //                 <ProposalUserVoteItem2
    //                   index={index}
    //                   vote={vote}
    //                   step={step}
    //                   isVoteVisibilityPublic
    //                   onDelete={() => {}}
    //                   showDraggableIcon
    //                 />
    //               );
    //             })}
    //         {step?.votesMin &&
    //           step?.viewerVotes &&
    //           step.votesMin - step?.viewerVotes.totalCount > 0 &&
    //           this.createRemainingVoteArray(step.viewerVotes.totalCount, step.votesMin).map(
    //             number => (
    //               <div className="item-line">
    //                 <div className="list-number">{number}</div>
    //                 <div className="empty-element" />
    //               </div>
    //             ),
    //           )}
    //       </List>
    //     </Context>
    //   );
    // };

    return (
      <div className="block">
        <h2>{step.title}</h2>
        <a className="btn btn-default" href={step.url}>
          <i className="cap cap-arrow-1-1" />
          <span>
            {' '}
            <FormattedMessage
              id={
                isInterpellationContextFromStep(step)
                  ? 'project.supports.back'
                  : 'project.votes.back'
              }
            />
          </span>
        </a>
        {step.votesHelpText && (
          <div className="well mb-0 mt-25">
            <p>
              <b>
                <FormattedMessage
                  id={
                    isInterpellationContextFromStep(step)
                      ? 'admin.fields.step.supportsHelpText'
                      : 'admin.fields.step.votesHelpText'
                  }
                />
              </b>
            </p>
            <WYSIWYGRender value={step.votesHelpText} />
          </div>
        )}
        <div>
          <h3 className="d-ib mr-10 mb-10">
            {votesRanking ? (
              <FormattedMessage id="global.ranking" />
            ) : (
              <FormattedMessage
                id={
                  isInterpellationContextFromStep(step)
                    ? 'project.supports.title'
                    : 'project.votes.title'
                }
              />
            )}
          </h3>
          <h4 className="excerpt d-ib">
            <FormattedMessage
              id={keyTradProjectCount}
              values={{ num: step.viewerVotes ? step.viewerVotes.totalCount : 0 }}
            />
          </h4>
        </div>

        {step.viewerVotes && step.viewerVotes.totalCount > 0 && (
          <VoteTableContainer>
            {/* TODO remove false once votesMin is implemented */}
            {/* {renderVotesMinSection()} */}

            <ProposalsUserVotesTable
              onSubmit={this.onSubmit}
              deletable
              step={step}
              votes={step.viewerVotes}
            />
            <SubmitButton
              id="confirm-update-votes"
              disabled={!dirty}
              onSubmit={() => {
                dispatch(submit(`proposal-user-vote-form-step-${step.id}`));
              }}
              label="global.save_modifications"
              isSubmitting={submitting}
              bsStyle="success"
              className="mt-10"
            />
          </VoteTableContainer>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, props: RelayProps) => ({
  dirty: isDirty(`proposal-user-vote-form-step-${props.step.id}`)(state),
  submitting: isSubmitting(`proposal-user-vote-form-step-${props.step.id}`)(state),
  isAuthenticated: !!state.user.user,
});
const container = connect(mapStateToProps)(ProposalsUserVotesStep);

export default createFragmentContainer(container, {
  step: graphql`
    fragment ProposalsUserVotesStep_step on ProposalStep
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...ProposalsUserVotesTable_step
      id
      title
      voteType
      votesMin
      votesHelpText
      open
      url
      votesRanking
      viewerVotes(orderBy: { field: POSITION, direction: ASC }) @include(if: $isAuthenticated) {
        totalCount
        ...ProposalsUserVotesTable_votes
      }
      ...interpellationLabelHelper_step @relay(mask: false)
    }
  `,
});
