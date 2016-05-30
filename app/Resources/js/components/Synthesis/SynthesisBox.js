import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import ViewBox from './ViewBox';
import EditBox from './EditBox';
import FlashMessages from '../Utils/FlashMessages';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisStore from '../../stores/SynthesisStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import SynthesisActions from '../../actions/SynthesisActions';

const SynthesisBox = React.createClass({
  propTypes: {
    mode: PropTypes.string.isRequired,
    synthesis_id: PropTypes.string.isRequired,
    children: PropTypes.object,
    sideMenu: PropTypes.bool,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      sideMenu: false,
    };
  },

  getInitialState() {
    return {
      synthesis: null,
      messages: {
        errors: [],
        success: [],
      },
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onElementsChange);
    SynthesisStore.addChangeListener(this.onSynthesisChange);
  },

  componentDidMount() {
    SynthesisActions.load(this.props.synthesis_id);
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onElementsChange);
    SynthesisStore.removeChangeListener(this.onSynthesisChange);
  },

  onElementsChange() {
    this.setState({
      messages: SynthesisElementStore.messages,
    });
  },

  onSynthesisChange() {
    this.setState({
      synthesis: SynthesisStore.synthesis,
    });
  },

  dismissMessage(message, type) {
    SynthesisElementActions.dismissMessage(message, type);
  },

  renderBoxMode() {
    if (this.state.synthesis !== null) {
      if (this.props.mode === 'view') {
        return (
          <ViewBox synthesis={this.state.synthesis} />
        );
      }
      if (this.props.mode === 'edit') {
        return (
          <EditBox synthesis={this.state.synthesis} children={this.props.children} sideMenu={this.props.sideMenu} />
        );
      }
      return (
        <p>{this.getIntlMessage('synthesis.common.errors.incorrect_mode')}</p>
      );
    }
  },

  render() {
    return (
      <div className="synthesis__box" >
        <FlashMessages
          errors={this.state.messages.errors}
          success={this.state.messages.success}
          onDismissMessage={this.dismissMessage}
        />
        { this.renderBoxMode() }
      </div>
    );
  },

});

export default SynthesisBox;
