import React from 'react';
import OpinionTypeLabel from './OpinionTypeLabel';

export default class OpinionPreviewTitle extends React.Component {

  getType() {
    const opinion = this.props.opinion;
    if (opinion.parent) {
      return opinion.parent.type;
    }
    return opinion.type;
  }

  render() {
    return (
      <h3 className="opinion__title">
        {this.props.showTypeLabel
          ? <OpinionTypeLabel type={this.getType()} />
          : null
        }
        {this.props.showTypeLabel
          ? ' '
          : null
        }
        {this.props.link
          ? <a href={this.props.opinion._links.show}>{ this.props.opinion.title }</a>
          : this.props.opinion.title
        }
      </h3>
    );
  }
}

OpinionPreviewTitle.propTypes = {
  link: React.PropTypes.bool.isRequired,
  opinion: React.PropTypes.object.isRequired,
  showTypeLabel: React.PropTypes.bool.isRequired,
};
