// @flow
import React, {
  useEffect,
  useRef,
  useState,
  type Node,
  type Element,
  type ComponentType,
} from 'react';
import styled, { css } from 'styled-components';

import * as Icons from '../components/Icons';
import FormatButton from './FormatButton';

const Wrapper: ComponentType<{}> = styled('div')`
  position: relative;
  z-index: 999;
`;

const Positionner: ComponentType<{}> = styled('span')`
  font-size: 16px;
`;

const DropdownPanel: ComponentType<{}> = styled('div')`
  position: absolute;
  left: 0;
  bottom: -5px;
  display: flex;
  flex-direction: row;
  padding: 5px 10px;
  box-shadow: 1px 3px 4px rgba(0, 0, 0, 0.3);
  background-color: rgba(255, 255, 255, 1);
  transition: opacity 0.15s ease-in-out;
  transform: translate(0, 100%);
  opacity: 0;
  z-index: -1;
  pointer-events: none;
  ${({ open }) =>
    open &&
    css`
      opacity: 1;
      z-index: 1;
      pointer-events: auto;
    `}
`;

type FormatDropdownProps = {
  panel: Element<any>,
  active?: boolean,
  children: Node,
};

function FormatDropdown({ children, panel, active = false, ...props }: FormatDropdownProps) {
  const node = useRef();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Detect if click is inside container (do nothing)
      // $FlowFixMe node is a ref that contains a DOM element
      if (node && node.current && node.current.contains(event.target)) {
        return;
      }

      setOpen(false);
    };

    const handleTabPress = (event: KeyboardEvent) => {
      if ((event.which || event.keyCode) === 9) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleTabPress);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleTabPress);
    };
  }, [open, setOpen]);

  function handleClick(event: SyntheticMouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setOpen(state => !state);
  }

  return (
    <Wrapper ref={node}>
      <FormatButton {...props} active={open || active} onClick={handleClick}>
        {children}{' '}
        <Positionner>
          <Icons.ArrowDropdown />
        </Positionner>
      </FormatButton>
      <DropdownPanel open={open} aria-hidden={!open}>
        {panel}
      </DropdownPanel>
    </Wrapper>
  );
}

export default FormatDropdown;
