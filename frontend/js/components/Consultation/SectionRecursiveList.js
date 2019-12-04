// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import SectionList from './SectionList';
import UnpublishedOpinionList from './UnpublishedOpinionList';
import type { SectionRecursiveList_consultation } from '~relay/SectionRecursiveList_consultation.graphql';

type Props = {|
  +consultation: SectionRecursiveList_consultation,
  +hideEmptySection: boolean,
|};

export class SectionRecursiveList extends React.Component<Props> {
  static defaultProps = {
    hideEmptySection: false,
  };

  render() {
    const { consultation, hideEmptySection } = this.props;

    return (
      <div>
        {/* $FlowFixMe */}
        <UnpublishedOpinionList consultation={consultation} />
        {consultation.sections &&
          consultation.sections.filter(Boolean).map((section, index) => (
            // $FlowFixMe $refType
            <SectionList
              key={index}
              consultation={consultation}
              section={section}
              level={0}
              hideEmptySection={hideEmptySection}
            />
          ))}
      </div>
    );
  }
}

export default createFragmentContainer(SectionRecursiveList, {
  consultation: graphql`
    fragment SectionRecursiveList_consultation on Consultation
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...UnpublishedOpinionList_consultation
      ...Section_consultation @arguments(isAuthenticated: $isAuthenticated)
      id
      sections {
        ...Section_section
        sections {
          ...Section_section
          sections {
            ...Section_section
            sections {
              ...Section_section
              sections {
                ...Section_section
              }
            }
          }
        }
      }
    }
  `,
});
