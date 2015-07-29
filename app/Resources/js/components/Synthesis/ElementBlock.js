import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';
import ElementTitle from './ElementTitle';
import ElementBreadcrumb from './ElementBreadcrumb';

const FormattedDate = ReactIntl.FormattedDate;

const ElementBlock = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getNotationStarsClasses() {
    const notation = this.props.element.notation;
    let classes = [];
    for (let i = 0; i < 5; i++) {
      if (i < notation) {
        classes[i] = 'active';
      }
    }
    return classes;
  },

  renderAuthor() {
    if (this.props.element.author) {
      return (
        <span><UserLink user={this.props.element.author} /> • </span>
      );
    }
  },

  renderNotationStars() {
    if (this.props.element.notation !== null) {
      const classes = this.getNotationStarsClasses();
      return (
        <span className="element__notation">
          <span id="notation-star-1" className={classes[0]}><i className="cap cap-star-1"></i></span>
          <span id="notation-star-2" className={classes[1]}><i className="cap cap-star-1"></i></span>
          <span id="notation-star-3" className={classes[2]}><i className="cap cap-star-1"></i></span>
          <span id="notation-star-4" className={classes[3]}><i className="cap cap-star-1"></i></span>
          <span id="notation-star-5" className={classes[4]}><i className="cap cap-star-1"></i></span>
        </span>
      );
    }
  },

  renderStatus() {
    if (this.props.element.archived) {
      if (this.props.element.published) {
        return (
          <div className="element__status">
            <i className="element__status-icon icon--green cap-check-4"></i>
          </div>
        );
      }
      return (
        <div className="element__status">
          <i className="element__status-icon icon--grey cap-delete-2"></i>
        </div>
      );
    }
  },

  renderDate() {
    if (navigator.userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1) {
      return this.getIntlMessage('common.elements.no_source_date');
    }
    if (this.props.element.has_linked_data) {
      if (this.props.element.linked_data_creation) {
        return <FormattedDate value={this.props.element.linked_data_creation} day="numeric" month="long" year="numeric" />;
      }
      return this.getIntlMessage('common.elements.no_source_date');
    }
    return <FormattedDate value={this.props.element.updated_at} day="numeric" month="long" year="numeric" />;
  },

  render() {
    const element = this.props.element;
    return (
      <div className="element__body">
        <UserAvatar user={element.author} />
        <div className="element__data">
          <p className="element__user excerpt  small">
            {this.renderAuthor()} {this.renderDate()}
            {this.renderNotationStars()}
          </p>
          <h3 className="element__title ">
            <ElementTitle element={element} />
          </h3>
          <ElementBreadcrumb element={element} />
        </div>
          {this.renderStatus()}
      </div>
    );
  },

});

export default ElementBlock;
