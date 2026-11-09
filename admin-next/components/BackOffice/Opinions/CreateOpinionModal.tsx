import {
  Box,
  Button,
  CapUIIcon,
  CapUIIconSize,
  CapUIModalSize,
  Flex,
  Heading,
  Link,
  Modal,
  Spinner,
  Text,
} from '@cap-collectif/ui'
import type { CreateOpinionModalQuery } from '@relay/CreateOpinionModalQuery.graphql'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { graphql, useLazyLoadQuery } from 'react-relay'
import { OPINION_URL } from './utils'

// Every consultation is listed, like the former Sonata modal: platforms have far fewer than this.
const CONSULTATIONS_LIMIT = 1000

// Five levels of sections, like the consultation plan of the front office (ConsultationPlan.tsx)
const QUERY = graphql`
  query CreateOpinionModalQuery($first: Int) {
    consultations(first: $first) {
      edges {
        node {
          id
          title
          sections {
            id
            title
            sections {
              id
              title
              sections {
                id
                title
                sections {
                  id
                  title
                  sections {
                    id
                    title
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

type SectionNode = {
  readonly id: string
  readonly title: string
  readonly sections?: ReadonlyArray<SectionNode | null> | null
}

const isSection = (section: SectionNode | null): section is SectionNode => Boolean(section)

const SectionLinks = ({ sections }: { sections: ReadonlyArray<SectionNode | null> }): JSX.Element => (
  <Box as="ul" pl="md" sx={{ listStyle: 'none' }}>
    {sections.filter(isSection).map(section => (
      <Box as="li" key={section.id} py="xxs">
        {/* Outside a table row, a link must look clickable at rest */}
        <Link href={`${OPINION_URL}?opinionTypeId=${section.id}`} color="primary.base">
          {section.title}
        </Link>
        {section.sections && section.sections.length > 0 ? <SectionLinks sections={section.sections} /> : null}
      </Box>
    ))}
  </Box>
)

const OpinionTypeChoice = (): JSX.Element => {
  const { consultations } = useLazyLoadQuery<CreateOpinionModalQuery>(QUERY, { first: CONSULTATIONS_LIMIT })
  // Only the consultations with an opinion type can receive an opinion
  const consultationsWithTypes = (consultations.edges ?? [])
    .map(edge => edge?.node)
    .filter(consultation => consultation && (consultation.sections ?? []).some(Boolean))

  return (
    <Flex direction="column" spacing="md">
      {consultationsWithTypes.map(consultation =>
        consultation ? (
          <Flex direction="column" key={consultation.id}>
            <Text fontWeight={600}>{consultation.title}</Text>
            <SectionLinks sections={consultation.sections ?? []} />
          </Flex>
        ) : null,
      )}
    </Flex>
  )
}

const CreateOpinionModal = (): JSX.Element => {
  const intl = useIntl()

  return (
    <Modal
      size={CapUIModalSize.Md}
      ariaLabel={intl.formatMessage({ id: 'admin.opinions.choose-type' })}
      disclosure={
        <Button variant="primary" variantColor="primary" variantSize="small" leftIcon={CapUIIcon.Add}>
          {intl.formatMessage({ id: 'create-proposal' })}
        </Button>
      }
    >
      {/* A render prop: the content, and so its query, is only mounted when the modal is open */}
      {() => (
        <>
          <Modal.Header>
            <Heading>{intl.formatMessage({ id: 'admin.opinions.choose-type' })}</Heading>
          </Modal.Header>
          <Modal.Body>
            <React.Suspense
              fallback={
                <Flex alignItems="center" justifyContent="center">
                  <Spinner size={CapUIIconSize.Lg} color="gray.150" />
                </Flex>
              }
            >
              <OpinionTypeChoice />
            </React.Suspense>
          </Modal.Body>
        </>
      )}
    </Modal>
  )
}

export default CreateOpinionModal
