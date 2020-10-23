// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';
import type { AnalysisProposal_proposal } from '~relay/AnalysisProposal_proposal.graphql';
import AnalysisProposalContainer, {
  ProposalTag,
  ProposalListRowInformations,
  ProposalInformationsContainer,
  ProposalListRowHeader,
  StateTag,
  ActionContainer,
} from '~/components/Analysis/AnalysisProposal/AnalysisProposal.style';
import { AnalysisProposalListRowMeta } from '~ui/Analysis/common.style';
import type {
  ProposalsCategoryValues,
  ProposalsDistrictValues,
  ProposalsThemeValues,
} from '~/components/Analysis/AnalysisProjectPage/AnalysisProjectPage.reducer';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';
import { TagContainer } from '~ui/Labels/Tag';
import colors from '~/utils/colors';

type Props = {
  proposal: AnalysisProposal_proposal,
  isVoteRanking?: boolean,
  isVotable?: boolean,
  points?: number,
  votes?: number,
  children: React.Node,
  dispatch: any => void,
  hasThemeEnabled: boolean,
  hasStateTag?: boolean,
  hasRegroupTag?: boolean,
  isAdminView?: boolean,
  proposalSelected?: ?string,
  setProposalModalDelete?: (proposal: AnalysisProposal_proposal) => void,
  setProposalSelected?: (proposalId: ?string) => void,
};

const AnalysisProposal = ({
  proposal,
  votes,
  points,
  isVoteRanking = false,
  isVotable = false,
  dispatch,
  children,
  hasThemeEnabled,
  hasStateTag,
  hasRegroupTag,
  isAdminView,
  proposalSelected,
  setProposalModalDelete,
  setProposalSelected,
}: Props) => {
  const isSelected = proposalSelected === proposal.id;
  const hasActionDisplay = isSelected && isAdminView;
  return (
    <AnalysisProposalContainer
      rowId={proposal.id}
      onFocus={() => (setProposalSelected ? setProposalSelected(proposal.id) : null)}
      onMouseOver={() => (setProposalSelected ? setProposalSelected(proposal.id) : null)}
      onBlur={() => (setProposalSelected ? setProposalSelected(null) : null)}
      onMouseLeave={() => (setProposalSelected ? setProposalSelected(null) : null)}>
      <ProposalInformationsContainer>
        <ProposalListRowHeader>
          {(proposal.draft || proposal.trashed) && hasStateTag && (
            <StateTag>
              <FormattedMessage
                id={
                  proposal.draft ? 'admin.fields.proposal.draft' : 'admin.fields.proposal.isTrashed'
                }
              />
            </StateTag>
          )}

          {proposal.hasBeenMerged && hasRegroupTag && (
            <StateTag className="merge-tag">
              <FormattedMessage id="badge.merged" />
            </StateTag>
          )}

          <h2>
            <a href={isAdminView ? proposal?.adminUrl : proposal.url}>{proposal.title}</a>
          </h2>
        </ProposalListRowHeader>

        <ProposalListRowInformations>
          <p>
            #{proposal.reference} • {proposal.author.username}
            {proposal.publishedAt && (
              <React.Fragment>
                {' '}
                • <FormattedMessage id="submited_on" />{' '}
                <FormattedDate
                  value={moment(proposal.publishedAt)}
                  day="numeric"
                  month="long"
                  year="numeric"
                />
              </React.Fragment>
            )}
          </p>
        </ProposalListRowInformations>

        <AnalysisProposalListRowMeta>
          {proposal.district && (
            <ProposalTag
              title={proposal.district.name}
              size="10px"
              icon="cap cap-marker-1"
              onClick={() =>
                dispatch({
                  type: 'CHANGE_DISTRICT_FILTER',
                  payload: ((proposal.district?.id: any): ProposalsDistrictValues),
                })
              }>
              {proposal.district.name}
            </ProposalTag>
          )}

          {proposal.theme && hasThemeEnabled && (
            <ProposalTag
              title={proposal.theme.title}
              size="10px"
              onClick={() =>
                dispatch({
                  type: 'CHANGE_THEME_FILTER',
                  payload: ((proposal.theme?.id: any): ProposalsThemeValues),
                })
              }>
              <Icon name={ICON_NAME.bookmark} size={10} className="mr-5" />
              {proposal.theme.title}
            </ProposalTag>
          )}

          {proposal.category && (
            <ProposalTag
              title={proposal.category.name}
              size="10px"
              icon="cap cap-tag-1"
              onClick={() =>
                dispatch({
                  type: 'CHANGE_CATEGORY_FILTER',
                  payload: ((proposal.category?.id: any): ProposalsCategoryValues),
                })
              }>
              {proposal.category.name}
            </ProposalTag>
          )}
          {isVotable && votes !== null && (
            <TagContainer>
              <Icon color={colors.darkGray} size="14" name={ICON_NAME.like} />
              <FormattedMessage id="votes-count" values={{ num: votes }} />
            </TagContainer>
          )}
          {isVoteRanking && points !== null && (
            <TagContainer>
              <Icon color={colors.darkGray} size="14" name={ICON_NAME.trophy} />
              <span>{points}&nbsp;</span>
              <FormattedMessage id="points-count" values={{ num: points }} />
            </TagContainer>
          )}
        </AnalysisProposalListRowMeta>

        {hasActionDisplay && setProposalModalDelete && (
          <ActionContainer>
            <button
              type="button"
              onClick={() => {
                window.open(proposal?.adminUrl, '_blank');
              }}>
              <FormattedMessage id="global.edit" />
            </button>

            <button
              type="button"
              onClick={() => {
                window.open(proposal.url, '_blank');
              }}>
              <FormattedMessage id="action_show" />
            </button>

            {!proposal.trashed && (
              <button type="button" onClick={() => setProposalModalDelete(proposal)}>
                <FormattedMessage id="move.contribution.to.trash" />
              </button>
            )}
          </ActionContainer>
        )}
      </ProposalInformationsContainer>

      {children}
    </AnalysisProposalContainer>
  );
};

export default createFragmentContainer(AnalysisProposal, {
  proposal: graphql`
    fragment AnalysisProposal_proposal on Proposal
      @argumentDefinitions(isAdminView: { type: "Boolean" }) {
      id
      title
      publishedAt
      url
      adminUrl @include(if: $isAdminView)
      draft
      trashed
      reference(full: false)
      hasBeenMerged
      author {
        id
        username
      }
      district {
        id
        name
      }
      category {
        id
        name
      }
      theme {
        id
        title
      }
      ...ModalDeleteProposal_proposal
    }
  `,
});
