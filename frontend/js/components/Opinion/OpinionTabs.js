// @flow
import React from 'react';
import { connect } from 'react-redux';
import { createFragmentContainer, graphql } from 'react-relay';
import { Nav, NavItem, Tab } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { COMMENT_SYSTEM_BOTH, COMMENT_SYSTEM_SIMPLE } from '../../constants/ArgumentConstants';
import ArgumentsBox from '../Argument/ArgumentsBox';
import OpinionVersionsBox from '../OpinionVersion/OpinionVersionsBox';
import OpinionSourceBox from './Source/OpinionSourceBox';
import type { State } from '../../types';
import { scrollToAnchor } from '../../services/ScrollToAnchor';
import type { OpinionTabs_opinion } from '~relay/OpinionTabs_opinion.graphql';
import OpinionFollowersBox from './OpinionFollowersBox';
import OpinionVersionFollowersBox from './OpinionVersionFollowersBox';

type RelayProps = {|
  opinion: OpinionTabs_opinion,
|};
type Props = {|
  ...RelayProps,
  isAuthenticated: boolean,
|};

class OpinionTabs extends React.Component<Props> {
  componentDidMount() {
    setTimeout(scrollToAnchor, 20); // We use setTimeout to interact with DOM in componentDidMount (see React documentation)
  }

  getHashKey = (hash: string) => {
    let key = null;
    if (hash.indexOf('arg') !== -1) {
      key = 'arguments';
    }
    if (hash.indexOf('version') !== -1) {
      key = 'versions';
    }
    if (hash.indexOf('source') !== -1) {
      key = 'sources';
    }
    if (hash.indexOf('votesevolution') !== -1) {
      key = 'votesevolution';
    }
    if (hash.indexOf('followers') !== -1) {
      key = 'followers';
    }
    return key;
  };

  getCommentSystem = () => {
    const { opinion } = this.props;
    return opinion.section && opinion.section.commentSystem;
  };

  getArgumentsTrad = () =>
    this.getCommentSystem() === COMMENT_SYSTEM_BOTH
      ? 'global.arguments'
      : 'global.simple_arguments';

  getDefaultKey = () => {
    const { hash } = window.location;
    if (hash) {
      return this.getHashKey(hash);
    }

    return this.isCommentable()
      ? 'arguments'
      : this.isVersionable()
      ? 'versions'
      : this.isSourceable()
      ? 'sources'
      : null;
  };

  isSourceable = () => {
    const { opinion } = this.props;
    return opinion.section && opinion.section.sourceable;
  };

  isFollowable = () => {
    const { opinion } = this.props;
    return opinion.project && opinion.project.opinionCanBeFollowed;
  };

  isCommentable = () =>
    this.getCommentSystem() === COMMENT_SYSTEM_SIMPLE ||
    this.getCommentSystem() === COMMENT_SYSTEM_BOTH;

  isVersionable = () => {
    const { opinion } = this.props;
    return opinion.__typename === 'Opinion' && opinion.section && opinion.section.versionable;
  };

  renderFollowerBox = opinion =>
    opinion.__typename === 'Opinion' ? (
      <OpinionFollowersBox opinion={opinion} pageAdmin={false} />
    ) : opinion.__typename === 'Version' ? (
      <OpinionVersionFollowersBox version={opinion} />
    ) : null;

  render() {
    const { opinion, isAuthenticated } = this.props;

    if (
      this.isSourceable() + this.isCommentable() + this.isVersionable() + this.isFollowable() >
      1
    ) {
      // at least two tabs

      const marginTop = { marginTop: '20px' };

      return (
        <Tab.Container id="opinion-page-tabs" defaultActiveKey={this.getDefaultKey()}>
          <div>
            <Nav bsStyle="tabs">
              {this.isCommentable() && (
                <NavItem className="opinion-tabs" eventKey="arguments">
                  <FormattedMessage
                    id={this.getArgumentsTrad()}
                    values={{ num: opinion.allArguments ? opinion.allArguments.totalCount : 0 }}
                  />
                </NavItem>
              )}
              {this.isVersionable() && (
                <NavItem eventKey="versions" className="opinion-tabs">
                  <FormattedMessage
                    id="global.versions"
                    values={{ num: opinion.allVersions ? opinion.allVersions.totalCount : 0 }}
                  />
                </NavItem>
              )}
              {this.isSourceable() && (
                <NavItem className="opinion-tabs" eventKey="sources">
                  <FormattedMessage
                    id="global.sources"
                    values={{ num: opinion.allSources ? opinion.allSources.totalCount : 0 }}
                  />
                </NavItem>
              )}
              {this.isFollowable() && (
                <NavItem className="opinion-tabs" eventKey="followers">
                  <FormattedMessage
                    id="proposal.follower.count"
                    values={{ num: opinion.allFollowers ? opinion.allFollowers.totalCount : 0 }}
                  />
                </NavItem>
              )}
              {/* {this.hasStatistics() && (
                <NavItem className="opinion-tabs" eventKey="votesevolution">
                  <FormattedMessage id="vote.evolution.tab" />
                </NavItem>
              )} */}
            </Nav>
            <Tab.Content animation={false}>
              {this.isCommentable() && (
                <Tab.Pane eventKey="arguments" style={marginTop}>
                  <ArgumentsBox opinion={opinion} />
                </Tab.Pane>
              )}
              {this.isVersionable() && (
                <Tab.Pane eventKey="versions" style={marginTop}>
                  <OpinionVersionsBox opinion={opinion} isAuthenticated={isAuthenticated} />
                </Tab.Pane>
              )}
              {this.isSourceable() && (
                <Tab.Pane eventKey="sources" style={marginTop}>
                  <OpinionSourceBox isAuthenticated={isAuthenticated} sourceable={opinion} />
                </Tab.Pane>
              )}
              {this.isFollowable() && (
                <Tab.Pane eventKey="followers" style={marginTop}>
                  {this.renderFollowerBox(opinion)}
                </Tab.Pane>
              )}
            </Tab.Content>
          </div>
        </Tab.Container>
      );
    }

    if (this.isCommentable()) {
      return <ArgumentsBox opinion={opinion} />;
    }
    if (this.isSourceable()) {
      return <OpinionSourceBox isAuthenticated={isAuthenticated} sourceable={opinion} />;
    }
    if (this.isVersionable()) {
      return <OpinionVersionsBox opinion={opinion} isAuthenticated={isAuthenticated} />;
    }
    if (this.isFollowable()) {
      return this.renderFollowerBox(opinion);
    }

    return null;
  }
}

const mapStateToProps = (state: State) => ({
  isAuthenticated: !!state.user.user,
});

const container = connect(mapStateToProps)(OpinionTabs);

export default createFragmentContainer(container, {
  opinion: graphql`
    fragment OpinionTabs_opinion on OpinionOrVersion
      @argumentDefinitions(isAuthenticated: { type: "Boolean!" }) {
      __typename
      ... on Opinion {
        __typename
        id
        allVersions: versions(first: 0) {
          totalCount
        }
        allArguments: arguments(first: 0) {
          totalCount
        }
        allSources: sources(first: 0) {
          totalCount
        }
        section {
          versionable
          sourceable
          commentSystem
        }
        project {
          opinionCanBeFollowed
        }
        allFollowers: followers(first: 0) {
          totalCount
        }
        ...OpinionFollowersBox_opinion
        ...OpinionVersionsBox_opinion @arguments(isAuthenticated: $isAuthenticated)
      }
      ... on Version {
        __typename
        id
        allArguments: arguments(first: 0) {
          totalCount
        }
        allSources: sources(first: 0) {
          totalCount
        }
        section {
          versionable
          sourceable
          commentSystem
        }
        project {
          opinionCanBeFollowed
        }
        allFollowers: followers(first: 0) {
          totalCount
        }
        ...OpinionVersionFollowersBox_version
      }
      ...OpinionSourceBox_sourceable @arguments(isAuthenticated: $isAuthenticated)
      ...ArgumentsBox_opinion @arguments(isAuthenticated: $isAuthenticated)
    }
  `,
});
