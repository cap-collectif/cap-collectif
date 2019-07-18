// @flow
import * as React from 'react';
import styled from 'styled-components';

import colors from '../../../utils/colors';

type Props = {|
  max: number,
  children: node,
|};

const UserAvatarListWrapper = styled.div`
display: flex;
position: relative;
`

const AvatarWrapper = styled.div`
z-index: ${props=>props.max-props.index};

img, svg{
  margin-right: 0;
  border: 2px solid white;
}

&:not(:first-child){
  margin-left: -10px;
}
`


const AvatarDefaultButton = styled.button`
  outline: none;
  border: none;
  background: none;
  padding: 0;
  color: ${colors.darkGray} !important;
  background-color: ${colors.borderColor} !important;
  height: 45px;
  width: 45px;
  border-radius: 50%;
`;


const UserAvatarList = (props: Props) => {
  const { max, children } = props;

  return (
    <UserAvatarListWrapper>
      {children.slice(0, max).map((child, index) => 
      (
        <AvatarWrapper max={max} index={index} key={index}>
          {child}
        </AvatarWrapper>
      ))}
      {children.length > max && (
        <AvatarWrapper index={max} max={max}>
          <AvatarDefaultButton 
            onClick={onClick}
            bsStyle="link"
            id="show-all"
            className="more__link text-center">
            {`+${children.length - max >= 100 ? '99' : children.length - max}`}
          </AvatarDefaultButton>
        </AvatarWrapper>
      )}
    </UserAvatarListWrapper>
  );
};


UserAvatarList.defaultProps = {
  max: 5,
};

export default UserAvatarList 
