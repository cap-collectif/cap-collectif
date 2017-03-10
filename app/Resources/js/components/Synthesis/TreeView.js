import React from 'react';
import { IntlMixin } from 'react-intl';
import { Treebeard, decorators } from 'react-treebeard';
import { NAV_DEPTH } from '../../constants/SynthesisElementConstants';
import Loader from '../Utils/Loader';
import SynthesisStore from '../../stores/SynthesisStore';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import ElementIcon from './Element/ElementIcon';

decorators.Header = (props: Object) => {
  const style = props.style;
  const title = props.node.title != null ? props.node.title : `${props.node.body.substr(0, 140)}...`;
  return (
        <div style={style.base}>
          <div style={style.title}>
            <ElementIcon
              element={props.node}
              className="element__icon"
              style={{ marginRight: '5px', marginLeft: '5px' }}
            />
            {title}
          </div>
          <div>
            {props.node.subtitle}
          </div>
        </div>
  );
};

const updateToggle = (elements: Array<Object>, node: Object, toggled: boolean): Array<Object> => {
  return elements.map((el) => {
    if (el.id === node.id) {
      // el.active = true; // set a highlight
      el.toggled = toggled;
    }
    if (el.children) {
      el.children = updateToggle(el.children, node, toggled);
    }
    return el;
  });
};

const cleanEmptyChildren = (elements: Array<Object>): Array<Object> => {
  return elements.map((el) => {
    if (el.children) {
      if (el.children.length === 0) {
        delete el.children;
      } else {
        el.children = cleanEmptyChildren(el.children);
      }
    }
    return el;
  });
};

const TreeView = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      settings: SynthesisStore.settings,
      elements: [],
      isLoading: true,
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadElementsTreeFromServer();
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      elements: SynthesisElementStore.elements.publishedTree,
      isLoading: false,
    });
  },

  loadElementsTreeFromServer(parent = null) {
    const { synthesis } = this.props;
    const depth = synthesis.displayRules && synthesis.displayRules.level ? parseInt(synthesis.displayRules.level, 10) : 0;
    SynthesisElementActions.loadElementsTreeFromServer(synthesis.id, 'published', parent, depth > 2 ? depth : depth + NAV_DEPTH);
  },

  render() {
    const elements = cleanEmptyChildren(this.state.elements);
    return (
      <Loader show={this.state.isLoading}>
        {
          elements.map(element => (
            <Treebeard
              data={element}
              decorators={decorators}
              onToggle={(node, toggled) => {
                this.setState({ elements: updateToggle(elements, node, toggled) });
              }}
            />
          ))
        }
      </Loader>
    );
  },
});

export default TreeView;
