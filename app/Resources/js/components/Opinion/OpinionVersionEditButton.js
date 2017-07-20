// @flow
import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { showOpinionVersionEditModal } from '../../redux/modules/opinion';

const OpinionVersionEditButton = React.createClass({
  propTypes: {
    className: PropTypes.string,
    style: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      className: '',
      style: {},
    };
  },

  render() {
    const { dispatch, style, className } = this.props;
    if (!style.display) {
      style.display = 'inline-block';
    }
    return (
      <div className={className} style={style}>
        <Button
          className="opinion__action--edit pull-right btn--outline btn-dark-gray"
          onClick={() => { dispatch(showOpinionVersionEditModal()); }}
        >
          <i className="cap cap-pencil-1"></i> {this.getIntlMessage('global.edit')}
        </Button>
      </div>
    );
  },
});


export default connect()(OpinionVersionEditButton);
