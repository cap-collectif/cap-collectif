import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';
import ElementTitle from './ElementTitle';
import ElementBreadcrumb from './ElementBreadcrumb';

var FormattedDate = ReactIntl.FormattedDate;
let Link = ReactRouter.Link;

var ElementBlock = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  render() {
    var element = this.props.element;
    return (
        <div className="element__body">
          <UserAvatar user={element.author} />
          <div className="element__data">
            <p className="element__user excerpt  small">
              <UserLink user={element.author} /> • {this.renderDate()}
              <span className="element__notation">
                {this.renderNotationStars()}
              </span>
            </p>
            <h3 className="element__title ">
              <ElementTitle element={element} />
            </h3>
            <ElementBreadcrumb element={element} />
          </div>
          {this.renderStatus()}
        </div>
    )
  },

  renderNotationStars() {
    var classes = this.getNotationStarsClasses();
    return (
      <span className="element__notation">
        <span className={classes[0]}><i className="cap cap-star-1"></i></span>
        <span className={classes[1]}><i className="cap cap-star-1"></i></span>
        <span className={classes[2]}><i className="cap cap-star-1"></i></span>
        <span className={classes[3]}><i className="cap cap-star-1"></i></span>
        <span className={classes[4]}><i className="cap cap-star-1"></i></span>
      </span>
    );
  },

  getNotationStarsClasses() {
    var notation = this.props.element.notation ? this.props.element.notation : 0;
    var classes = [];
    for (var i = 0; i < 5; i++) {
      if (i < notation) {
        classes[i] = 'active';
      }
    }
    return classes;
  },

  renderStatus() {
    if (!this.props.element.enabled) {
      return (
        <div className="element__status">
          <i className="element__status-icon icon--grey cap-delete-2"></i>
        </div>
      );
    }
    if (this.props.element.archived) {
      return (
        <div className="element__status">
          <i className="element__status-icon icon--green cap-check-4"></i>
        </div>
      );
    }
  },

  renderDate() {
    if (this.props.element.hasLinkedData) {
      if (this.props.element.linkedDataCreation) {
        return <FormattedDate value={this.props.element.linkedDataCreation} day="numeric" month="long" year="numeric" />;
      }
      return this.getIntlMessage('common.elements.no_source_date');
    }
    return <FormattedDate value={element.updated_at} day="numeric" month="long" year="numeric" />;
  }

});

export default ElementBlock;
