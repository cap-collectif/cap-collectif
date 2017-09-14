// @flow
import * as React from 'react';
import OpinionTypeLabel from './OpinionTypeLabel';

type Props = {
  link: boolean,
  opinion: Object,
  showTypeLabel: boolean,
};

export default class OpinionPreviewTitle extends React.Component<Props> {
  getType() {
    // eslint-disable-next-line react/prop-types
    const opinion = this.props.opinion;
    if (opinion.parent) {
      return opinion.parent.type;
    }
    return opinion.type;
  }

  render() {
    // eslint-disable-next-line react/prop-types
    const { link, opinion, showTypeLabel } = this.props;
    let url = '';
    if (link) {
      url = opinion._links ? opinion._links.show : opinion.url;
    }
    return (
      <h3 className="opinion__title">
        {showTypeLabel ? <OpinionTypeLabel type={this.getType()} /> : null}
        {showTypeLabel ? ' ' : null}
        {link
          ? <a href={url}>
              {opinion.title}
            </a>
          : opinion.title}
      </h3>
    );
  }
}
