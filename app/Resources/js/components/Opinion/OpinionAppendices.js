// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import OpinionAppendix from './OpinionAppendix';
import type { OpinionAppendices_opinion } from './__generated__/OpinionAppendices_opinion.graphql';

type Props = { opinion: OpinionAppendices_opinion };

class OpinionAppendices extends React.Component<Props> {
  isVersion = () => {
    const { opinion } = this.props;
    return !!opinion.parent;
  };

  hasAppendices = () => {
    const { opinion } = this.props;
    const appendices = this.isVersion() ? opinion.parent.appendices : opinion.appendices;
    if (!appendices) {
      return false;
    }
    return appendices.some((app: Object) => {
      return !!app.body;
    });
  };

  render() {
    return null;
    if (!this.hasAppendices()) {
      return null;
    }
    const opinion = this.props.opinion;
    const appendices = this.isVersion() ? opinion.parent.appendices : opinion.appendices;

    return (
      <div className="opinion__description">
        {this.isVersion() ? (
          <p>
            <FormattedMessage id="opinion.version_parent" />
            <a href={opinion.parent.url}>{opinion.parent.title}</a>
          </p>
        ) : null}
        {appendices.map((appendix, index) => {
          if (appendix.body) {
            return (
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
      ... on Opinion {
        id
        #appendices {
        #   body
        #   ...OpinionAppendix_appendix
        # }
      }
      ... on Version {
        parent {
          title
          url
        }
      }
    }
  `,
});