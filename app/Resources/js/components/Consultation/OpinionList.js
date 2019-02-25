// @flow
import React from 'react';
import { QueryRenderer, graphql, createFragmentContainer, type ReadyState } from 'react-relay';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ListGroup, Panel } from 'react-bootstrap';
import Opinion from './Opinion';
import NewOpinionButton from '../Opinion/NewOpinionButton';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { OpinionList_section } from './__generated__/OpinionList_section.graphql';
import type { OpinionList_consultation } from './__generated__/OpinionList_consultation.graphql';
import type {
  OpinionListQueryResponse,
  OpinionListQueryVariables,
} from './__generated__/OpinionListQuery.graphql';

const renderOpinionList = ({
  error,
  props,
}: {
  props: ?OpinionListQueryResponse,
} & ReadyState) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (!props.section || !props.section.opinions) {
      return graphqlError;
    }
    return (
      <React.Fragment>
        {props.section.opinions.map((opinion, index) => (
          // $FlowFixMe $refType
          <Opinion key={index} opinion={opinion} showUpdatedDate={false} />
        ))}
      </React.Fragment>
    );
  }
  return <Loader />;
};

type Props = {
  section: OpinionList_section,
  consultation: OpinionList_consultation,
  intl: IntlShape,
};

export class OpinionList extends React.Component<Props> {
  sort(section: Object, event: SyntheticInputEvent<>) {
    if (section.url) {
      window.location.href = `${section.url}/sort/${event.target.value}`;
    }
  }

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
                  defaultValue={section.defaultOrderBy}
                  className="form-control"
                  aria-label={intl.formatMessage({ id: 'global.filter' })}
                  onChange={(event: SyntheticInputEvent<>) => {
                    this.sort(section, event);
                  }}
                  onBlur={(event: SyntheticInputEvent<>) => {
                    this.sort(section, event);
                  }}>
                  <option value="positions">
                    {intl.formatMessage({ id: 'opinion.sort.positions' })}
                  </option>
                  <option value="random">
                    {intl.formatMessage({ id: 'opinion.sort.random' })}
                  </option>
                  <option value="last">{intl.formatMessage({ id: 'opinion.sort.last' })}</option>
                  <option value="old">{intl.formatMessage({ id: 'opinion.sort.old' })}</option>
                  <option value="favorable">
                    {intl.formatMessage({ id: 'opinion.sort.favorable' })}
                  </option>
                  <option value="votes">{intl.formatMessage({ id: 'opinion.sort.votes' })}</option>
                  <option value="comments">
                    {intl.formatMessage({ id: 'opinion.sort.comments' })}
                  </option>
                </select>
              )}
              {section.contribuable && (
                <NewOpinionButton
                  section={section}
                  consultation={consultation}
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
                    section: node(id: $sectionId) {
                      ... on Section {
                        opinions(limit: $limit) {
                          ...Opinion_opinion
                        }
                      }
                    }
                  }
                `}
                variables={
                  ({
                    sectionId: section.id,
                    limit: consultation.opinionCountShownBySection ?? 10,
                  }: OpinionListQueryVariables)
                }
                render={renderOpinionList}
              />
            </ListGroup>
          )}
          {section.contributionsCount &&
          consultation.opinionCountShownBySection &&
          section.contributionsCount > consultation.opinionCountShownBySection ? (
            <Panel.Footer className="bg-white">
              <a
                href={section.url}
                className="text-center"
                style={{ display: 'block', backgroundColor: '#fff' }}>
                <FormattedMessage id="opinion.show.all" />
              </a>
            </Panel.Footer>
          ) : null}
        </Panel>
      </div>
    );
  }
}

const container = injectIntl(OpinionList);

export default createFragmentContainer(container, {
  section: graphql`
    fragment OpinionList_section on Section {
      ...NewOpinionButton_section
      id
      url
      defaultOrderBy
      slug
      color
      contribuable
      contributionsCount
    }
  `,
  consultation: graphql`
    fragment OpinionList_consultation on Consultation
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      id
      opinionCountShownBySection
      ...NewOpinionButton_consultation @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
