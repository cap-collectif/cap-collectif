import styled from 'styled-components'

export const Container = styled.div`
  .form-description {
    margin-bottom: 25px;
  }
  margin-bottom: 32px;
`
export const TitleSubSection = styled.h4<{
  primaryColor: string
}>`
  color: ${props => props.primaryColor || '#1D8393'};
  border-bottom: 1px solid ${props => props.primaryColor || '#D8D8D8'};
  padding-bottom: 8px;
  font-size: 20px;
  margin-bottom: 15px;
`
