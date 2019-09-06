// @flow
import React from 'react';
import { Button } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { showOpinionVersionEditModal } from '../../redux/modules/opinion';

type Props = {
  dispatch: Function,
};

class OpinionVersionEditButton extends React.Component<Props> {
  render() {
    const { dispatch } = this.props;

    return (
      <div className="ml-5">
        <Button
          id="opinion-version-edit-button"
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
