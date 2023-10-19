import styled from 'styled-components'
import React from 'react'
import colors from '../../../utils/colors'
import Cover from './Cover'
import Type from './Type'
import Status from './Status'
import Body from './Body'
import Title from './Title'
import Counters from './Counters'
import Date from './Date'
import { Header } from './Header'

type Props = {
  children?: any
  className?: string
  style?: Record<string, any>
  id?: string
  isHorizontal?: boolean
}
export const Container = styled.div.attrs({
  className: 'card',
})<{
  isHorizontal: boolean
}>`
  border: 1px solid ${colors.borderColor};
  background-color: ${colors.white};
  margin-bottom: 30px;
  display: flex;
  flex: 1 0 auto;
  flex-direction: ${props => (props.isHorizontal ? 'row' : 'column')};
  width: 100%;
  border-radius: 4px;
  clear: both;

  ul {
    margin-bottom: 5px;
  }

  form + button {
    margin-left: 5px;
  }

  .m-0 {
    margin-top: 0 !important;
  }

  @media print {
    border: none;
    display: block;
    margin-bottom: 0;
    margin-top: 15pt;
  }
`
export class Card extends React.PureComponent<Props> {
  static Type = Type

  static Header = Header

  static Cover = Cover

  static Body = Body

  static Title = Title

  static Counters = Counters

  static Status = Status

  static Date = Date

  render() {
    const { children, className, style, id, isHorizontal = false } = this.props
    return (
      // @ts-ignore
      <Container className={className} style={style} id={id} isHorizontal={isHorizontal}>
        {children}
      </Container>
    )
  }
}
export default Card
