import {COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH} from '../../constants/ArgumentConstants';

import OpinionArgumentsBox from './OpinionArgumentsBox';
import OpinionVersionsBox from './OpinionVersionsBox';
import OpinionSourcesBox from './OpinionSourcesBox';
import VoteLinechart from '../Utils/VoteLinechart';
import OpinionLinksBox from './Links/OpinionLinksBox';

const TabbedArea = ReactBootstrap.TabbedArea;
const Tab = ReactBootstrap.Tab;
const FormattedMessage = ReactIntl.FormattedMessage;

const OpinionTabs = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
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
    const opinion = this.props.opinion;
    return opinion.parent ? opinion.parent.type.commentSystem : opinion.type.commentSystem;
  },

  getArgumentsTrad() {
    return this.getCommentSystem() === COMMENT_SYSTEM_BOTH
      ? this.getIntlMessage('global.arguments')
      : this.getIntlMessage('global.simple_arguments')
    ;
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

  getType() {
    return this.props.opinion.parent ? this.props.opinion.parent.type : this.props.opinion.type;
  },

  isLinkable() {
    const type = this.getType();
    return type !== 'undefined' ? type.linkable : false;
  },

  isSourceable() {
    const type = this.getType();
    return type !== 'undefined' ? type.sourceable : false;
  },

  isCommentable() {
    return this.getCommentSystem() === COMMENT_SYSTEM_SIMPLE || this.getCommentSystem() === COMMENT_SYSTEM_BOTH;
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

  renderVersionsContent() {
    return (
      <OpinionVersionsBox
        isContribuable={this.isContribuable()}
        opinionId={this.props.opinion.id}
        opinionBody={this.props.opinion.body}
      />
    );
  },

  render() {
    const opinion = this.props.opinion;

    if (this.isSourceable() + this.isCommentable() + this.isVersionable() + this.hasStatistics() + this.isLinkable() > 1) {
      // at least two tabs

      return (
        <TabbedArea defaultActiveKey={this.getDefaultKey()} animation={false}>
          { this.isVersionable()
            ? <Tab
                id="opinion__versions"
                className="opinion-tabs"
                eventKey={'versions'}
                title={<FormattedMessage message={this.getIntlMessage('global.versions')} num={opinion.versions_count} />}
            >
              {this.renderVersionsContent()}
            </Tab>
            : null
          }
          { this.isCommentable()
            ? <Tab
                id="opinion__arguments"
                className="opinion-tabs"
                eventKey={'arguments'}
                title={<FormattedMessage message={this.getArgumentsTrad()} num={opinion.arguments_count} />}
            >
              <OpinionArgumentsBox {...this.props} />
            </Tab>
            : null
          }
          { this.isSourceable()
            ? <Tab
                id="opinion__sources"
                className="opinion-tabs"
                eventKey={'sources'}
                title={<FormattedMessage message={this.getIntlMessage('global.sources')} num={opinion.sources_count} />}
            >
              <OpinionSourcesBox {...this.props} />
            </Tab>
            : null
          }
          { this.hasStatistics()
            ? <Tab
                id="opinion__evolution"
                className="opinion-tabs"
                eventKey={'evolution'}
                title={<FormattedMessage message={this.getIntlMessage('global.votes_evolution')} />}
            >
              <VoteLinechart top={20} height={300} width={847} history={opinion.history.votes} />
            </Tab>
            : null
          }
          { this.isLinkable()
            ? <Tab
                id="opinion__links"
                className="opinion-tabs"
                eventKey={'links'}
                tab={<FormattedMessage message={this.getIntlMessage('global.links')} num={opinion.connections_count} />}
            >
              <OpinionLinksBox {...this.props} />
            </Tab>
            : null
          }
        </TabbedArea>
      );
    }

    if (this.isSourceable()) {
      return <OpinionSourcesBox {...this.props} />;
    }
    if (this.isVersionable()) {
      return this.renderVersionsContent();
    }
    if (this.isCommentable()) {
      return <OpinionArgumentsBox {...this.props} />;
    }
    if (this.hasStatistics()) {
      return <VoteLinechart top={20} height={300} width={847} history={opinion.history.votes} />;
    }

    if (this.isLinkable()) {
      return <OpinionLinksBox {...this.props} />;
    }

    return null;
  },

});

export default OpinionTabs;
