// @flow
import * as React from 'react';
import Section from './Section';

type Props = {|
  // We have a recursive type…
  +section: {|
    __id: string,
    sections: $ReadOnlyArray<{|
      __id: string,
      $fragmentRefs: any,
      sections: $ReadOnlyArray<{||}>,
    |}>,
    $fragmentRefs: any,
  |},
  +consultation: {||},
  +level: number,
  +hideEmptySection: boolean,
|};

export class SectionList extends React.Component<Props> {
  static defaultProps = {
    hideEmptySection: false,
  };

  render() {
    const { consultation, section, level, hideEmptySection } = this.props;

    return (
      <div className="section-list_container" id={section.__id}>
        {/* $FlowFixMe $refType */}
        <Section
          consultation={consultation}
          section={section}
          level={level}
          hideEmptySection={hideEmptySection}
        />
        {section.sections &&
          section.sections.map((subSelection, index) => (
            // $FlowFixMe $refType
            <SectionList
              key={index}
              consultation={consultation}
              section={subSelection}
              level={level + 1}
            />
          ))}
      </div>
    );
  }
}

export default SectionList;
