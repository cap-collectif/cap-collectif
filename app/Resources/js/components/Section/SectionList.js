// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import styled from 'styled-components';
import type { SectionList_sections } from '~relay/SectionList_sections.graphql';

import Opinion from '../Consultation/Opinion';

export type Props = {|
  sections: SectionList_sections,
|};

const PanelTitle = styled.h3`
  font-size: 18px;
`;

class SectionList extends React.Component<Props> {
  render() {
    const { sections } = this.props;

    return (
      <div>
        {sections.map(opinionType => (
          <div className="panel panel-default">
            <div className="panel-heading opinion opinion--default">
              <PanelTitle className="m-0">
                {' '}
                {opinionType.title}
                <span className="badge ml-5">{opinionType.opinions.totalCount}</span>
              </PanelTitle>
            </div>
            <ul className="media-list opinion__list">
              {opinionType.opinions.edges &&
                opinionType.opinions.edges.map(opinion => (
                  // $FlowFixMe $refType
                  <Opinion opinion={opinion.node} />
                ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
}

export default createFragmentContainer(SectionList, {
  sections: graphql`
    fragment SectionList_sections on Section @relay(plural: true) {
      title
      color
      opinions {
        totalCount
        edges {
          node {
            id
            ...Opinion_opinion
          }
        }
      }
    }
  `,
});
