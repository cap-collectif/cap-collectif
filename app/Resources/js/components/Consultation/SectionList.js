// @flow
import * as React from 'react';
import Section from './Section';

type Props = {
  section: Object,
  consultation: Object,
  level: number,
  group: number,
};

export class SectionList extends React.Component<Props> {
  render() {
    const { consultation, section, level, group } = this.props;

    return (
      <div className="section-list_container" id={section.__id} data-group={group}>
        <Section consultation={consultation} section={section} level={level} />
        {section.sections &&
          section.sections.map((subSelection, index) => (
            <SectionList
              key={index}
              consultation={consultation}
              section={subSelection}
              level={level + 1}
              group={(group*10)+(index+1)}
            />
          ))}
      </div>
    );
  }
}

export default SectionList;
