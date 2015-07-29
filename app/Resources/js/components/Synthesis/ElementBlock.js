import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';
import ElementTitle from './ElementTitle';
import ElementBreadcrumb from './ElementBreadcrumb';
import ElementNotation from './ElementNotation';

const FormattedDate = ReactIntl.FormattedDate;

const ElementBlock = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  renderAuthor() {
    if (this.props.element.author) {
      return (
        <span><UserLink user={this.props.element.author} /> • </span>
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
            <ElementNotation element={element} />
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
