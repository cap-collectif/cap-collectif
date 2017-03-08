import React from 'react';
import { Link } from 'react-router';
import { IntlMixin } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import SynthesisPourcentageTooltipLabel from '../View/SynthesisPourcentageTooltipLabel';

const ElementTitle = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    parent: React.PropTypes.object,
    linkType: React.PropTypes.string,
    hasLink: React.PropTypes.bool,
    className: React.PropTypes.string,
    style: React.PropTypes.object,
    onClick: React.PropTypes.func,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      hasLink: false,
      linkType: 'none',
      style: {},
      className: '',
      onClick: null,
    };
  },

  openOriginalContribution() {
    const { element } = this.props;
    window.open(element.linkedDataUrl);
    return false;
  },

  renderTitle() {
    const { element } = this.props;
    if (element.title) {
      return element.title;
    }
    if (element.body) {
      return `${element.body.substr(0, 140)}...`;
    }
    return this.getIntlMessage('synthesis.common.elements.default_title');
  },

  render() {
    const {
      element,
      hasLink,
      linkType,
      onClick,
      style,
      parent,
    } = this.props;
    const className = this.props.className + (onClick ? ' btn btn-link' : '');
    if (!hasLink) {
      return (
            this.props.className === 'tree__item__title' && element && parent
            ? <OverlayTrigger placement="top" overlay={
              <Tooltip>
                <SynthesisPourcentageTooltipLabel element={element} parent={parent} />
              </Tooltip>
            }>
              <span style={style} className={className} onClick={onClick} >
                {this.renderTitle()}
                <span style={{ color: 'black' }}>{` (${element.childrenCount})`}</span>
              </span>
            </OverlayTrigger>
            : <span style={style} className={className} onClick={onClick}>
              {this.renderTitle()}
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
      <a style={style} href={element.linkedDataUrl} className={this.props.className} onClick={this.openOriginalContribution}>
        {this.renderTitle()}
      </a>
    );
  },

});

export default ElementTitle;
