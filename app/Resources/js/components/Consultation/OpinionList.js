// @flow
import React, { PropTypes } from 'react';
import { QueryRenderer, graphql, createFragmentContainer } from 'react-relay';
import Opinion from './Opinion';
import NewOpinionButton from '../Opinion/NewOpinionButton';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Utils/Loader';

const renderOpinionList = ({
  error,
  props,
}: {
  error: ?Error,
  props: ?{ contributionsBySection: Array<Object> },
}) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    return (
      <div>
        {// eslint-disable-next-line react/prop-types
        props.contributionsBySection.map((opinion, index) => (
          <Opinion key={index} opinion={opinion} />
        ))}
      </div>
    );
  }
  return <Loader />;
};

export const OpinionList = React.createClass({
  propTypes: {
    section: PropTypes.object.isRequired,
    consultation: PropTypes.object.isRequired,
  },

  render() {
    const { section, consultation } = this.props;
    return (
      <div id={`opinions--test17${section.slug}`} className="anchor-offset block  block--bordered">
        <div className={`opinion  opinion--${section.color} opinion--default`}>
          <div className="opinion__header  opinion__header--mobile-centered">
            <h2 className="pull-left  h4  opinion__header__title">
              {section.contributionsCount} proposition{section.contributionsCount > 1 && 's'}
            </h2>
            <div className="pull-right  opinion__header__filter">
              {section.contributionsCount > 1 && (
                <select
                  className="form-control"
                  style={{ marginRight: section.contribuable ? 15 : 0 }}
                  onChange={(event: SyntheticInputEvent<>) => {
                    window.location.href = `${section.url}/${event.target.value}`;
                  }}>
                  <option value="positions">Tri ordonné puis aléatoire</option>
                  <option value="random">Tri aléatoire</option>
                  <option value="last">Les plus récents</option>
                  <option value="old">Les plus anciens</option>
                  <option value="favorable">Les plus favorables</option>
                  <option value="votes">Les plus votés</option>
                  <option value="comments">Les plus commentés</option>
                </select>
              )}
              {section.contribuable && (
                <NewOpinionButton
                  opinionType={section}
                  stepId={consultation.id}
                  projectId={consultation.projectId}
                  disabled={!consultation.open}
                  label={'Proposer'}
                />
              )}
            </div>
          </div>
        </div>
        {section.contributionsCount > 0 && (
          <ul className="media-list  opinion__list">
            <QueryRenderer
              environment={environment}
              query={graphql`
                query OpinionListQuery($sectionId: ID!, $limit: Int!) {
                  contributionsBySection(sectionId: $sectionId, limit: $limit) {
                    ...Opinion_opinion
                  }
                }
              `}
              variables={{
                sectionId: section.id,
                limit: consultation.opinion_count_shown_by_section,
              }}
              render={renderOpinionList}
            />
          </ul>
        )}
        {section.contributionsCount > consultation.opinion_count_shown_by_section && (
          <div className="opinion  opinion__footer  box">
            <a href={section.url} className="text-center" style={{ display: 'block' }}>
              Voir toutes les propositions
            </a>
          </div>
        )}
      </div>
    );
  },
});

export default createFragmentContainer(OpinionList, {
  section: graphql`
    fragment OpinionList_section on Section {
      id
      url
      slug
      color
      contribuable
      contributionsCount
      appendixTypes {
        id
        title
        position
      }
    }
  `,
});
