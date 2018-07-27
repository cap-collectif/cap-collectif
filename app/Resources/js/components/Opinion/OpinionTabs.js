// @flow
import React from 'react';
import { Tab, Nav, NavItem } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH } from '../../constants/ArgumentConstants';
import ArgumentsBox from '../Argument/ArgumentsBox';
import OpinionVersionsBox from './OpinionVersionsBox';
import OpinionSourceBox from './Source/OpinionSourceBox';
import VoteLinechart from '../Utils/VoteLinechart';
import OpinionSourceStore from '../../stores/OpinionSourceStore';
import { scrollToAnchor } from '../../services/ScrollToAnchor';

type Props = {
  opinion: Object,
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
    return opinion.parent ? opinion.parent.type.commentSystem : opinion.type.commentSystem;
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

  getType = () => {
    const { opinion } = this.props;
    return opinion.parent ? opinion.parent.type : opinion.type;
  };

  isSourceable = () => {
    const type = this.getType();
    return type !== 'undefined' ? type.sourceable : false;
  };

  isCommentable = () => {
    return (
      this.getCommentSystem() === COMMENT_SYSTEM_SIMPLE ||
      this.getCommentSystem() === COMMENT_SYSTEM_BOTH
    );
  };

  isVersionable = () => {
    const opinion = this.props.opinion;
    return !this.isVersion() && opinion.type !== 'undefined' && opinion.type.versionable;
  };

  isVersion = () => {
    const { opinion } = this.props;
    return !!opinion.parent;
  };

  hasStatistics = () => {
    const { opinion } = this.props;
    return !!opinion.history;
  };

  isContribuable = () => {
    const { opinion } = this.props;
    return opinion.isContribuable;
  };

  renderVersionsContent = () => {
    const { opinion } = this.props;
    return (
      <OpinionVersionsBox
        isContribuable={this.isContribuable()}
        opinionId={opinion.id}
        opinionBody={opinion.body}
      />
    );
  };

  render() {
    const { opinion } = this.props;

    if (
      this.isSourceable() + this.isCommentable() + this.isVersionable() + this.hasStatistics() >
      1
    ) {
      // at least two tabs

      const marginTop = { marginTop: '20px' };

      return (
        <Tab.Container id="opinion-page-tabs" defaultActiveKey={this.getDefaultKey()}>
          <div>
            <Nav bsStyle="tabs">
              {this.isVersionable() && (
                <NavItem eventKey="versions" className="opinion-tabs">
                  <FormattedMessage id="global.versions" values={{ num: opinion.versionsCount }} />
                </NavItem>
              )}
              {this.isCommentable() && (
                <NavItem className="opinion-tabs" eventKey="arguments">
                  <FormattedMessage
                    id={this.getArgumentsTrad()}
                    values={{ num: this.state.argumentsCount }}
                  />
                </NavItem>
              )}
              {this.isSourceable() && (
                <NavItem className="opinion-tabs" eventKey="sources">
                  <FormattedMessage id="global.sources" values={{ num: this.state.sourcesCount }} />
                </NavItem>
              )}
              {this.hasStatistics() && (
                <NavItem className="opinion-tabs" eventKey="votesevolution">
                  <FormattedMessage id="vote.evolution.tab" />
                </NavItem>
              )}
            </Nav>
            <Tab.Content animation={false}>
              {this.isVersionable() && (
                <Tab.Pane eventKey="versions" style={marginTop}>
                  {this.renderVersionsContent()}
                </Tab.Pane>
              )}
              {this.isCommentable() && (
                <Tab.Pane eventKey="arguments" style={marginTop}>
                  <ArgumentsBox {...this.props} />
                </Tab.Pane>
              )}
              {this.isSourceable() && (
                <Tab.Pane eventKey="sources" style={marginTop}>
                  <OpinionSourceBox {...this.props} />
                </Tab.Pane>
              )}
              {this.hasStatistics() && (
                <Tab.Pane eventKey="votesevolution" style={marginTop}>
                  <VoteLinechart
                    top={20}
                    height={300}
                    width={847}
                    history={opinion.history.votes}
                  />
                </Tab.Pane>
              )}
            </Tab.Content>
          </div>
        </Tab.Container>
      );
    }

    if (this.isSourceable()) {
      return <OpinionSourceBox {...this.props} />;
    }
    if (this.isVersionable()) {
      return this.renderVersionsContent();
    }
    if (this.isCommentable()) {
      return <ArgumentsBox {...this.props} />;
    }
    if (this.hasStatistics()) {
      return <VoteLinechart top={20} height={300} width={847} history={opinion.history.votes} />;
    }

    return null;
  }
}

export default OpinionTabs;
