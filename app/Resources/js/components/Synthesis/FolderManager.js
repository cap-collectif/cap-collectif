import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

import ElementIcon from './Element/ElementIcon';
import ElementTitle from './Element/ElementTitle';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import IgnoreButton from './Ignore/IgnoreButton';
import UpdateButton from './Edit/UpdateButton';

class FolderManager extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object,
  };

  state = {
    elements: [],
    expanded: {
      root: true,
    },
    isLoading: true,
  };

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  }

  componentDidMount() {
    this.loadElementsTreeFromServer();
  }

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  }

  onChange = () => {
    this.setState({
      elements: SynthesisElementStore.elements.notIgnoredTree,
      isLoading: false,
    });
  };

  toggleExpand = element => {
    const { synthesis } = this.props;
    if (element.childrenCount !== element.children.length) {
      SynthesisElementActions.loadElementsTreeFromServer(synthesis.id, 'notIgnored', element.id);
    }
    const expanded = this.state.expanded;
    expanded[element.id] = !this.state.expanded[element.id];
    this.setState({
      expanded,
    });
  };

  loadElementsTreeFromServer = () => {
    const { synthesis } = this.props;
    SynthesisElementActions.loadElementsTreeFromServer(synthesis.id, 'notIgnored');
  };

  renderButtons = element => {
    const { synthesis } = this.props;
    if (element.displayType === 'folder') {
      return (
        <div className="pull-right">
          <UpdateButton synthesis={synthesis} element={element} />
          <IgnoreButton synthesis={synthesis} element={element} />
        </div>
      );
    }
    return null;
  };

  renderItemCaret = element => {
    const classes = classNames({
      tree__item__caret: true,
      'cap-arrow-67': this.state.expanded[element.id],
      'cap-arrow-66': !this.state.expanded[element.id],
    });
    if (element.childrenCount > 0) {
      return <i className={classes} onClick={this.toggleExpand.bind(this, element)} />;
    }
  };

  renderTreeItems = (elements, level) => {
    if (elements) {
      return (
        <ul className={`tree__list tree--level-${level}`}>
          {elements.map((element, index) => {
            return (
              <li className="tree__item" key={index}>
                {this.renderTreeItemContent(element)}
                {this.state.expanded[element.id]
                  ? this.renderTreeItems(element.children, level + 1)
                  : null}
              </li>
            );
          })}
        </ul>
      );
    }
  };

  renderTreeItemContent = element => {
    return (
      <div className="tree__item__content box">
        {this.renderItemCaret(element)}
        {this.renderButtons(element)}
        <ElementIcon className="tree__item__icon" element={element} />
        <ElementTitle element={element} className="tree__item__title" />
        <br />
        <span className="small excerpt">
          <FormattedMessage
            id="synthesis.common.elements.nb"
            values={{
              num: element.childrenCount,
            }}
          />
        </span>
      </div>
    );
  };

  render() {
    return (
      <div className="synthesis__tree">
        <Loader show={this.state.isLoading} />
        {this.renderTreeItems(this.state.elements, 0)}
      </div>
    );
  }
}

export default FolderManager;
