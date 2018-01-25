import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
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
    const { synthesis_id } = this.props;
    SynthesisActions.load(synthesis_id);
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
    const { children, mode, sideMenu } = this.props;
    if (this.state.synthesis !== null) {
      if (mode === 'view') {
        return <ViewBox synthesis={this.state.synthesis} />;
      }
      if (mode === 'edit') {
        return (
          <EditBox synthesis={this.state.synthesis} sideMenu={sideMenu}>
            {children}
          </EditBox>
        );
      }
      return <p>{<FormattedMessage id="synthesis.common.errors.incorrect_mode" />}</p>;
    }
  },

  render() {
    return (
      <div className="synthesis__box">
        <FlashMessages
          errors={this.state.messages.errors}
          success={this.state.messages.success}
          onDismissMessage={this.dismissMessage}
        />
        {this.renderBoxMode()}
      </div>
    );
  },
});

export default SynthesisBox;
