// @flow
import * as React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { useIntl, type IntlShape } from 'react-intl';
import Flex from '~ui/Primitives/Layout/Flex';
import Text from '~ui/Primitives/Text';
import DebateOpinion from '~/components/Admin/Debate/DebateOpinion/DebateOpinion';
import { type FaceToFace_debate, type ForOrAgainstValue } from '~relay/FaceToFace_debate.graphql';
import DebateEmptyOpinion from '~/components/Admin/Debate/DebateOpinion/DebateEmptyOpinion';
import ModalDebateOpinion from './ModalDebateOpinion/ModalDebateOpinion';
import { type ModalDebateOpinion_opinion$ref } from '~relay/ModalDebateOpinion_opinion.graphql';
import Button from '~ds/Button/Button';
import DeleteDebateOpinionMutation from '~/mutations/DeleteDebateOpinionMutation';
import { formatConnectionPath } from '~/shared/utils/relay';
import { type DebateOpinion_debateOpinion$ref } from '~relay/DebateOpinion_debateOpinion.graphql';
import { toast } from '~ds/Toast';

// Fragment opinion of FaceToFace
type OpinionFaceToFace = {|
  +id: string,
  +type: ForOrAgainstValue,
  +$fragmentRefs: DebateOpinion_debateOpinion$ref & ModalDebateOpinion_opinion$ref,
|};

type OpinionForAndAgainst = {|
  FOR: OpinionFaceToFace | null,
  AGAINST: OpinionFaceToFace | null,
|};

type Props = {|
  debate: FaceToFace_debate,
|};

const deleteDebateOpinion = (debateOpinionId: string, debateId: string, intl: IntlShape) => {
  const connections = [formatConnectionPath(['client', debateId], 'FaceToFace_opinions')];

  DeleteDebateOpinionMutation.commit({
    input: {
      debateOpinionId,
    },
    connections,
  })
    .then(response => {
      if (response.deleteDebateOpinion?.errorCode) {
        toast({
          variant: 'danger',
          content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
        });
      }
    })
    .catch(() => {
      toast({
        variant: 'danger',
        content: intl.formatHTMLMessage({ id: 'global.error.server.form' }),
      });
    });
};

export const FaceToFace = ({ debate }: Props) => {
  const intl = useIntl();
  const { opinions } = debate;
  const [opinionSelected, setOpinionSelected] = React.useState<
    boolean | OpinionFaceToFace | ForOrAgainstValue,
  >(false);

  const opinionForAndAgainst: OpinionForAndAgainst = opinions?.edges
    ?.filter(Boolean)
    .map(edge => edge.node)
    ?.filter(Boolean)
    .reduce(
      (acc, opinion) => ({
        FOR: opinion.type === 'FOR' ? opinion : acc.FOR,
        AGAINST: opinion.type === 'AGAINST' ? opinion : acc.AGAINST,
      }),
      { FOR: null, AGAINST: null },
    ) || { FOR: null, AGAINST: null };

  const hasOpinionForAndAgainst = !!opinionForAndAgainst.FOR && !!opinionForAndAgainst.AGAINST;

  return (
    <Flex direction="column">
      <Text color="gray.500" mb={8}>
        {intl.formatMessage({ id: 'add.opposing.opinions' })}
      </Text>

      <Flex direction="row" spacing={6} align={hasOpinionForAndAgainst ? 'stretch' : 'flex-start'}>
        {opinionForAndAgainst.FOR?.id ? (
          <DebateOpinion
            debateOpinion={opinionForAndAgainst.FOR}
            onEdit={() => setOpinionSelected(((opinionForAndAgainst.FOR: any): OpinionFaceToFace))}
            onDelete={() =>
              deleteDebateOpinion(
                ((opinionForAndAgainst.FOR: any): OpinionFaceToFace).id,
                debate.id,
                intl,
              )
            }
          />
        ) : (
          <Button onClick={() => setOpinionSelected('FOR')} flex="1">
            <DebateEmptyOpinion type="FOR" />
          </Button>
        )}

        {opinionForAndAgainst.AGAINST?.id ? (
          <DebateOpinion
            debateOpinion={opinionForAndAgainst.AGAINST}
            onEdit={() =>
              setOpinionSelected(((opinionForAndAgainst.AGAINST: any): OpinionFaceToFace))
            }
            onDelete={() =>
              deleteDebateOpinion(
                ((opinionForAndAgainst.AGAINST: any): OpinionFaceToFace).id,
                debate.id,
                intl,
              )
            }
          />
        ) : (
          <Button onClick={() => setOpinionSelected('AGAINST')} flex="1">
            <DebateEmptyOpinion type="AGAINST" />
          </Button>
        )}
      </Flex>

      {opinionSelected !== false && (
        <ModalDebateOpinion
          opinion={typeof opinionSelected === 'object' ? opinionSelected : null}
          isCreating={!(typeof opinionSelected === 'object')}
          type={typeof opinionSelected === 'object' ? opinionSelected?.type : opinionSelected}
          onClose={() => setOpinionSelected(false)}
          debate={debate}
        />
      )}
    </Flex>
  );
};

export default createFragmentContainer(FaceToFace, {
  debate: graphql`
    fragment FaceToFace_debate on Debate {
      id
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
      ...ModalDebateOpinion_debate
    }
  `,
});
