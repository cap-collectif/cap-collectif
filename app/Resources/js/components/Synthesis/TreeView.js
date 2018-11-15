import React from 'react';
import { Treebeard, decorators, theme } from 'react-treebeard';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import SynthesisStore from '../../stores/SynthesisStore';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import ElementIcon from './Element/ElementIcon';

decorators.Header = (props: Object) => {
  const style = props.style;
  const title =
    props.node.title !== null ? props.node.title : `${props.node.body.substr(0, 140)}...`;
  let titleElement;
  if (props.node.linkedDataUrl && props.node.displayType !== 'folder') {
    titleElement = <a href={props.node.linkedDataUrl}>{title}</a>;
  } else {
    titleElement = title;
  }
  return (
    <div style={style.base}>
      <div style={style.title}>
        <ElementIcon
          element={props.node}
          className="element__icon"
          style={{
            float: 'left',
            marginRight: '5px',
            paddingLeft: '5px',
            color: props.node.displayType === 'folder' ? '#4B515D' : '#33b5e5',
          }}
        />
        <div
          style={{
            overflow: 'hidden',
            color: 'black',
            fontSize: '16px',
            fontWeight: props.node.displayType === 'folder' ? '500' : 'normal',
          }}>
          {titleElement}
        </div>
      </div>
      <div className="excerpt">{props.node.subtitle}</div>
    </div>
  );
};

const updateToggle = (elements: Array<Object>, node: Object, toggled: boolean): Array<Object> => {
  return elements.map(el => {
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
  return elements.map(el => {
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

const preToggleElement = (elements: Array<Object>, depth: number): Array<Object> => {
  return elements.map(el => {
    if (el.level <= depth) {
      el.toggled = true;
    }
    if (el.children && el.children.length > 0) {
      el.children = preToggleElement(el.children, depth);
    }
    return el;
  });
};

type Props = {
  synthesis: Object,
};

class TreeView extends React.Component<Props> {
  state = {
    settings: SynthesisStore.settings,
    elements: [],
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
      isLoading: false,
    });
  };

  loadElementsTreeFromServer = (parent = null) => {
    const { synthesis } = this.props;
    SynthesisElementActions.loadElementsTreeFromServer(synthesis.id, 'published', parent);
  };

  render() {
    const { synthesis } = this.props;
    const depth =
      synthesis.displayRules && synthesis.displayRules.level
        ? parseInt(synthesis.displayRules.level, 10)
        : 0;
    const elements = preToggleElement(cleanEmptyChildren(this.state.elements), depth);
    const styles = theme;
    styles.tree.node.link.display = 'flex';
    return (
      <Loader show={this.state.isLoading}>
        {elements.map(element => (
          <Treebeard
            data={element}
            decorators={decorators}
            onToggle={(node, toggled) => {
              this.setState({
                elements: updateToggle(elements, node, toggled),
              });
            }}
            style={styles}
          />
        ))}
      </Loader>
    );
  }
}

export default TreeView;
