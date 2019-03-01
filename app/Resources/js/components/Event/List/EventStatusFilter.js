// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Field, formValueSelector } from 'redux-form';
import { Button, OverlayTrigger, Popover } from 'react-bootstrap';
import { connect } from 'react-redux';
import type { EventStatusFilter_query } from './__generated__/EventStatusFilter_query.graphql';
import type { State } from '../../../types';
import fieldComponent from '../../Form/Field';

type Props = {
  query: EventStatusFilter_query,
  status: ?string,
};

const StatusButton = styled(Button).attrs({
  bsStyle: 'link',
})`
  text-transform: lowercase;
  font-size: 16px;
  text-decoration: underline;
  padding: 0 5px;

  &.btn.btn-link,
  &.btn.btn-link:hover {
    color: white;
  }
`;

export class EventStatusFilter extends React.Component<Props> {
  statusPopover = () => {
    const { status } = this.props;

    return (
      <Popover id="event-status-filter">
        <form>
          <Field
            component={fieldComponent}
            id="all-events"
            name="status"
            type="radio"
            value="all"
            radioChecked={status === 'all'}>
            <FormattedMessage id="search.form.themes.all" />
          </Field>
          <Field
            component={fieldComponent}
            id="ongoing-and-future-events"
            name="status"
            type="radio"
            value="ongoing-and-future"
            radioChecked={status === 'ongoing-and-future'}>
            <FormattedMessage id="theme.show.status.future" />
          </Field>
          <Field
            component={fieldComponent}
            id="finished-events"
            name="status"
            type="radio"
            value="finished"
            radioChecked={status === 'finished'}>
            <FormattedMessage id="finished" />
          </Field>
        </form>
      </Popover>
    );
  };

  getButtonMessage = () => {
    const { status } = this.props;

    if (status === 'all') {
      return (
        <>
          ( <FormattedMessage id="search.form.themes.all" /> )
        </>
      );
    }

    if (status === 'ongoing-and-future') {
      return <FormattedMessage id="theme.show.status.future" />;
    }

    return <FormattedMessage id="finished" />;
  };

  render() {
    const { query } = this.props;

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
          <StatusButton>{this.getButtonMessage()}</StatusButton>
        </OverlayTrigger>
      </>
    );
  }
}

const selector = formValueSelector('EventListFilters');

const mapStateToProps = (state: State) => ({
  status: selector(state, 'status'),
});

const container = connect(mapStateToProps)(EventStatusFilter);

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
