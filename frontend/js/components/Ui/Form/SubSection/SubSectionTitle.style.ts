import styled from 'styled-components'
import { hexToRgba } from '~/utils/colors/hexToRgb'

export const TitleSubSection = styled.h4<{
  primaryColor: string
}>`
  color: ${props => props.primaryColor || '#1D8393'};
  border-bottom: 1px solid ${props => props.primaryColor || '#D8D8D8'};
  padding-bottom: 8px;
  font-size: 20px;
  margin-bottom: 15px;
`
export const TitleQuestionnaire = styled.h4<{
  primaryColor: string
}>`
  position: relative;
  text-align: center;
  margin-top: 50px;

  p {
    color: ${props => props.primaryColor || '#000'};
    padding: 0 2%;
    background-color: #fff;
    font-size: 20px;
    line-height: 24px;
    font-weight: normal;
    margin-bottom: 16px;
    display: inline-block;
    z-index: 1;
    position: relative;
  }

  &:before {
    position: absolute;
    content: '';
    background-color: ${props =>
      props.primaryColor ? hexToRgba(props.primaryColor, 0.2, true) : hexToRgba('#fff', 0.2, true)};
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 92%;
    height: 1px;
  }
`
