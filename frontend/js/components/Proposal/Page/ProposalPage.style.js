// @flow
import styled, { type StyledComponent, css } from 'styled-components';
import colors from '~/utils/colors';

export const Card: StyledComponent<
  { withBorder?: boolean, color?: string },
  {},
  HTMLDivElement,
> = styled.div.attrs({
  className: 'Card',
})`
  background: ${colors.white};
  border-radius: 4px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.175);
  ${({ withBorder, color }) =>
    withBorder &&
    css`
      border-top: 4px solid ${color || colors.yellow};
    `};
`;

export const CategoryContainer: StyledComponent<
  { paddingTop?: number },
  {},
  HTMLDivElement,
> = styled.div`
  padding: 25px 30px;
  padding-top: ${({ paddingTop }) => (paddingTop || paddingTop === 0) && `${paddingTop}px`};

  .CategoryTitle {
    margin-bottom: 20px;
  }
`;

export const CategoryCircledIcon: StyledComponent<
  { paddingLeft?: number, paddingTop?: number, size?: number },
  {},
  HTMLDivElement,
> = styled.div`
  width: ${({ size }) => (size ? `${size}px` : '36px')};
  height: ${({ size }) => (size ? `${size}px` : '36px')};
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.175);
  border-radius: 18px;
  padding-left: ${({ paddingLeft }) =>
    paddingLeft || paddingLeft === 0 ? `${paddingLeft}px` : '8px'};
  padding-top: ${({ paddingTop }) => (paddingTop || paddingTop === 0 ? `${paddingTop}px` : '5px')};
`;

export const CategoryTitle: StyledComponent<{}, {}, HTMLDivElement> = styled.div.attrs({
  className: 'CategoryTitle',
})`
  display: flex;
  align-items: center;
  width: 100%;

  h3 {
    text-transform: uppercase;
    font-size: 20px;
    font-weight: 600;
    margin: 0;
    margin-left: 15px;
  }

  h5 {
    color: ${colors.secondaryGray};
    margin-top: 15px;
    margin-left: 15px;
  }
`;

export const Circle: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  width: 18px;
  height: 18px;
  background: ${colors.secondaryGray};
  border-radius: 10px;
`;

export const SeeMoreButton: StyledComponent<{}, {}, HTMLButtonElement> = styled.button`
  width: 100%;
  background: none;
  text-align: center;
  border: 1px solid ${colors.primaryColor};
  color: ${colors.primaryColor};
  padding: 5px;
  border-radius: 4px;
`;

export const ProposalTipsmeeeContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
  iframe {
    border: none;
    overflow: hidden;
  }
`;

export const ProposalTipsmeeeQrCodeContainer: StyledComponent<{}, {}, HTMLDivElement> = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  figure {
    text-align: right;
  }
  img {
    width: 75%;
  }
`;
