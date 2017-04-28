// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { IntlMixin } from 'react-intl';
import SectionList from './SectionList';

export const SectionRecursiveList = React.createClass({
  propTypes: {
    sections: React.PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { sections } = this.props;
    return (
      <div>
        {sections.map((section, index) => (
          <SectionList key={index} section={section} level={0} />
        ))}
      </div>
    );
  },
});

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
  `,
);
