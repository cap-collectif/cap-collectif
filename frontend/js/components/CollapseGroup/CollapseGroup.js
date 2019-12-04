// @flow
import * as React from 'react';
import CollapseItem from './CollapseItem';

type Props = {
  children: any,
  labels: string[],
};

type State = {
  openedId: ?string,
};

export default class CollapseGroup extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { openedId: null };
  }

  handleClickItem = (id: ?string) => {
    const { openedId } = this.state;
    if (id === openedId) {
      this.setState({ openedId: null });
    } else {
      this.setState({ openedId: id });
    }
  };

  render() {
    const { children, labels } = this.props;
    const { openedId } = this.state;

    return (
      <div>
        {children.filter(Boolean).map((collapseItem, id) => (
          <CollapseItem
            id={id}
            key={id}
            label={labels[id] || ''}
            isOpen={id === openedId}
            onClick={this.handleClickItem}>
            {collapseItem}
          </CollapseItem>
        ))}
      </div>
    );
  }
}
