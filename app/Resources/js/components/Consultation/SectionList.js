// @flow
import * as React from 'react';
import Section from './Section';

export const SectionList = React.createClass({
  propTypes: {
    section: React.PropTypes.object.isRequired,
    consultation: React.PropTypes.object.isRequired,
    level: React.PropTypes.number.isRequired,
  },

  render() {
    const { consultation, section, level } = this.props;
    return (
      <div>
        <Section consultation={consultation} section={section} level={level} />
        {section.sections &&
          section.sections.map((subSelection, index) =>
            <SectionList
              key={index}
              consultation={consultation}
              section={subSelection}
              level={level + 1}
            />,
          )}
      </div>
    );
  },
});

export default SectionList;
