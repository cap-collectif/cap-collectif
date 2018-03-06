// @flow
import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';
import { showOpinionVersionCreateModal } from '../../redux/modules/opinion';
import type { Dispatch } from '../../types';

type Props = {
  className?: string,
  style: Object,
  isContribuable: boolean,
  dispatch: Dispatch
};

class OpinionVersionCreateButton extends React.Component<Props> {
  static defaultProps = {
    isContribuable: false,
    className: '',
    style: {}
  };

  render() {
    const { isContribuable, dispatch, style, className } = this.props;
    if (!style.display) {
      style.display = 'inline-block';
    }
    return (
      <div className={className} style={style}>
        {isContribuable && (
          <LoginOverlay>
            <Button
              bsStyle="primary"
              onClick={() => {
                dispatch(showOpinionVersionCreateModal());
              }}>
              <i className="cap cap-add-1" />
              <FormattedMessage id="opinion.add_new_version" />
            </Button>
          </LoginOverlay>
        )}
      </div>
    );
  }
}

export default connect()(OpinionVersionCreateButton);
