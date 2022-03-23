// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { FormattedDate, useIntl } from 'react-intl';
import moment from 'moment';
import { Box } from '@cap-collectif/ui';
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
import colors, { styleGuideColors } from '~/utils/colors';
import { pxToRem } from '~/utils/styles/mixins';
import { TagContainer } from '~ui/Labels/Tag';
import Tooltip from '~ds/Tooltip/Tooltip';
import Text from '~ui/Primitives/Text';

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
  votes = 0,
  points = 0,
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
  const intl = useIntl();

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
              {intl.formatMessage({
                id: proposal.draft
                  ? 'admin.fields.proposal.draft'
                  : 'admin.fields.proposal.isTrashed',
              })}
            </StateTag>
          )}

          {proposal.hasBeenMerged && hasRegroupTag && (
            <StateTag className="merge-tag">{intl.formatMessage({ id: 'badge.merged' })}</StateTag>
          )}

          <h2 className="d-flex align-items-center">
            {proposal.revisions && proposal.revisions.totalCount > 0 && (
              <Tooltip
                label={intl.formatMessage(
                  { id: 'review.asked.by' },
                  {
                    count: proposal.revisions.totalCount,
                    username: proposal.revisions.edges
                      ?.filter(Boolean)
                      .map(edge => edge.node)
                      .map(revision => revision.author.username)
                      .join(', '),
                  },
                )}>
                <Icon
                  name={ICON_NAME.information}
                  size={pxToRem(14)}
                  className="mr-10"
                  color={styleGuideColors.blue200}
                />
              </Tooltip>
            )}
            <a href={isAdminView ? proposal?.adminUrl ?? proposal.url : proposal.url}>
              {proposal.title}
            </a>
          </h2>
        </ProposalListRowHeader>

        <ProposalListRowInformations>
          <p>
            #{proposal.reference} • {proposal.author.username}
            {proposal.publishedAt && (
              <React.Fragment>
                {' '}
                • {intl.formatMessage({ id: 'submited_on' })}{' '}
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
              <Icon name={ICON_NAME.bookmark2} size={10} className="mr-5" />
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
          {isVotable && votes + proposal.paperVotesTotalCount > 0 && (
            <Tooltip
              label={
                <Box textAlign="center">
                  {votes > 0 && (
                    <Text marginBottom="0px !important">
                      {intl.formatMessage({ id: 'numeric-votes-count' }, { num: votes })}
                    </Text>
                  )}
                  {proposal.paperVotesTotalCount > 0 && (
                    <Text marginBottom="0px !important">
                      {intl.formatMessage(
                        { id: 'paper-votes-count' },
                        { num: proposal.paperVotesTotalCount },
                      )}
                    </Text>
                  )}
                </Box>
              }>
              <TagContainer>
                <Icon color={colors.darkGray} size="14" name={ICON_NAME.like} />
                {intl.formatMessage(
                  { id: 'votes-count' },
                  { num: votes + proposal.paperVotesTotalCount },
                )}
              </TagContainer>
            </Tooltip>
          )}
          {isVoteRanking && points + proposal.paperVotesTotalPointsCount > 0 && (
            <Tooltip
              label={
                <Box textAlign="center">
                  {points > 0 && (
                    <Text marginBottom="0px !important">
                      {intl.formatMessage({ id: 'numeric-points-count' }, { num: points })}
                    </Text>
                  )}
                  {proposal.paperVotesTotalPointsCount > 0 && (
                    <Text marginBottom="0px !important">
                      {intl.formatMessage(
                        { id: 'paper-points-count' },
                        { num: proposal.paperVotesTotalPointsCount },
                      )}
                    </Text>
                  )}
                </Box>
              }>
              <TagContainer>
                <Icon color={colors.darkGray} size="14" name={ICON_NAME.trophy} />
                <span>{points + proposal.paperVotesTotalPointsCount}&nbsp;</span>
                {intl.formatMessage(
                  { id: 'points-count' },
                  { num: points + proposal.paperVotesTotalPointsCount },
                )}
              </TagContainer>
            </Tooltip>
          )}
        </AnalysisProposalListRowMeta>

        {hasActionDisplay && setProposalModalDelete && (
          <ActionContainer>
            <button
              type="button"
              onClick={() => {
                if (proposal?.adminUrl) {
                  window.open(proposal?.adminUrl, '_blank');
                }
              }}>
              {intl.formatMessage({ id: 'global.edit' })}
            </button>

            <button
              type="button"
              onClick={() => {
                window.open(proposal.url, '_blank');
              }}>
              {intl.formatMessage({ id: 'action_show' })}
            </button>

            {!proposal.trashed && (
              <button type="button" onClick={() => setProposalModalDelete(proposal)}>
                {intl.formatMessage({ id: 'move.contribution.to.trash' })}
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
    @argumentDefinitions(
      isAdminView: { type: "Boolean" }
      proposalRevisionsEnabled: { type: "Boolean!" }
      step: { type: "ID", defaultValue: null }
    ) {
      revisions(state: PENDING) @include(if: $proposalRevisionsEnabled) {
        totalCount
        edges {
          node {
            id
            author {
              username
            }
          }
        }
      }
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
      paperVotesTotalCount(stepId: $step)
      paperVotesTotalPointsCount(stepId: $step)
      ...ModalDeleteProposal_proposal
    }
  `,
});
