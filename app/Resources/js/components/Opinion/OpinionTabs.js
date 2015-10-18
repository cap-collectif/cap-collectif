import {COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH} from '../../constants/ArgumentConstants';

import OpinionArgumentsBox from './OpinionArgumentsBox';
import OpinionVersionsBox from './OpinionVersionsBox';
import OpinionSourcesBox from './OpinionSourcesBox';
import VoteLinechart from '../Utils/VoteLinechart';

const TabbedArea = ReactBootstrap.TabbedArea;
const Tab = ReactBootstrap.Tab;
const FormattedMessage = ReactIntl.FormattedMessage;

const OpinionTabs = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    isReportingEnabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  componentDidMount() {
    const scrollToAnchor = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView(false);
        }
      }
    };
    setTimeout(scrollToAnchor, 20); // We use setTimeout to interact with DOM in componentDidMount (see React documentation)
  },

  getHashKey(hash) {
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
    if (hash.indexOf('evolution') !== -1) {
      key = 'evolution';
    }
    return key;
  },

  getCommentSystem() {
    return this.props.opinion.parent ? this.props.opinion.parent.type.commentSystem : this.props.opinion.type.commentSystem;
  },

  getArgumentsTrad() {
    if (this.getCommentSystem() === COMMENT_SYSTEM_BOTH) {
      return this.getIntlMessage('global.arguments');
    }
    return this.getIntlMessage('global.simple_arguments');
  },

  getDefaultKey() {
    const hash = window.location.hash;
    if (hash) {
      return this.getHashKey(hash);
    }

    return this.isVersionable() ? 'versions' :
      this.isCommentable() ? 'arguments' :
      this.isSourceable() ? 'sources' : null
    ;
  },

  renderArgumentsContent() {
    return <OpinionArgumentsBox {...this.props} />;
  },

  renderVersionsContent() {
    return <OpinionVersionsBox isReportingEnabled={this.props.isReportingEnabled} isContribuable={this.isContribuable()} opinionId={this.props.opinion.id} opinionBody={this.props.opinion.body} />;
  },

  renderSourcesContent() {
    return <OpinionSourcesBox {...this.props} />;
  },

  renderStatisticsContent() {
    const opinion = this.props.opinion;

    return (
      <VoteLinechart top={20} height={300} width={847} history={opinion.history.votes} />
    );
  },

  render() {
    if (this.isSourceable() + this.isCommentable() + this.isVersionable() + this.hasStatistics() > 1) {
      // at least two tabs
      const opinion = this.props.opinion;

      return (
        <TabbedArea defaultActiveKey={this.getDefaultKey()} animation={false}>
          { this.isVersionable()
            ? <Tab id="opinion__versions" className="opinion-tabs" eventKey={'versions'} title={
                <FormattedMessage message={this.getIntlMessage('global.versions')} num={opinion.versions_count} />
              }>
                {this.renderVersionsContent()}
              </Tab>
            : null
          }
          { this.isCommentable()
            ? <Tab id="opinion__arguments" className="opinion-tabs" eventKey={'arguments'} title={
                <FormattedMessage message={this.getArgumentsTrad()} num={opinion.arguments_count} />
              }>
                {this.renderArgumentsContent()}
              </Tab>
            : null
          }
          { this.isSourceable()
            ? <Tab id="opinion__sources" className="opinion-tabs" eventKey={'sources'} title={
                <FormattedMessage message={this.getIntlMessage('global.sources')} num={opinion.sources_count} />
              }>
                {this.renderSourcesContent()}
              </Tab>
            : null
          }
          { this.hasStatistics()
            ? <Tab id="opinion__evolution" className="opinion-tabs" eventKey={'evolution'} title={
                <FormattedMessage message={this.getIntlMessage('global.votes_evolution')} />
              }>
                {this.renderStatisticsContent()}
              </Tab>
            : null
          }
        </TabbedArea>
      );
    }

    if (this.isSourceable()) {
      return this.renderSourcesContent();
    }
    if (this.isVersionable()) {
      return this.renderVersionsContent();
    }
    if (this.isCommentable()) {
      return this.renderArgumentsContent();
    }
    if (this.hasStatistics()) {
      return this.renderStatisticsContent();
    }

    return null;
  },

  isSourceable() {
    const type = this.props.opinion.parent ? this.props.opinion.parent.type : this.props.opinion.type;
    if (type !== 'undefined') {
      return type.sourceable;
    }
    return false;
  },

  isCommentable() {
    if (this.getCommentSystem() === COMMENT_SYSTEM_SIMPLE || this.getCommentSystem() === COMMENT_SYSTEM_BOTH) {
      return true;
    }
    return false;
  },

  isVersionable() {
    const opinion = this.props.opinion;
    return !this.isVersion() && opinion.type !== 'undefined' && opinion.type.versionable;
  },

  isVersion() {
    return !!this.props.opinion.parent;
  },

  hasStatistics() {
    return !!this.props.opinion.history;
  },

  isContribuable() {
    return this.props.opinion.isContribuable;
  },

});

export default OpinionTabs;
