// @flow
import * as React from 'react';
import Section from './Section';

type Props = {|
  // We have a recursive type…
  +section: {|
    +sections: ?$ReadOnlyArray<?{|
      +sections: ?$ReadOnlyArray<?{|
        +sections: ?$ReadOnlyArray<?{|
          +sections: ?$ReadOnlyArray<?{|
            +sections: ?$ReadOnlyArray<?{|
              +$fragmentRefs: any,
            |}>,
            +$fragmentRefs: any,
          |}>,
          +$fragmentRefs: any,
        |}>,
        +$fragmentRefs: any,
      |}>,
      +$fragmentRefs: any,
    |}>,
    +$fragmentRefs: any,
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
      <div className="section-list_container">
        <Section
          /* $FlowFixMe $refType */
          consultation={consultation}
          section={section}
          level={level}
          hideEmptySection={hideEmptySection}
        />
        {section.sections &&
          section.sections.map((subSelection, index) => (
            <SectionList
              key={index}
              consultation={consultation} // $FlowFixMe $refType
              section={subSelection}
              level={level + 1}
            />
          ))}
      </div>
    );
  }
}

export default SectionList;
