import React from 'react';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

type Props = {
  element: Object,
  parent: Object,
  linkType: string,
  hasLink: boolean,
  className: string,
  style: Object,
  onClick: Function,
};

class ElementTitle extends React.Component<Props> {
  static defaultProps = {
    hasLink: false,
    linkType: 'none',
    style: {},
    className: '',
    onClick: null,
  };

  openOriginalContribution = () => {
    const { element } = this.props;
    window.open(element.linkedDataUrl);
    return false;
  };

  renderTitle = () => {
    const { element } = this.props;
    if (element.title) {
      return element.title;
    }
    if (element.body) {
      return `${element.body.substr(0, 140)}...`;
    }
    return <FormattedMessage id="synthesis.common.elements.default_title" />;
  };

  render() {
    const { element, hasLink, linkType, onClick, style } = this.props;
    const className = this.props.className + (onClick ? ' btn btn-link' : '');
    if (!hasLink) {
      return (
        <span style={style} className={className} onClick={onClick}>
          {this.renderTitle()}
          {this.props.className === '' && element.childrenCount > 0 && (
            <span style={{ color: 'black' }}>{` (${element.childrenCount})`}</span>
          )}
        </span>
      );
    }
    if (linkType === 'edition') {
      return (
        <Link style={style} to={`/element/${element.id}`} className={this.props.className}>
          {this.renderTitle()}
        </Link>
      );
    }

    return (
      <a
        style={style}
        href={element.linkedDataUrl}
        className={this.props.className}
        onClick={this.openOriginalContribution}>
        {this.renderTitle()}
      </a>
    );
  }
}

export default ElementTitle;
