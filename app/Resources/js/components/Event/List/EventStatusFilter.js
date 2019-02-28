// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { injectIntl, FormattedMessage, type IntlShape } from 'react-intl';
import { Field, formValueSelector } from 'redux-form';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { connect } from 'react-redux';
import type { EventStatusFilter_query } from './__generated__/EventStatusFilter_query.graphql';
import type { State } from '../../../types';
import fieldComponent from '../../Form/Field';

type Props = {
  query: EventStatusFilter_query,
  overlay: React.Element<*>,
  status: ?string,
  intl: IntlShape,
};

export class EventStatusFilter extends React.Component<Props> {

  statusPopover = () => {
    const { intl } = this.props;

    return (
      <Popover>
        <form>
            <Field
              component={fieldComponent}
              name="status"
              type="radio"
              value="all"
              // label={intl.formatMessage({ id: 'all-events' })}
            >
              <FormattedMessage id="all-events" />
            </Field>
            <Field
              component={fieldComponent}
              name="status"
              type="radio"
              value="ongoing-and-future"
              // label={intl.formatMessage({ id: 'ongoing-and-future' })}
            >
              <FormattedMessage id="ongoing-and-future" />
            </Field>
            <Field
              component={fieldComponent}
              name="status"
              type="radio"
              value="finished"
              // label={intl.formatMessage({ id: 'finished' })}
            >
              <FormattedMessage id="finished" />
            </Field>
        </form>
      </Popover>
      
    )
  };

  render() {
    const { query, overlay, status } = this.props;

    console.warn(status);

    return (
      <>
        <FormattedMessage
          id="number-of-events"
          values={{
            num: query.events.totalCount,
          }}
        />
        <OverlayTrigger
        trigger="click"
        placement="bottom"
        aria-describedby=""
        overlay={this.statusPopover()}>
          <Button bsStyle="link">
            {status === 'all' ? (
              <FormattedMessage id="all-events" />
            ) : (
              <FormattedMessage id="all-events" />
            )}
          </Button>
        </OverlayTrigger>
        
      </>
    )
  }
}

const selector = formValueSelector('EventListFilters');

const mapStateToProps = (state: State) => ({
  status: selector(state, 'status'),
});

const container = connect(mapStateToProps)(injectIntl(EventStatusFilter));

export default createFragmentContainer(container, {
  query: graphql`
    fragment EventStatusFilter_query on Query
      @argumentDefinitions(
        count: { type: "Int!" }
        cursor: { type: "String" }
        theme: { type: "ID" }
        project: { type: "ID" }
        search: { type: "String" }
        userType: { type: "ID" }
        isFuture: { type: "Boolean" }
      ) {
      events(
        first: $count
        after: $cursor
        theme: $theme
        project: $project
        search: $search
        userType: $userType
        isFuture: $isFuture
      ) @connection(key: "EventListPaginated_events", filters: []) {
        edges {
          node {
            id
          }
        }
        totalCount
      }
      eventsWithoutFilters: events {
        totalCount
      }
    }
  `,
});
