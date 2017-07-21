import React, { PropTypes } from 'react';
import { IntlMixin, FormattedMessage } from 'react-intl';
import { Row, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';

export const IdeasIndexFooter = React.createClass({
  propTypes: {
    trashUrl: PropTypes.string,
    countTrashed: PropTypes.number.isRequired,
    features: PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      trashUrl: null,
    };
  },

  render() {
    const {
      trashUrl,
      countTrashed,
      features,
    } = this.props;
    if (!features.idea_trash || !trashUrl) {
      return null;
    }
    return (
      <div className="container  container--custom  appendices__container">
        <Row>
          <Col xs={12} md={4} mdOffset={4} className="text-center appendices__item box">
            <h2 className="h4">
              {this.getIntlMessage('idea.appendices.trashed.title')}
            </h2>
            <p className="excerpt">
              <FormattedMessage
                num={countTrashed}
                message={this.getIntlMessage('idea.appendices.trashed.nb')}
              />
            </p>
            <p>
              <Button
                id="ideas-trash"
                href={trashUrl}
                bsStyle="primary"
                className="btn--outline"
              >
                {this.getIntlMessage('idea.appendices.trashed.button')}
              </Button>
            </p>
          </Col>
        </Row>
      </div>
    );
  },

});

const mapStateToProps = (state) => {
  return { features: state.default.features };
};

export default connect(mapStateToProps)(IdeasIndexFooter);
