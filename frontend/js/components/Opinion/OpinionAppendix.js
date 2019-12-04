// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import type { OpinionAppendix_appendix } from '~relay/OpinionAppendix_appendix.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';

type Props = {
  appendix: OpinionAppendix_appendix,
};

class OpinionAppendix extends React.Component<Props> {
  render() {
    const { appendix } = this.props;

    if (!appendix.body) {
      return null;
    }

    return (
      <div className="opinion__appendix">
        <div className="opinion__appendix__title">{appendix.appendixType.title}</div>
        <div>
          <WYSIWYGRender value={appendix.body} />
        </div>
      </div>
    );
  }
}

export default createFragmentContainer(OpinionAppendix, {
  appendix: graphql`
    fragment OpinionAppendix_appendix on Appendix {
      body
      appendixType {
        title
      }
    }
  `,
});
