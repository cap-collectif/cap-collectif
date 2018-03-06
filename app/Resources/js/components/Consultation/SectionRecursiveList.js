// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import SectionList from './SectionList';
import type { SectionRecursiveList_sections } from './__generated__/SectionRecursiveList_sections.graphql';

type Props = {
  sections: SectionRecursiveList_sections,
  consultation: Object
};

export class SectionRecursiveList extends React.Component<Props> {
  render() {
    const { sections, consultation } = this.props;
    return (
      <div>
        {sections.map((section, index) => (
          <SectionList key={index} consultation={consultation} section={section} level={0} />
        ))}
      </div>
    );
  }
}

export default createFragmentContainer(
  SectionRecursiveList,
  graphql`
    fragment SectionRecursiveList_sections on Section @relay(plural: true) {
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
  `
);
