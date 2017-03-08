// @flow
import React, { PropTypes } from 'react';
import { Button } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';

const OpinionVersionCreateButton = React.createClass({
  propTypes: {
    className: PropTypes.string,
    style: PropTypes.object.isRequired,
    isContribuable: PropTypes.bool,
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
    const { style, className } = this.props;
    if (!style.display) {
      style.display = 'inline-block';
    }
    const { isContribuable } = this.props;
    return (
      <div className={className} style={style}>
        {
          isContribuable &&
            <LoginOverlay>
              <Button bsStyle="primary" onClick={() => this.show()}>
                <i className="cap cap-add-1"></i>
                { ` ${this.getIntlMessage('opinion.add_new_version')}`}
              </Button>
            </LoginOverlay>
        }
      </div>
    );
  },

});

const mapStateToProps = state => ({
  user: state.user.user,
  features: state.default.features,
});

export default connect(mapStateToProps)(OpinionVersionCreateButton);
