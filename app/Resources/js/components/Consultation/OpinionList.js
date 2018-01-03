// @flow
import React, { PropTypes } from 'react';
import { QueryRenderer, graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, injectIntl } from 'react-intl';
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
    intl: PropTypes.object.isRequired,
  },

  render() {
    const { section, consultation, intl } = this.props;
    return (
      <div id={`opinions--test17${section.slug}`} className="anchor-offset block  block--bordered">
        <div className={`opinion  opinion--${section.color} opinion--default`}>
          <div className="opinion__header  opinion__header--mobile-centered">
            <h2 className="pull-left  h4  opinion__header__title">
              <FormattedMessage
                id="global.opinionsCount"
                values={{ num: section.contributionsCount }}
              />
            </h2>
            <div className="pull-right  opinion__header__filter">
              {section.contributionsCount > 1 && (
                <select
                  className="form-control"
                  style={{ marginRight: section.contribuable ? 15 : 0 }}
                  aria-label={intl.formatMessage({ id: 'global.filter' })}
                  onChange={(event: SyntheticInputEvent<>) => {
                    window.location.href = `${section.url}/sort/${event.target.value}`;
                  }}>
                  <option value="positions">
                    <FormattedMessage id="opinion.sort.positions" />
                  </option>
                  <option value="random">
                    <FormattedMessage id="opinion.sort.random" />
                  </option>
                  <option value="last">
                    <FormattedMessage id="opinion.sort.last" />
                  </option>
                  <option value="old">
                    <FormattedMessage id="opinion.sort.old" />
                  </option>
                  <option value="favorable">
                    <FormattedMessage id="opinion.sort.favorable" />
                  </option>
                  <option value="votes">
                    <FormattedMessage id="opinion.sort.votes" />
                  </option>
                  <option value="comments">
                    <FormattedMessage id="opinion.sort.comments" />
                  </option>
                </select>
              )}
              {section.contribuable && (
                <NewOpinionButton
                  opinionType={section}
                  stepId={consultation.id}
                  projectId={consultation.projectId}
                  disabled={!consultation.open}
                  label={intl.formatMessage({ id: 'opinion.create.button' })}
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
                limit: consultation.opinionCountShownBySection,
              }}
              render={renderOpinionList}
            />
          </ul>
        )}
        {section.contributionsCount > consultation.opinionCountShownBySection && (
          <div className="opinion  opinion__footer  box">
            <a href={section.url} className="text-center" style={{ display: 'block' }}>
              <FormattedMessage id="opinion.show.all" />
            </a>
          </div>
        )}
      </div>
    );
  },
});

const container = injectIntl(OpinionList);

export default createFragmentContainer(container, {
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
