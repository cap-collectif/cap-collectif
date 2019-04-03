// @flow
import * as React from 'react';
import styled from 'styled-components';
import colors from '../../../../utils/colors';

const Button = styled.button`
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  padding: 2px 0 2px 25px;
  cursor: default;
  font-size: 14px;

  &:hover,
  &:focus {
    background-color: ${colors.primaryColor};
    color: ${colors.white};
  }

  ${props =>
    props.isSelected &&
    `
    &:before {
      font-family: "cap-collectif";
      content: "\\e072";
      position: absolute;
      color: ${colors.darkText};
      top: 3px;
      left: 6px;
    }

    &:hover, &:focus {
      &::before {
        color: ${colors.white}; 
      }
    }
  `}
`;

const Li = styled.li.attrs({
  className: 'select__option',
})`
  list-style-type: none;
  position: relative;
`;

type Props = {|
  isSelected: boolean,
  value: string,
  children?: React.Node,
  onClick: (e: SyntheticEvent<HTMLButtonElement>) => Function,
|};

class SelectOption extends React.Component<Props> {
  render() {
    const { isSelected, value, children, onClick } = this.props;

    return (
      <Li>
        <Button
          onClick={e => {
            if (!isSelected) {
              onClick(e);
            }
          }}
          isSelected={isSelected}
          role="checkbox"
          aria-checked={isSelected}
          value={value}>
          {children}
        </Button>
      </Li>
    );
  }
}

export default SelectOption;
