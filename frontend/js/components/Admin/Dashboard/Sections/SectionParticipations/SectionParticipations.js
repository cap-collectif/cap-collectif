// @flow
import * as React from 'react';
import { graphql, useFragment } from 'react-relay';
import { useIntl } from 'react-intl';
import Section from '~ui/Dashboard/Section';
import TabsChart from '~ui/Dashboard/TabsChart';
import type { SectionParticipations_analytics$key } from '~relay/SectionParticipations_analytics.graphql';
import formatValues from '../formatValues';

type Props = {|
  +analytics: SectionParticipations_analytics$key,
|};

const FRAGMENT = graphql`
  fragment SectionParticipations_analytics on PlatformAnalytics {
    votes {
      totalCount
      values {
        key
        totalCount
      }
    }
    comments {
      totalCount
      values {
        key
        totalCount
      }
    }
    contributions {
      totalCount
      values {
        key
        totalCount
      }
    }
    followers {
      totalCount
      values {
        key
        totalCount
      }
    }
  }
`;

const SectionParticipations = ({ analytics: analyticsFragment }: Props): React.Node => {
  const analytics = useFragment(FRAGMENT, analyticsFragment);
  const intl = useIntl();
  const { votes, comments, contributions, followers } = analytics;

  return (
    <Section label={intl.formatMessage({ id: 'methods-of-participation' })} width="50%">
      <TabsChart>
        <TabsChart.Tab
          id="vote"
          label={intl.formatMessage({ id: 'vote-plural' }, { num: votes?.totalCount ?? 0 })}
          count={votes?.totalCount ?? 0}
          data={formatValues(votes?.values ?? [], intl)}
        />
        <TabsChart.Tab
          id="comment"
          label={intl.formatMessage({ id: 'comment.dynamic' }, { num: comments?.totalCount ?? 0 })}
          count={comments?.totalCount ?? 0}
          data={formatValues(comments?.values ?? [], intl)}
        />
        <TabsChart.Tab
          id="contribution"
          label={intl.formatMessage(
            { id: 'contribution-plural' },
            { num: contributions?.totalCount ?? 0 },
          )}
          count={contributions?.totalCount ?? 0}
          data={formatValues(contributions?.values ?? [], intl)}
        />
        <TabsChart.Tab
          id="follower"
          label={intl.formatMessage(
            { id: 'subscription.dynamic' },
            { num: followers?.totalCount ?? 0 },
          )}
          count={followers?.totalCount ?? 0}
          data={formatValues(followers?.values ?? [], intl)}
        />
      </TabsChart>
    </Section>
  );
};

export default SectionParticipations;
