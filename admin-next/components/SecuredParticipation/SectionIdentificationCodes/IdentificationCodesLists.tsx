import type { FC } from 'react'
import { Flex } from '@cap-collectif/ui'
import { useIntl } from 'react-intl'
import IdentificationCodesListsTable from './Table/IdentificationCodesListsTable'
import ModalStepsCreation from './ModalStepsCreation/ModalStepsCreation'
import { Section } from '@ui/Section'
import HelpButton from './HelpButton'
import { graphql, useFragment } from 'react-relay'
import type { IdentificationCodesLists_viewer$key } from '@relay/IdentificationCodesLists_viewer.graphql'

const FRAGMENT = graphql`
  fragment IdentificationCodesLists_viewer on User {
    id
    ...IdentificationCodesListsTable_viewer
  }
`

type IdentificationCodesListsProps = {
  viewer: IdentificationCodesLists_viewer$key
  connectionName: string
}

const IdentificationCodesLists: FC<IdentificationCodesListsProps> = ({ viewer: viewerFragment, connectionName }) => {
  const intl = useIntl()
  const viewer = useFragment(FRAGMENT, viewerFragment)

  return (
    <Section direction="row">
      <Flex direction="column" my={1} pr={2} width="50%">
        <Section.Title>{intl.formatMessage({ id: 'identification-code-check' })}</Section.Title>
        <Section.Description my={1}>{intl.formatMessage({ id: 'identification-code-check-help' })}</Section.Description>

        <Flex mt={6}>
          <ModalStepsCreation connectionName={connectionName} />
          <HelpButton />
        </Flex>
      </Flex>

      <IdentificationCodesListsTable viewer={viewer} />
    </Section>
  )
}

export default IdentificationCodesLists
