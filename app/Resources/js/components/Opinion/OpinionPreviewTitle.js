// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionTypeLabel from './OpinionTypeLabel';
import type { OpinionPreviewTitle_opinion } from './__generated__/OpinionPreviewTitle_opinion.graphql';

type Props = {
  link: boolean,
  opinion: OpinionPreviewTitle_opinion,
  showTypeLabel: boolean,
};

export class OpinionPreviewTitle extends React.Component<Props> {

  render() {
    const { link, opinion, showTypeLabel } = this.props;
    let url = '';
    if (link) {
      url = opinion.url;
    }
    return (
      <h3 className="opinion__title">
        {showTypeLabel ? <OpinionTypeLabel type={opinion.section} /> : null}
        {showTypeLabel ? ' ' : null}
        {link ? <a href={url}>{opinion.title}</a> : opinion.title}
      </h3>
    );
  }
}

export default createFragmentContainer(OpinionPreviewTitle, {
  opinion: graphql`
    fragment OpinionPreviewTitle_opinion on OpinionOrVersion {
      ... on Opinion {
        url
        title
      }
      ... on Version {
        url
        title
      }
    }
  `,
});
