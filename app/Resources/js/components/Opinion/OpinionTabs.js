import {COMMENT_SYSTEM_SIMPLE, COMMENT_SYSTEM_BOTH} from '../../constants/ArgumentConstants';

import OpinionArgumentsBox from './OpinionArgumentsBox';
import OpinionVersionsBox from './OpinionVersionsBox';
import OpinionSourcesBox from './OpinionSourcesBox';

const TabbedArea = ReactBootstrap.TabbedArea;
const TabPane = ReactBootstrap.TabPane;
const FormattedMessage = ReactIntl.FormattedMessage;

const OpinionTabs = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    isReportingEnabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      key: this.getDefaultKey(),
    };
  },

  componentDidMount() {
    const scrollToAnchor = () => {
      const hash = window.location.hash;
      if (hash) {
        let key = null;
        if (hash.indexOf('arg') != -1) {
          key = 'arguments';
        }
        if (hash.indexOf('version') != -1) {
          key = 'versions';
        }
        if (hash.indexOf('source') != -1) {
          key = 'sources';
        }
        this.setState({key: key}, () => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView(false);
          }
        });
      } else {
       window.scrollTo(0, 0);
      }
    };
    scrollToAnchor();
    window.onhashchange = scrollToAnchor;
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

  renderArgumentsContent() {
    return <OpinionArgumentsBox {...this.props} />;
  },

  renderVersionsContent() {
    return <OpinionVersionsBox isReportingEnabled={this.props.isReportingEnabled} opinionId={this.props.opinion.id} opinionBody={this.props.opinion.body} />;
  },

  renderSourcesContent() {
    return <OpinionSourcesBox {...this.props} />;
  },

  handleSelect(key) {
    this.setState({key});
  },

  render() {
    const opinion = this.props.opinion;
    let tabNumber = this.isSourceable() ? 1 : 0;
    tabNumber += this.isCommentable() ? 1 : 0;
    tabNumber += this.isVersionable() ? 1 : 0;

    if (tabNumber > 1) {
      return (
        <TabbedArea activeKey={this.state.key} onSelect={this.handleSelect} animation={false}>
          { this.isVersionable()
            ? <TabPane id="opinion__versions" className="opinion-tabs" eventKey={'versions'} tab={
                <FormattedMessage message={this.getIntlMessage('global.versions')} num={opinion.versions_count} />
              }>
                {this.renderVersionsContent()}
              </TabPane>
            : null
          }
          { this.isCommentable()
            ? <TabPane id="opinion__arguments" className="opinion-tabs" eventKey={'arguments'} tab={
                <FormattedMessage message={this.getArgumentsTrad()} num={this.props.opinion.arguments_count} />
              }>
                {this.renderArgumentsContent()}
              </TabPane>
            : null
          }
          { this.isSourceable()
            ? <TabPane id="opinion__sources" className="opinion-tabs" eventKey={'sources'} tab={
                <FormattedMessage message={this.getIntlMessage('global.sources')} num={opinion.sources_count} />
              }>
                {this.renderSourcesContent()}
              </TabPane>
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

    return null;
  },

  getDefaultKey() {
    return this.isVersionable() ? 'versions':
      this.isCommentable() ? 'arguments' :
      this.isSourceable() ? 'sources' : null;
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

});

export default OpinionTabs;
