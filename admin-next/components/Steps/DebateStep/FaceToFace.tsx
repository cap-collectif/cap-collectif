import * as React from 'react'
import { graphql, useFragment } from 'react-relay'
import { useIntl, IntlShape } from 'react-intl'
import DebateOpinion from '@components/Steps/DebateStep/DebateOpinion'
import ModalDebateOpinion from '@components/Steps/DebateStep/ModalDebateOpinion'
import DeleteDebateOpinionMutation from '@mutations/DeleteDebateOpinionMutation'
import { formatConnectionPath } from '@utils/relay'
import { Flex, Text, Button } from '@cap-collectif/ui'
import { FaceToFace_debate$key, ForOrAgainstValue } from '@relay/FaceToFace_debate.graphql'
import DebateEmptyOpinion from '@components/Steps/DebateStep/DebateEmptyOpinion'
import { mutationErrorToast } from '@shared/utils/mutation-error-toast'
import { FragmentRefs } from 'relay-runtime'

type OpinionFaceToFace = {
  readonly id: string
  readonly type: ForOrAgainstValue
  readonly ' $fragmentRefs': FragmentRefs<'DebateOpinion_debateOpinion' | 'ModalDebateOpinion_opinion'>
}

type OpinionForAndAgainst = Omit<Record<ForOrAgainstValue, OpinionFaceToFace | null>, '%future added value'>

type Props = {
  debate: FaceToFace_debate$key
}

const DEBATE_FRAGMENT = graphql`
  fragment FaceToFace_debate on Debate {
    id
    ...ModalDebateOpinion_debate
    opinions(first: 2) @connection(key: "FaceToFace_opinions", filters: []) {
      edges {
        node {
          id
          type
          ...DebateOpinion_debateOpinion
          ...ModalDebateOpinion_opinion
        }
      }
    }
  }
`

const deleteDebateOpinion = async (debateOpinionId: string, debateId: string, intl: IntlShape) => {
  const connections = [formatConnectionPath(['client', debateId], 'FaceToFace_opinions')]

  try {
    const response = await DeleteDebateOpinionMutation.commit({
      input: {
        debateOpinionId,
      },
      connections,
    })
    if (response.deleteDebateOpinion?.errorCode) {
      return mutationErrorToast(intl)
    }
  } catch (error) {
    return mutationErrorToast(intl)
  }
}

const FaceToFace = ({ debate: debateRef }: Props) => {
  const intl = useIntl()
  const debate = useFragment(DEBATE_FRAGMENT, debateRef)
  const { opinions } = debate
  const [opinionSelected, setOpinionSelected] = React.useState<false | OpinionFaceToFace | ForOrAgainstValue>(false)

  const edges = opinions.edges?.filter(edge => edge !== null) ?? []
  const nodes = edges.map(edge => edge?.node ?? null)
  const defaultValue: OpinionForAndAgainst = { FOR: null, AGAINST: null }
  // @ts-ignore fragmentRef not passed ?
  const opinionForAndAgainst: OpinionForAndAgainst = nodes.reduce((acc, opinion) => {
    return {
      FOR: opinion?.type === 'FOR' ? opinion : acc.FOR,
      AGAINST: opinion?.type === 'AGAINST' ? opinion : acc.AGAINST,
    }
  }, defaultValue)

  return (
    <Flex direction="column">
      <Text color="gray.500" mb={8}>
        {intl.formatMessage({ id: 'add.opposing.opinions' })}
      </Text>

      <Flex direction="column" spacing={6}>
        {opinionForAndAgainst.FOR?.id ? (
          <DebateOpinion
            // @ts-ignore fragmentRef not passed ?
            debateOpinion={opinionForAndAgainst.FOR}
            onEdit={() => {
              setOpinionSelected(opinionForAndAgainst.FOR as OpinionFaceToFace)
            }}
            onDelete={() => deleteDebateOpinion(opinionForAndAgainst.FOR?.id as string, debate.id, intl)}
          />
        ) : (
          <Button variant="tertiary" onClick={() => setOpinionSelected('FOR')} flex="1">
            <DebateEmptyOpinion type="FOR" />
          </Button>
        )}

        {opinionForAndAgainst.AGAINST?.id ? (
          <DebateOpinion
            // @ts-ignore fragmentRef not passed ?
            debateOpinion={opinionForAndAgainst.AGAINST}
            onEdit={() => {
              setOpinionSelected(opinionForAndAgainst.AGAINST as OpinionFaceToFace)
            }}
            onDelete={() => deleteDebateOpinion(opinionForAndAgainst.AGAINST?.id as string, debate.id, intl)}
          />
        ) : (
          <Button variant="tertiary" onClick={() => setOpinionSelected('AGAINST')} flex="1">
            <DebateEmptyOpinion type="AGAINST" />
          </Button>
        )}
      </Flex>
      {opinionSelected !== false && (
        <ModalDebateOpinion
          // @ts-ignore fragmentRef not passed ?
          opinion={typeof opinionSelected === 'object' ? opinionSelected : null}
          type={typeof opinionSelected === 'object' ? opinionSelected?.type : opinionSelected}
          onClose={() => {
            setOpinionSelected(false)
          }}
          debate={debate}
        />
      )}
    </Flex>
  )
}

export default FaceToFace
