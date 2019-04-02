// @flow
import * as React from 'react';
import styled from 'styled-components';
import colors from '../../../../utils/colors';

const Ul = styled.ul.attrs({
  className: 'select__options',
})`
  list-style: none;
  position: absolute;
  padding: 0;
  top: 0;
  z-index: 1;
  width: 100%;
  border-radius: 4px;
  border: 1px solid ${colors.borderColor};
  background-color: ${colors.white};
  color: ${colors.darkText};
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
  transition: border-color ease-in-out 0.15s, box-shadow ease-in-out 0.15s;
`;

const Button = styled.button.attrs({
  className: 'form-control select',
})`
  text-align: left;
  position: relative;
  border-color: ${colors.borderColor};

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: 1px;
    background-color: ${colors.borderColor};
    position: absolute;
    right: 22px;
    top: 0;
    cursor: pointer;
    box-shadow: 1px 0 1px rgba(0, 0, 0, 0.075);
  }
`;

const Icon = styled.span`
  position: absolute;
  right: 6px;
  top: 11px;
  font-size: 10px;
`;

type Props = {|
  children?: React.Node,
  label: string,
  id?: string,
|};

type State = {|
  isOpen: boolean,
|};

class Select extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isOpen: false,
    };

    this.selectContainer = React.createRef();
  }

  selectContainer: { current: null | React.ElementRef<'div'> };

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.state.isOpen && prevState.isOpen === false) {
      document.addEventListener('mousedown', this.handleClick, false);
    }

    if (!this.state.isOpen && prevState.isOpen === true) {
      document.removeEventListener('mousedown', this.handleClick, false);
    }
  }

  onClickHandler = () => {
    const { isOpen } = this.state;
    this.setState({
      isOpen: !isOpen,
    });
  };

  handleClick = (e: MouseEvent) => {
    // $FlowFixMe
    if (this.selectContainer.current && this.selectContainer.current.contains(e.target)) {
      return;
    }

    this.setState({ isOpen: false });
  };

  onCloseHandle = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const { children, label, id } = this.props;
    const { isOpen } = this.state;
    const childrenWithProps = React.Children.map(children, child =>
      React.cloneElement(child, { onClose: this.onCloseHandle }),
    );

    return (
      <div ref={this.selectContainer}>
        <div className="form-group position-relative">
          <Button aria-expanded={isOpen} id={id} aria-label={label} onClick={this.onClickHandler}>
            {label}
            <Icon>
              <i className="cap-arrow-39" />
            </Icon>
          </Button>
          {isOpen && <Ul>{childrenWithProps}</Ul>}
        </div>
      </div>
    );
  }
}

export default Select;
