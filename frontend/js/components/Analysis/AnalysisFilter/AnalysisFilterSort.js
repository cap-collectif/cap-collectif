// @flow
import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Collapsable from '~ui/Collapsable';
import DropdownSelect from '~ui/DropdownSelect';

export const ORDER_BY: {
  OLDEST: 'oldest',
  NEWEST: 'newest',
  MOST_VOTES: 'most-votes',
  LEAST_VOTES: 'least-votes',
  MOST_POINTS: 'most-points',
  LEAST_POINT: 'least-points',
  MOST_RECENT_REVISIONS: 'most-recent-revisions',
  LEAST_RECENT_REVISIONS: 'least-recent-revisions',
} = {
  OLDEST: 'oldest',
  NEWEST: 'newest',
  MOST_VOTES: 'most-votes',
  LEAST_VOTES: 'least-votes',
  MOST_POINTS: 'most-points',
  LEAST_POINT: 'least-points',
  MOST_RECENT_REVISIONS: 'most-recent-revisions',
  LEAST_RECENT_REVISIONS: 'least-recent-revisions',
};

type Props = {|
  value: $Values<typeof ORDER_BY>,
  onChange: (newValue: string) => void,
  isParticipant?: boolean,
  hasRevisions?: boolean,
  isVotable?: boolean,
  isVoteRanking?: boolean,
|};

const AnalysisFilterSort = ({
  value,
  onChange,
  isParticipant,
  hasRevisions = false,
  isVotable = false,
  isVoteRanking = false,
}: Props) => {
  const intl = useIntl();

  return (
    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="argument.sort.label" />
      </Collapsable.Button>
      <Collapsable.Element ariaLabel={intl.formatMessage({ id: 'sort-by' })}>
        <DropdownSelect
          shouldOverflow
          value={value}
          defaultValue={ORDER_BY.NEWEST}
          onChange={newValue => onChange(newValue)}
          title={intl.formatMessage({ id: 'sort-by' })}>
          <DropdownSelect.Choice value={ORDER_BY.NEWEST}>
            {intl.formatMessage({
              id: isParticipant ? 'most.active.users' : 'global.filter_f_last',
            })}
          </DropdownSelect.Choice>
          <DropdownSelect.Choice value={ORDER_BY.OLDEST}>
            {intl.formatMessage({
              id: isParticipant ? 'least.active.users' : 'global.filter_f_old',
            })}
          </DropdownSelect.Choice>
          {hasRevisions && (
            <>
              <DropdownSelect.Choice value={ORDER_BY.MOST_RECENT_REVISIONS}>
                {intl.formatMessage({
                  id: 'most.recent.review.request',
                })}
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value={ORDER_BY.LEAST_RECENT_REVISIONS}>
                {intl.formatMessage({
                  id: 'oldest.review.request',
                })}
              </DropdownSelect.Choice>
            </>
          )}
          {isVotable && (
            <>
              <DropdownSelect.Choice value={ORDER_BY.MOST_VOTES}>
                {intl.formatMessage({
                  id: 'step.sort.votes',
                })}
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value={ORDER_BY.LEAST_VOTES}>
                {intl.formatMessage({
                  id: 'global.filter_f_least-votes',
                })}
              </DropdownSelect.Choice>
            </>
          )}
          {isVoteRanking && (
            <>
              <DropdownSelect.Choice value={ORDER_BY.MOST_POINTS}>
                {intl.formatMessage({
                  id: 'most-points',
                })}
              </DropdownSelect.Choice>
              <DropdownSelect.Choice value={ORDER_BY.LEAST_POINT}>
                {intl.formatMessage({
                  id: 'least-points',
                })}
              </DropdownSelect.Choice>
            </>
          )}
        </DropdownSelect>
      </Collapsable.Element>
    </Collapsable>
  );
};

export default AnalysisFilterSort;
