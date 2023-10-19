import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
import { Panel } from 'react-bootstrap'

export const PanelHeader: StyledComponent<any, {}, typeof Panel.Heading> = styled(Panel.Heading)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px 12px;

  .form-group,
  label {
    margin: 0;
  }
`
export const PanelBody: StyledComponent<any, {}, typeof Panel.Body> = styled(Panel.Body)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  padding: 20px 15px;

  .form-group {
    flex: 0 0 30%;
    margin: 0 14px 0 0;

    &:last-child {
      margin: 0;
    }
  }
`
