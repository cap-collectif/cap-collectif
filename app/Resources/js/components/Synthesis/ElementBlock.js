import React from 'react';
import { IntlMixin, FormattedDate } from 'react-intl';
import moment from 'moment';
import UserLink from '../User/UserLink';
import ElementIcon from './ElementIcon';
import ElementTitle from './ElementTitle';
import ElementBreadcrumb from './ElementBreadcrumb';
import ElementNotation from './ElementNotation';

const ElementBlock = React.createClass({
  propTypes: {
    element: React.PropTypes.object.isRequired,
    showBreadcrumb: React.PropTypes.bool,
    showStatus: React.PropTypes.bool,
    showNotation: React.PropTypes.bool,
    hasLink: React.PropTypes.bool,
    linkType: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return ({
      showBreadcrumb: true,
      showStatus: true,
      showNotation: true,
      hasLink: true,
      linkType: 'edition',
    });
  },

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
    if (!Modernizr.intl) {
      return this.getIntlMessage('common.elements.no_source_date');
    }
    if (this.props.element.linkedDataCreation) {
      return <FormattedDate value={moment(this.props.element.linkedDataCreation)} day="numeric" month="long" year="numeric" />;
    }
    return <FormattedDate value={moment(this.props.element.updated_at)} day="numeric" month="long" year="numeric" />;
  },

  render() {
    const element = this.props.element;
    return (
      <div className="element">
        <ElementIcon element={element} className="element__icon" />
        <div className="element__content">
          <p className="element__metadata">
            {this.renderAuthor()} {this.renderDate()}
            {
              this.props.showNotation
                ? <ElementNotation element={element} />
                : null
            }
          </p>
          <ElementTitle element={element} linkType={this.props.linkType} hasLink={this.props.hasLink} className="element__title" />
          {
            this.props.showBreadcrumb
              ? <ElementBreadcrumb element={element} />
              : null
          }
        </div>
        {
          this.props.showStatus
            ? this.renderStatus()
            : null
        }
      </div>
    );
  },

});

export default ElementBlock;
