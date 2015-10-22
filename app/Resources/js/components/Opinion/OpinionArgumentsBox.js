import {COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH} from '../../constants/ArgumentConstants';

import OpinionArgumentList from './OpinionArgumentList';
import OpinionArgumentForm from './OpinionArgumentForm';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const OpinionArgumentsBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getCommentSystem() {
    return this.props.opinion.parent ? this.props.opinion.parent.type.commentSystem : this.props.opinion.type.commentSystem;
  },

  renderArgumentsForType(type) {
    return (
      <div id={'arguments-col--' + type} >
        { this.props.opinion.isContribuable
          ? <div className="opinion opinion--add-argument block block--bordered">
              <OpinionArgumentForm type={type} opinion={this.props.opinion}/>
            </div>
          : null
        }
        <OpinionArgumentList type={type} {...this.props} opinion={this.props.opinion}/>
      </div>
    );
  },

  render() {
    if (this.getCommentSystem() === COMMENT_SYSTEM_BOTH) {
      return (
        <Row>
          <Col sm={12} md={6}>
            {this.renderArgumentsForType('yes')}
          </Col>
          <Col sm={12} md={6}>
            {this.renderArgumentsForType('no')}
          </Col>
        </Row>
      );
    }

    if (this.getCommentSystem() === COMMENT_SYSTEM_SIMPLE) {
      return this.renderArgumentsForType('simple');
    }

    return null;
  },

});

export default OpinionArgumentsBox;
