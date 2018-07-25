// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import OpinionAppendix from './OpinionAppendix';
import type { OpinionAppendices_opinion } from './__generated__/OpinionAppendices_opinion.graphql';

type Props = { opinion: OpinionAppendices_opinion };

class OpinionAppendices extends React.Component<Props> {
  render() {
    const opinion = this.props.opinion;
    if (!opinion) {
      return;
    }
    let appendices = opinion.__typename === 'Version' ? opinion.parent.appendices : [];
    if (opinion.__typename === 'Opinion') {
      appendices = opinion.appendices;
    }
    if (!appendices || appendices.length === 0) {
      return null;
    }

    return (
      <div className="opinion__description">
        {opinion.__typename === 'Version' ? (
          <p>
            <FormattedMessage id="opinion.version_parent" />
            <a href={opinion.parent.url}>{opinion.parent.title}</a>
          </p>
        ) : null}
        {appendices.map((appendix, index) => {
          if (appendix && appendix.body) {
            return (
              // $FlowFixMe
              <OpinionAppendix
                key={index}
                appendix={appendix}
                expanded={index === 0}
                onToggle={() => {}}
              />
            );
          }
        })}
      </div>
    );
  }
}

export default createFragmentContainer(OpinionAppendices, {
  opinion: graphql`
    fragment OpinionAppendices_opinion on OpinionOrVersion {
      __typename
      ... on Opinion {
        id
        appendices {
          body
          ...OpinionAppendix_appendix
        }
      }
      ... on Version {
        parent {
          title
          url
          appendices {
            body
            ...OpinionAppendix_appendix
          }
        }
      }
    }
  `,
});
