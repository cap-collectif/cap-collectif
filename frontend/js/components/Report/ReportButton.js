// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';
import { type State } from '../../types';

type Props = {
  id: string,
  reported: boolean,
  className: ?string,
  onClick: Function,
  style: ?Object,
  bsSize: ?string,
};

export class ReportButton extends React.PureComponent<Props> {
  static defaultProps = {
    className: '',
    style: {},
    bsSize: null,
  };

  render() {
    const { reported, className, onClick, bsSize, id, style } = this.props;

    return (
      <LoginOverlay>
        <Button
          id={`report-${id}-button`}
          style={style}
          bsSize={bsSize}
          className={className}
          onClick={reported ? null : onClick}
          active={reported}
          disabled={reported}>
          <i className="cap cap-flag-1" />{' '}
          {reported ? (
            <FormattedMessage id="global.report.reported" />
          ) : (
            <FormattedMessage id="global.report.submit" />
          )}
        </Button>
      </LoginOverlay>
    );
  }
}

const mapStateToProps = (state: State, props) => ({
  reported: props.reported || state.report.elements.includes(props.id),
});

export default connect(mapStateToProps)(ReportButton);
