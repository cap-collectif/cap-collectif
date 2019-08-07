// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import OpinionList from './OpinionList';
import type { Section_section } from '~relay/Section_section.graphql';
import type { Section_consultation } from '~relay/Section_consultation.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';

type Props = {|
  +section: Section_section,
  +consultation: Section_consultation,
  +level: number,
  +enablePagination: boolean,
|};

export class Section extends React.Component<Props> {
  static defaultProps = {
    enablePagination: false,
  };

  render() {
    const { enablePagination, consultation, section, level } = this.props;
    const {
      opinions,
      title,
      subtitle,
      slug,
      description,
      contributionsCount,
      contribuable,
    } = section;

    if (opinions.totalCount === 0) {
      return null;
    }

    return (
      <div id={`opinion-type--${slug}`} className="anchor-offset text-center">
        <div className={`opinion-type__title level--${level}`}>
          {title}
          <br />
          {subtitle && <span className="small excerpt">{subtitle}</span>}
        </div>
        {description && <WYSIWYGRender className="opinion-type__description" value={description} />}
        {(contributionsCount > 0 || contribuable) && (
          <div className="mt-15">
            {/* $FlowFixMe https://github.com/cap-collectif/platform/issues/4973 */}
            <OpinionList
              enablePagination={enablePagination}
              consultation={consultation}
              section={section}
            />
          </div>
        )}
      </div>
    );
  }
}

export default createFragmentContainer(Section, {
  section: graphql`
    fragment Section_section on Section {
      title
      slug
      subtitle
      description
      contribuable
      contributionsCount
      opinions {
        totalCount
      }
      ...OpinionList_section
    }
  `,
  consultation: graphql`
    fragment Section_consultation on Consultation
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      ...OpinionList_consultation @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
