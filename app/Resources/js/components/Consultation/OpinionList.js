// @flow
import React from 'react';
import { QueryRenderer, graphql, createFragmentContainer, type ReadyState } from 'react-relay';
import { FormattedMessage, injectIntl, type IntlShape } from 'react-intl';
import { ListGroupItem } from 'react-bootstrap';
import OpinionListPaginated from './OpinionListPaginated';
import NewOpinionButton from '../Opinion/NewOpinionButton';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { SectionOrderBy, OpinionList_section } from '~relay/OpinionList_section.graphql';
import type { OpinionList_consultation } from '~relay/OpinionList_consultation.graphql';
import type {
  OpinionListQueryResponse,
  OpinionListQueryVariables,
  OpinionOrder,
} from '~relay/OpinionListQuery.graphql';
import ListGroup from '../Ui/List/ListGroup';
import Card from '../Ui/Card/Card';
import colors from '../../utils/colors';

type Props = {|
  +section: OpinionList_section,
  +consultation: OpinionList_consultation,
  +intl: IntlShape,
  +enablePagination: boolean,
|};

type State = {|
  +sort: SectionOrderBy,
|};

const INITIAL_PAGINATION_COUNT = 5;
const INITIAL_PREVIEW_COUNT = 10;

export class OpinionList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sort: props.section.defaultOrderBy || 'positions',
    };
  }

  sort = (event: SyntheticInputEvent<HTMLInputElement>) => {
    // We need to cast to enum value
    this.setState({ sort: ((event.target.value: any): SectionOrderBy) });
  };

  getOrderBy = (): OpinionOrder => {
    const { sort } = this.state;
    let orderBy = { field: 'POSITIONS', direction: 'ASC' };
    switch (sort) {
      case 'positions':
        orderBy = { field: 'POSITIONS', direction: 'ASC' };
        break;
      case 'random':
        // $FlowFixMe looks like a bug with "RANDOM"
        orderBy = { field: 'RANDOM', direction: 'ASC' };
        break;
      case 'last':
        orderBy = { field: 'PUBLISHED_AT', direction: 'DESC' };
        break;
      case 'old':
        orderBy = { field: 'PUBLISHED_AT', direction: 'ASC' };
        break;
      case 'favorable':
        orderBy = { field: 'VOTES_OK', direction: 'DESC' };
        break;
      case 'votes':
        orderBy = { field: 'VOTES', direction: 'DESC' };
        break;
      case 'comments':
        orderBy = { field: 'COMMENTS', direction: 'DESC' };
        break;
      default:
        break;
    }

    return orderBy;
  };

  render() {
    const { enablePagination, section, consultation, intl } = this.props;
    return (
      <Card id={`opinions--test17${section.slug}`} className="anchor-offset" style={{ border: 0 }}>
        <Card.Header
          // $FlowFixMe color type from GraphQL
          bgColor={section.color}
          style={{
            border: `1px solid ${colors.borderColor}`,
            borderBottom: section.contributionsCount > 0 ? 0 : undefined,
          }}>
          <div className="opinion d-flex align-items-center justify-content-between">
            <span className="excerpt_dark">
              <FormattedMessage
                id="global.opinionsCount"
                values={{ num: section.contributionsCount }}
              />
            </span>
            {section.contributionsCount > 1 && (
              <form className="form-inline">
                <select
                  defaultValue={section.defaultOrderBy}
                  className="form-control"
                  aria-label={intl.formatMessage({ id: 'global.filter' })}
                  onChange={this.sort}
                  onBlur={this.sort}>
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
              </form>
            )}
            {section.contribuable && (
              <NewOpinionButton
                className="m-0"
                section={section}
                consultation={consultation}
                label={intl.formatMessage({ id: 'opinion.create.button' })}
              />
            )}
          </div>
        </Card.Header>
        {section.contributionsCount > 0 ? (
          <ListGroup className="m-0">
            <QueryRenderer
              environment={environment}
              query={graphql`
                query OpinionListQuery(
                  $sectionId: ID!
                  $count: Int!
                  $cursor: String
                  $orderBy: OpinionOrder!
                ) {
                  section: node(id: $sectionId) {
                    id
                    ...OpinionListPaginated_section
                      @arguments(count: $count, cursor: $cursor, orderBy: $orderBy)
                  }
                }
              `}
              variables={
                ({
                  sectionId: section.id,
                  orderBy: this.getOrderBy(),
                  cursor: null,
                  count: enablePagination
                    ? INITIAL_PAGINATION_COUNT
                    : consultation.opinionCountShownBySection ?? INITIAL_PREVIEW_COUNT,
                }: OpinionListQueryVariables)
              }
              render={({
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
                  if (!props.section) {
                    return graphqlError;
                  }
                  return (
                    // $FlowFixMe $refType
                    <OpinionListPaginated
                      enablePagination={enablePagination}
                      section={props.section}
                    />
                  );
                }
                return <Loader />;
              }}
            />
            {!enablePagination &&
            section.contributionsCount &&
            consultation.opinionCountShownBySection &&
            section.contributionsCount > consultation.opinionCountShownBySection ? (
              <ListGroupItem className="text-center">
                <a href={section.url} className="d-block bg-white">
                  <FormattedMessage id="opinion.show.all" />
                </a>
              </ListGroupItem>
            ) : null}
          </ListGroup>
        ) : null}
      </Card>
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
