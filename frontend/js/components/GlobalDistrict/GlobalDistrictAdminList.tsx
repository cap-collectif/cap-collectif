import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import type { StyledComponent } from 'styled-components'
import styled from 'styled-components'
// TODO https://github.com/cap-collectif/platform/issues/7774
// eslint-disable-next-line no-restricted-imports
import { ListGroup, ListGroupItem, Row, Col, ButtonToolbar } from 'react-bootstrap'
import DeleteButtonPopover from '~/components/Ui/Button/DeleteButtonPopover'
import EditButton from '~/components/Ui/Button/EditButton'
import Translation from '~/services/Translation'
import type { GlobalDistrictAdminList_districts } from '~relay/GlobalDistrictAdminList_districts.graphql'

type Props = {
  districts: GlobalDistrictAdminList_districts
  handleEdit: (editId: string) => void
  handleDelete: (deleteId: string) => void
}
const ListGroupItemContainer: StyledComponent<any, {}, typeof ListGroupItem> = styled(ListGroupItem)`
  background-color: #fafafa;
`
export function GlobalDistrictAdminList(props: Props) {
  const { districts, handleEdit, handleDelete } = props
  return (
    <ListGroup>
      {districts.edges &&
        districts.edges
          .filter(Boolean)
          .map(edge => edge.node)
          .filter(Boolean)
          .map(district => (
            <ListGroupItemContainer key={district.id}>
              <Row>
                <Col xs={6} sm={7}>
                  {/* @ts-expect-error can't add generic types to jsx like in TS https://github.com/facebook/flow/issues/7672 */}
                  <Translation field="name" translations={district.translations} fallback="translation-not-available" />
                </Col>
                <Col xs={6} sm={5}>
                  <ButtonToolbar className="pull-right">
                    <EditButton id={`EditButton-${district.id}`} onClick={() => handleEdit(district.id)} />
                    <DeleteButtonPopover
                      id={`DeleteButtonPopover-${district._id}`}
                      handleValidate={() => handleDelete(district.id)}
                    />
                  </ButtonToolbar>
                </Col>
              </Row>
            </ListGroupItemContainer>
          ))}
    </ListGroup>
  )
}
export default createFragmentContainer(GlobalDistrictAdminList, {
  districts: graphql`
    fragment GlobalDistrictAdminList_districts on GlobalDistrictConnection {
      edges {
        node {
          id
          _id
          translations {
            name
            locale
          }
        }
      }
    }
  `,
})
