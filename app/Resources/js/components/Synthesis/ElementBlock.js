import UserLink from '../User/UserLink';
import ElementIcon from './ElementIcon';
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
    if (this.props.element.division) {
      return (
        <i className="element__status cap icon--orange cap-scissor-1"></i>
      );
    }

    if (this.props.element.archived) {
      if (this.props.element.published) {
        return (
          <i className="element__status cap icon--green cap-tag-1"></i>
        );
      }
      return (
        <i className="element__status cap icon--red cap-delete-2"></i>
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
      <div className="element">
        <ElementIcon element={element} className="element__icon" />
        <div className="element__content">
          <p className="element__metadata">
            {this.renderAuthor()} {this.renderDate()}
            <ElementNotation element={element} />
          </p>
          <ElementTitle element={element} link={true} className="element__title" />
          <ElementBreadcrumb element={element} />
        </div>
        {this.renderStatus()}
      </div>
    );
  },

});

export default ElementBlock;
