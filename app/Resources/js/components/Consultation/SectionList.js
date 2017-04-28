// @flow
import React from 'react';
import { IntlMixin } from 'react-intl';
import Section from './Section';

const SectionList = React.createClass({
  propTypes: {
    section: React.PropTypes.object.isRequired,
    level: React.PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { section, level } = this.props;
    return (
      <div>
        <Section section={section} level={level} />
        {section.sections &&
          section.sections.map((subSelection, index) => (
            <SectionList key={index} section={subSelection} level={level + 1} />
          ))}
      </div>
    );
  },
});

export default SectionList;
