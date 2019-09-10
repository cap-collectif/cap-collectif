// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { showOpinionVersionEditModal } from '../../redux/modules/opinion';

type Props = {
  className?: string,
  style: Object,
  dispatch: Function,
};

class OpinionVersionEditButton extends React.Component<Props> {
  static defaultProps = {
    className: '',
    style: {},
  };

  render() {
    const { dispatch, style, className } = this.props;
    if (!style.display) {
      style.display = 'inline-block';
    }
    return (
      <div className={className} style={style}>
        <Button
          className="opinion__action--edit pull-right btn--outline btn-dark-gray"
          onClick={() => {
            dispatch(showOpinionVersionEditModal());
          }}>
          <i className="cap cap-pencil-1" /> {<FormattedMessage id="global.edit" />}
        </Button>
      </div>
    );
  }
}

export default connect()(OpinionVersionEditButton);
