import styled from 'styled-components'
import css from '@styled-system/css'
import AppBox from '~ui/Primitives/AppBox'
import Flex from '~ui/Primitives/Layout/Flex'

export const SectionContainer = styled(AppBox)`
  background: white;
  padding: 24px;
  border-radius: 8px;
  margin: 0 0 21px 0;
  label {
    font-weight: 400 !important;
  }
  input[type='number'] {
    width: 75px;
  }
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    opacity: 1;
  }
  h1 {
    font-size: 18px;
    color: #003670;
    font-weight: 600;
    margin: 0 0 24px 0;
  }
`
export const SectionInner = styled(AppBox)`
  max-width: 747px;
`
export const PreviewLink = styled(Flex).attrs({
  color: 'blue.500',
})`
  a {
    ${css({
      color: 'blue.500',
    })};
    font-weight: 600;
  }
`
export const ProjectCard = styled(AppBox).attrs({
  mb: 4,
  borderRadius: 'project_card',
  p: 2,
  boxShadow: 'small',
  backgroundColor: 'white',
})`
  img {
    width: 112px;
    height: 69px;
    object-fit: cover;
    border-radius: 4px;
  }
  p {
    display: flex;
    align-items: center;
    font-weight: 600;
    margin: 0 0 0 15px;
  }
`
export const ProjectCardCustom = styled(Flex).attrs({
  my: 4,
  borderRadius: 'project_card',
  p: 2,
  boxShadow: 'small',
  backgroundColor: 'white',
})`
  max-width: 768px;
  font-weight: 600;

  img {
    width: 112px;
    height: 69px;
    object-fit: cover;
    border-radius: 4px;
  }

  &:hover .delete-icon {
    opacity: 1;
  }
`
export const ProjectCardCustomDeleteIcon = styled(AppBox).attrs({
  color: 'gray.500',
  width: 5,
  height: 5,
  marginRight: 2,
})`
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s ease-in;
`
