// @flow
import React from 'react';
import { QueryRenderer, graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage, injectIntl } from 'react-intl';
import {ListGroup, Panel} from "react-bootstrap";
import Opinion from './Opinion';
import NewOpinionButton from '../Opinion/NewOpinionButton';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/Loader';
import type { OpinionList_section } from './__generated__/OpinionList_section.graphql';

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
      <React.Fragment>
        {// eslint-disable-next-line react/prop-types
        props.contributionsBySection.map((opinion, index) => (
          <Opinion key={index} opinion={opinion} />
        ))}
      </React.Fragment>
    );
  }
  return <Loader />;
};

type Props = {
  section: OpinionList_section,
  consultation: Object,
  intl: Object,
};

export class OpinionList extends React.Component<Props> {
  render() {
    const { section, consultation, intl } = this.props;
    return (
      <div id={`opinions--test17${section.slug}`} className="anchor-offset">
        <Panel className={`opinion panel--${section.color} panel--default panel-custom`}>
          <Panel.Heading>
            <p>
              <FormattedMessage
                id="global.opinionsCount"
                values={{ num: section.contributionsCount }}
              />
            </p>
            <div className="panel-heading__actions">
              {section.contributionsCount > 1 && (
                <select
                  className="form-control"
                  aria-label={intl.formatMessage({ id: 'global.filter' })}
                  onChange={(event: SyntheticInputEvent<>) => {
                    if (section.url) {
                      window.location.href = `${section.url}/sort/${event.target.value}`;
                    }
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
          </Panel.Heading>
          {section.contributionsCount > 0 && (
            <ListGroup className="list-group-custom">
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
            </ListGroup>
          )}
        </Panel>

        {section.contributionsCount > consultation.opinionCountShownBySection && (
          <div className="opinion  opinion__footer  box">
            <a href={section.url} className="text-center" style={{ display: 'block' }}>
              <FormattedMessage id="opinion.show.all" />
            </a>
          </div>
        )}
      </div>
    );
  }
}

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
