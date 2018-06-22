import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedMessage } from 'react-intl';
import moment from 'moment';
import UserLink from '../../User/UserLink';
import ElementIcon from './ElementIcon';
import ElementTitle from './ElementTitle';
import ElementBreadcrumb from './ElementBreadcrumb';
import ElementNotation from './ElementNotation';

class ElementBlock extends React.Component {
  static propTypes = {
    element: PropTypes.object.isRequired,
    showBreadcrumb: PropTypes.bool,
    showStatus: PropTypes.bool,
    showNotation: PropTypes.bool,
    hasLink: PropTypes.bool,
    linkType: PropTypes.string,
  };

  static defaultProps = {
    showBreadcrumb: true,
    showStatus: true,
    showNotation: true,
    hasLink: true,
    linkType: 'edition',
  };

  renderAuthor = () => {
    const { element } = this.props;
    if (element.author) {
      return (
        <span>
          <UserLink user={element.author} /> •{' '}
        </span>
      );
    }
  };

  renderStatus = () => {
    const { element } = this.props;
    if (element.division) {
      return <i className="element__status cap icon--orange cap-scissor-1" />;
    }

    if (element.archived) {
      if (element.published) {
        return <i className="element__status cap icon--green cap-tag-1" />;
      }
      return <i className="element__status cap icon--red cap-delete-2" />;
    }
  };

  renderDate = () => {
    const { element } = this.props;
    if (!Modernizr.intl) {
      return <FormattedMessage id="synthesis.common.elements.no_source_date" />;
    }
    if (element.linkedDataCreation) {
      return (
        <FormattedDate
          value={moment(element.linkedDataCreation)}
          day="numeric"
          month="long"
          year="numeric"
        />
      );
    }
    return (
      <FormattedDate value={moment(element.updated_at)} day="numeric" month="long" year="numeric" />
    );
  };

  render() {
    const { hasLink, linkType, showBreadcrumb, showNotation, showStatus } = this.props;
    const element = this.props.element;
    return (
      <div className="element">
        <ElementIcon element={element} className="element__icon" />
        <div className="element__content">
          <p className="element__metadata">
            {this.renderAuthor()} {this.renderDate()}
            {showNotation ? <ElementNotation element={element} /> : null}
          </p>
          <ElementTitle
            element={element}
            linkType={linkType}
            hasLink={hasLink}
            className="element__title"
          />
          {showBreadcrumb ? <ElementBreadcrumb element={element} /> : null}
        </div>
        {showStatus ? this.renderStatus() : null}
      </div>
    );
  }
}

export default ElementBlock;
