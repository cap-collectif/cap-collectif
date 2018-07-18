// @flow
import React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { Tab, Nav, NavItem } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH } from '../../constants/ArgumentConstants';
import ArgumentsBox from '../Argument/ArgumentsBox';
import OpinionVersionsBox from './OpinionVersionsBox';
import OpinionSourceBox from './Source/OpinionSourceBox';
// import VoteLinechart from '../Utils/VoteLinechart';
import { scrollToAnchor } from '../../services/ScrollToAnchor';
import type { OpinionTabs_opinion } from './__generated__/OpinionTabs_opinion.graphql';

type Props = {
  opinion: OpinionTabs_opinion,
};

type State = {
  sourcesCount: number,
  argumentsCount: number,
};

class OpinionTabs extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { opinion } = props;

    this.state = {
      sourcesCount: opinion.sourcesCount,
      argumentsCount: opinion.argumentsCount,
    };
  }

  componentWillMount() {
    OpinionSourceStore.addChangeListener(this.onSourceChange);
  }

  componentDidMount() {
    setTimeout(scrollToAnchor, 20); // We use setTimeout to interact with DOM in componentDidMount (see React documentation)
  }

  onSourceChange = () => {
    this.setState({
      sourcesCount: OpinionSourceStore.count,
    });
  };

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
    return key;
  };

  getCommentSystem = () => {
    const opinion = this.props.opinion;
    return opinion.section && opinion.section.commentSystem;
  };

  getArgumentsTrad = () => {
    return this.getCommentSystem() === COMMENT_SYSTEM_BOTH
      ? 'global.arguments'
      : 'global.simple_arguments';
  };

  getDefaultKey = () => {
    const hash = window.location.hash;
    if (hash) {
      return this.getHashKey(hash);
    }

    return this.isVersionable()
      ? 'versions'
      : this.isCommentable()
        ? 'arguments'
        : this.isSourceable()
          ? 'sources'
          : null;
  };

  isSourceable = () => {
    return this.props.opinion.section && this.props.opinion.section.sourceable;
  };

  isCommentable = () => {
    return (
      this.getCommentSystem() === COMMENT_SYSTEM_SIMPLE ||
      this.getCommentSystem() === COMMENT_SYSTEM_BOTH
    );
  };

  isVersionable = () => {
    const opinion = this.props.opinion;
    return opinion.__typename === 'Opinion' && opinion.section && opinion.section.versionable;
  };

  // hasStatistics = () => {
  //   const { opinion } = this.props;
  //   return !!opinion.history;
  // };

  render() {
    const { opinion } = this.props;
    const isAuthenticated = false;
    if (this.isSourceable() + this.isCommentable() + this.isVersionable() > 1) {
      // at least two tabs

      const marginTop = { marginTop: '20px' };

      return (
        <Tab.Container id="opinion-page-tabs" defaultActiveKey={this.getDefaultKey()}>
          <div>
            <Nav bsStyle="tabs">
              {this.isVersionable() && (
                <NavItem eventKey="versions" className="opinion-tabs">
                  <FormattedMessage
                    id="global.versions"
                    values={{ num: opinion.allVersions ? opinion.allVersions.totalCount : 0 }}
                  />
                </NavItem>
              )}
              {this.isCommentable() && (
                <NavItem className="opinion-tabs" eventKey="arguments">
                  <FormattedMessage
                    id={this.getArgumentsTrad()}
                    values={{ num: opinion.allArguments ? opinion.allArguments.totalCount : 0 }}
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
              {/* {this.hasStatistics() && (
                <NavItem className="opinion-tabs" eventKey="votesevolution">
                  <FormattedMessage id="vote.evolution.tab" />
                </NavItem>
              )} */}
            </Nav>
            <Tab.Content animation={false}>
              {this.isVersionable() && (
                <Tab.Pane eventKey="versions" style={marginTop}>
                  {/* $FlowFixMe */}
                  <OpinionVersionsBox opinion={opinion} isAuthenticated={isAuthenticated} />
                </Tab.Pane>
              )}
              {this.isCommentable() && (
                <Tab.Pane eventKey="arguments" style={marginTop}>
                  {/* $FlowFixMe */}
                  <ArgumentsBox opinion={opinion} />
                </Tab.Pane>
              )}
              {this.isSourceable() && (
                <Tab.Pane eventKey="sources" style={marginTop}>
                  {/* $FlowFixMe */}
                  <OpinionSourceBox isAuthenticated={isAuthenticated} sourceable={opinion} />
                </Tab.Pane>
              )}
              {/* {this.hasStatistics() && (
                <Tab.Pane eventKey="votesevolution" style={marginTop}>
                  <VoteLinechart
                    top={20}
                    height={300}
                    width={847}
                    history={opinion.history.votes}
                  />
                </Tab.Pane>
              )} */}
            </Tab.Content>
          </div>
        </Tab.Container>
      );
    }

    if (this.isSourceable()) {
      /* $FlowFixMe */
      return <OpinionSourceBox isAuthenticated={isAuthenticated} sourceable={opinion} />;
    }
    if (this.isVersionable()) {
      /* $FlowFixMe */
      return <OpinionVersionsBox opinion={opinion} isAuthenticated={isAuthenticated} />;
    }
    if (this.isCommentable()) {
      /* $FlowFixMe */
      return <ArgumentsBox opinion={opinion} />;
    }
    // if (this.hasStatistics()) {
    //   return <VoteLinechart top={20} height={300} width={847} history={opinion.history.votes} />;
    // }

    return null;
  }
}

export default createFragmentContainer(OpinionTabs, {
  opinion: graphql`
    fragment OpinionTabs_opinion on OpinionOrVersion {
      ... on Opinion {
        __typename
        id
        body
        contribuable
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
      }
      ... on Version {
        __typename
        id
        body
        contribuable
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
      }
      ...OpinionSourceBox_sourceable
      ...OpinionVersionsBox_opinion
      ...ArgumentsBox_opinion
    }
  `,
});
