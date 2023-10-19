// @ts-nocheck
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'

export const SearchContainer: StyledComponent<any, {}, HTMLDivElement> = styled.div`
  width: 600px;
  height: 124px;
  padding: 24px;
  display: flex;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: flex-start;
  background-color: #9cd8d9;
`
export const SearchLabel: StyledComponent<any, {}, HTMLParagraphElement> = styled.p`
  font-weight: normal !important;
  font-size: 16px !important;
  color: #faf4e6 !important;
  line-height: 24px !important;
  padding: 0 !important;
`
