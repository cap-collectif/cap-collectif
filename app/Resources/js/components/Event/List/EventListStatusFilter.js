// @flow
import * as React from 'react';
import styled, { type StyledComponent } from 'styled-components';
import { FormattedMessage } from 'react-intl';
import { Field, formValueSelector } from 'redux-form';
import { Button, Overlay } from 'react-bootstrap';
import { connect } from 'react-redux';
import type { GlobalState } from '../../../types';
import fieldComponent from '../../Form/Field';
import colors from '../../../utils/colors';
import Popover from '../../Utils/Popover';

type Props = {
  status: ?string,
  screen?: 'mobile' | 'desktop',
};

type State = {
  show: boolean,
};

const StatusButton: StyledComponent<{}, {}, Button> = styled(Button).attrs({
  bsStyle: 'link',
  id: props => `event-status-filter-button-${props.screen || ''}`,
})`
  text-transform: lowercase;
  font-size: 16px;
  text-decoration: underline;
  padding: 0 5px;

  &.btn.btn-link,
  &.btn.btn-link:hover {
    color: white;

    @media screen and (max-width: 991px) {
      color: ${colors.darkText};
    }
  }
`;

const StatusPopover: StyledComponent<{}, {}, typeof Popover> = styled(Popover).attrs({
  id: 'event-status-filter',
})`
  color: black;
  white-space: nowrap;

  .radio {
    margin-top: 0;
  }

  .form-group {
    margin-bottom: 10px;
  }

  .form-group:last-child {
    &,
    .radio {
      margin-bottom: 0;
    }
  }
`;

export class EventListStatusFilter extends React.Component<Props, State> {
  target: any;

  constructor(props: Props) {
    super(props);

    this.target = React.createRef();

    this.state = {
      show: false,
    };
  }

  handleToggle = () => {
    const { show } = this.state;
    this.setState({ show: !show });
  };

  getPopover = () => {
    const { status } = this.props;

    return (
      <StatusPopover>
        <form onChange={this.handleToggle}>
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
      </StatusPopover>
    );
  };

  getButtonMessage = () => {
    const { status } = this.props;

    if (status === 'all') {
      return (
        <>
          (<FormattedMessage id="search.form.themes.all" />)
        </>
      );
    }

    if (status === 'ongoing-and-future') {
      return <FormattedMessage id="theme.show.status.future" />;
    }

    return <FormattedMessage id="finished" />;
  };

  render() {
    const { screen } = this.props;
    const { show } = this.state;

    return (
      <div className="position-relative">
        <StatusButton
          onClick={this.handleToggle}
          ref={this.target}
          aria-expanded={show}
          screen={screen}>
          {this.getButtonMessage()}
        </StatusButton>
        <Overlay
          placement="bottom"
          container={this}
          show={show}
          target={this.target.current}>
          {this.getPopover()}
        </Overlay>
      </div>
    );
  }
}

const selector = formValueSelector('EventPageContainer');

const mapStateToProps = (state: GlobalState) => ({
  status: selector(state, 'status'),
});

export default connect(mapStateToProps)(EventListStatusFilter);
