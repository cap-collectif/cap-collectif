import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { NAV_DEPTH } from '../../../constants/SynthesisElementConstants';

import ViewElement from './ViewElement';
import Loader from '../../Ui/FeedbacksIndicators/Loader';

import SynthesisStore from '../../../stores/SynthesisStore';
import SynthesisElementStore from '../../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../../actions/SynthesisElementActions';

import ArrayHelper from '../../../services/ArrayHelper';
import SynthesisDisplayRules from '../../../services/SynthesisDisplayRules';

class ViewTree extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object.isRequired,
  };

  state = {
    settings: SynthesisStore.settings,
    elements: [],
    expanded: {},
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
      elements: SynthesisElementStore.elements.publishedTree,
      expanded: SynthesisElementStore.expandedItems.view,
      isLoading: false,
    });
  };

  toggleExpand = element => {
    if (element.childrenCount !== element.children.length) {
      this.loadElementsTreeFromServer(element.id);
    }
    SynthesisElementActions.expandTreeItem('view', element.id, !this.state.expanded[element.id]);
  };

  loadElementsTreeFromServer = (parent = null) => {
    const { synthesis } = this.props;
    const depth =
      synthesis.displayRules && synthesis.displayRules.level
        ? parseInt(synthesis.displayRules.level, 10)
        : 0;
    SynthesisElementActions.loadElementsTreeFromServer(
      synthesis.id,
      'published',
      parent,
      depth > 2 ? depth : depth + NAV_DEPTH,
    );
  };

  isElementExpanded = element => {
    const { synthesis } = this.props;
    if (!element) {
      return true;
    }
    const displayRules = synthesis.displayRules || {};
    return (
      SynthesisDisplayRules.getValueForRuleAndElement(
        element,
        this.state.settings,
        'display',
        'expanded',
        displayRules,
      ) || this.state.expanded[element.id]
    );
  };

  renderCaret = element => {
    const { synthesis } = this.props;
    const displayRules = synthesis.displayRules || {};
    if (
      SynthesisDisplayRules.getValueForRuleAndElement(
        element,
        this.state.settings,
        'display',
        'childrenInModal',
        displayRules,
      )
    ) {
      return null;
    }
    if (
      SynthesisDisplayRules.getValueForRuleAndElement(
        element,
        this.state.settings,
        'display',
        'expanded',
        displayRules,
      )
    ) {
      return null;
    }
    const expanded = this.state.expanded[element.id] || false;
    if (element.publishedChildrenCount > 0 && element.childrenCount > 0) {
      const classes = classNames({
        'cap-arrow-67': expanded,
        'cap-arrow-66': !expanded,
      });
      return (
        <div
          className="synthesis__element__readmore"
          onClick={this.toggleExpand.bind(null, element)}>
          <span>
            {expanded ? (
              <FormattedMessage
                id="synthesis.readmore.hide"
                values={{
                  title: element.title,
                }}
              />
            ) : (
              <FormattedMessage
                id="synthesis.readmore.show"
                values={{
                  title: element.title,
                }}
              />
            )}
          </span>
          <i style={{ marginLeft: '5px' }} className={classes} />
        </div>
      );
    }
    return null;
  };

  renderTreeItems = (elements, parent = null) => {
    const { synthesis } = this.props;
    const displayRules = synthesis.displayRules || {};
    if (
      this.isElementExpanded(parent) &&
      elements &&
      !SynthesisDisplayRules.getValueForRuleAndElement(
        parent,
        this.state.settings,
        'display',
        'childrenInModal',
        displayRules,
      )
    ) {
      const orderedElements = SynthesisDisplayRules.getValueForRuleAndElement(
        parent,
        this.state.settings,
        'display',
        'foldersOrderedByCount',
        displayRules,
      )
        ? ArrayHelper.sortArrayByField(elements, 'childrenElementsNb', false, 'DESC')
        : ArrayHelper.sortArrayByField(elements, 'title', true);
      return (
        <ul className="synthesis__elements">
          {orderedElements.map(element => {
            return (
              <li key={element.id}>
                <ViewElement
                  key={element.id}
                  element={element}
                  parent={parent}
                  settings={SynthesisDisplayRules.getMatchingSettingsForElement(
                    element,
                    this.state.settings,
                    displayRules,
                  )}
                  onExpandElement={() => this.toggleExpand(element)}
                />
                {this.renderTreeItems(element.children, element)}
                {this.renderCaret(element)}
              </li>
            );
          })}
        </ul>
      );
    }
  };

  render() {
    return (
      <Loader show={this.state.isLoading}>
        {this.state.elements.length > 0 ? this.renderTreeItems(this.state.elements, null) : null}
      </Loader>
    );
  }
}

export default ViewTree;
