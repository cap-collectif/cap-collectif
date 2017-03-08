// @flow
import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';
import { showOpinionVersionCreateModal } from '../../redux/modules/opinion';

const OpinionVersionCreateButton = React.createClass({
  propTypes: {
    className: PropTypes.string,
    style: PropTypes.object.isRequired,
    isContribuable: PropTypes.bool,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      isContribuable: false,
      className: '',
      style: {},
    };
  },

  render() {
    const { isContribuable, dispatch, style, className } = this.props;
    if (!style.display) {
      style.display = 'inline-block';
    }
    return (
      <div className={className} style={style}>
        {
          isContribuable &&
            <LoginOverlay>
              <Button bsStyle="primary" onClick={() => { dispatch(showOpinionVersionCreateModal()); }}>
                <i className="cap cap-add-1"></i>
                { ` ${this.getIntlMessage('opinion.add_new_version')}`}
              </Button>
            </LoginOverlay>
        }
      </div>
    );
  },

});

export default connect()(OpinionVersionCreateButton);
