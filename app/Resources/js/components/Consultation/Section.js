// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { IntlMixin } from 'react-intl';
import OpinionList from './OpinionList';

export const Section = React.createClass({
  propTypes: {
    section: React.PropTypes.object.isRequired,
    level: React.PropTypes.number.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { section, level } = this.props;
    return (
      <p
        id={`opinion-type--${section.slug}`}
        className={`anchor-offset text-center opinion-type__title level--${level}`}>
        {section.title}
        <br />
        {section.subtitle &&
          <span className="small excerpt">{section.subtitle}</span>}
        {(section.contributionsCount > 0 || section.contribuable) &&
          <OpinionList section={section} />}
      </p>
    );
  },
});

export default createFragmentContainer(
  Section,
  graphql`
    fragment Section_section on Section {
      title
      slug
      subtitle
      contribuable
      contributionsCount
      ...OpinionList_section
    }
  `,
);
