// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { type StyledComponent } from 'styled-components';
import Icon, { ICON_NAME } from '~/components/Ui/Icons/Icon';
import colors from '~/utils/colors';
import LoginOverlay from '../Utils/LoginOverlay';
import { type State } from '~/types';
import { type BsSize } from '~/types/ReactBootstrap.type';

type Props = {
  id: string,
  reported: boolean,
  className: ?string,
  onClick: () => void,
  style: ?Object,
  bsSize?: BsSize,
  disabled?: boolean,
  newDesign?: boolean,
};

const NewReportButton: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  border: none;
  background: none;
`;

export class ReportButton extends React.PureComponent<Props> {
  static defaultProps = {
    className: '',
    style: {},
    bsSize: 'medium',
  };

  render() {
    const { reported, className, onClick, bsSize, id, style, disabled, newDesign } = this.props;

    return (
      <LoginOverlay>
        {newDesign ? (
          <NewReportButton
            id={`report-${id}-button`}
            onClick={reported ? null : onClick}
            active={reported}
            disabled={reported || disabled}>
            <Icon name={ICON_NAME.flag} size={10} color={colors.darkGray} />
          </NewReportButton>
        ) : (
          <Button
            id={`report-${id}-button`}
            style={style}
            bsSize={bsSize}
            className={className}
            onClick={reported ? null : onClick}
            active={reported}
            disabled={reported || disabled}>
            <i className="cap cap-flag-1" />{' '}
            {reported ? (
              <FormattedMessage id="global.report.reported" />
            ) : (
              <FormattedMessage id="global.report.submit" />
            )}
          </Button>
        )}
      </LoginOverlay>
    );
  }
}

const mapStateToProps = (state: State, props) => ({
  reported: props.reported || state.report.elements.includes(props.id),
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ReportButton);
