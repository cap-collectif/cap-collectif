// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionTypeLabel from './OpinionTypeLabel';
import type { OpinionPreviewTitle_opinion } from './__generated__/OpinionPreviewTitle_opinion.graphql';

type Props = {
  opinion: OpinionPreviewTitle_opinion,
  showTypeLabel: boolean,
};

export class OpinionPreviewTitle extends React.Component<Props> {
  render() {
    const { opinion, showTypeLabel } = this.props;
    return (
      <h3 className="opinion__title">
        {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
        {showTypeLabel ? <OpinionTypeLabel type={opinion.section || null} /> : null}
        {showTypeLabel ? ' ' : null}
        <a href={opinion.url}>{opinion.title}</a>
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
        section {
          ...OpinionTypeLabel_section
        }
      }
      ... on Version {
        url
        title
        section {
          ...OpinionTypeLabel_section
        }
      }
    }
  `,
});
