import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate } from 'react-intl';
import moment from 'moment';

import SynthesisElementStore from '../../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../../actions/SynthesisElementActions';
import Loader from '../../Ui/FeedbacksIndicators/Loader';
import ElementTitle from './../Element/ElementTitle';
import ElementBlock from './../Element/ElementBlock';
import ElementsList from './../List/ElementsList';
import PublishButton from './../Publish/PublishButton';
import DivideButton from './../Divide/DivideButton';
import IgnoreButton from './../Ignore/IgnoreButton';
import PublishModal from './../Publish/PublishModal';
import DivideModal from './../Divide/DivideModal';
import WYSIWYGRender from '../../Form/WYSIWYGRender';

class EditElement extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object,
    params: PropTypes.object,
  };

  state = {
    element: null,
    isLoading: true,
    showPublishModal: false,
    showDivideModal: false,
  };

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  }

  componentDidMount() {
    this.loadElementFromServer();
  }

  componentWillReceiveProps(nextProps) {
    const { params } = this.props;
    if (nextProps.params.element_id !== params.element_id) {
      this.setState(
        {
          isLoading: true,
        },
        () => {
          this.loadElementFromServer(nextProps.params.element_id);
        },
      );
    }
  }

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
    this.toggleDivideModal(false);
    this.togglePublishModal(false);
  }

  onChange = () => {
    this.setState({
      element: SynthesisElementStore.element,
      isLoading: false,
    });
  };

  togglePublishModal = value => {
    this.setState({
      showDivideModal: false,
      showPublishModal: value,
    });
  };

  toggleDivideModal = value => {
    this.setState({
      showPublishModal: false,
      showDivideModal: value,
    });
  };

  loadElementFromServer = (id = this.props.params.element_id) => {
    const { synthesis } = this.props;
    SynthesisElementActions.loadElementFromServer(synthesis.id, id);
  };

  renderDescription = () => {
    if (this.state.element && this.state.element.description) {
      return <p className="element__description box">{this.state.element.description}</p>;
    }
    return null;
  };

  renderElementPanel = () => {
    const element = this.state.element;
    if (!this.state.isLoading && element) {
      return (
        <div className="panel panel-warning synthesis__element-panel">
          <div className="panel-heading box">
            <h3 className="element__title panel-title">
              <ElementTitle element={element} />
            </h3>
          </div>
          <div id="element-details">
            <div className="panel-body">
              <div className="element box">
                <ElementBlock element={element} />
              </div>
              {this.renderDescription()}
              <WYSIWYGRender className="element__description box has-chart" value={element.body} />
              {this.renderElementButtons()}
            </div>
          </div>
        </div>
      );
    }
  };

  renderElementButtons = () => {
    const { synthesis } = this.props;
    return (
      <div className="element__actions box text-center">
        <PublishButton element={this.state.element} onModal={this.togglePublishModal} />
        <DivideButton element={this.state.element} onModal={this.toggleDivideModal} />
        <IgnoreButton synthesis={synthesis} element={this.state.element} />
      </div>
    );
  };

  renderHistory = () => {
    const element = this.state.element;
    if (!this.state.isLoading && element && element.logs.length > 0) {
      return (
        <ul className="element__history">
          {element.logs.map(log => {
            return log.sentences.map(sentence => {
              return this.renderLogSentence(sentence, log.loggedAt);
            });
          })}
        </ul>
      );
    }
  };

  renderLogSentence = (sentence, date) => {
    return (
      <li className="element__history__log">
        {sentence}
        <span className="excerpt small pull-right">
          <FormattedDate
            value={moment(date)}
            day="numeric"
            month="long"
            year="numeric"
            hour="numeric"
            minute="numeric"
          />
        </span>
      </li>
    );
  };

  renderPublishModal = () => {
    const { synthesis } = this.props;
    const element = this.state.element;
    if (!this.state.isLoading && element) {
      return (
        <PublishModal
          synthesis={synthesis}
          element={element}
          show={this.state.showPublishModal}
          toggle={this.togglePublishModal}
        />
      );
    }
  };

  renderDivideModal = () => {
    const { synthesis } = this.props;
    const element = this.state.element;
    if (!this.state.isLoading && element) {
      return (
        <DivideModal
          synthesis={synthesis}
          element={element}
          show={this.state.showDivideModal}
          toggle={this.toggleDivideModal}
        />
      );
    }
  };

  render() {
    return (
      <div className="synthesis__element">
        <Loader show={this.state.isLoading} />
        {this.renderElementPanel()}
        {!this.state.isLoading && this.state.element ? (
          <ElementsList elements={this.state.element.children} showBreadcrumb={false} />
        ) : null}
        {this.renderHistory()}
        {this.renderPublishModal()}
        {this.renderDivideModal()}
      </div>
    );
  }
}

export default EditElement;
