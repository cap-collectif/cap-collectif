<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class RemoveDebateArgumentVoteMutation extends AbstractDebateArgumentVoteMutation implements
    MutationInterface
{
    public const NOT_VOTED = 'NOT_VOTED';

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $debateArgument = $this->getDebateArgument($input, $viewer);
            $this->checkCanParticipate($debateArgument);
            $debateArgumentVote = $this->getPreviousVote($debateArgument, $viewer);
            $debateArgumentVoteId = GlobalId::toGlobalId(
                'DebateArgumentVote',
                $debateArgumentVote->getId()
            );
            self::removePreviousVote($debateArgument, $debateArgumentVote);
            $this->em->remove($debateArgumentVote);
            $this->em->flush();
            $this->indexer->remove(
                DebateArgumentVote::class,
                GlobalId::fromGlobalId($debateArgumentVoteId)['id']
            );
            $this->indexer->finishBulk();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return [
            'debateArgument' => $debateArgument,
            'deletedDebateArgumentVoteId' => $debateArgumentVoteId,
            'errorCode' => null,
        ];
    }

    private function getPreviousVote(
        DebateArgument $debateArgument,
        User $viewer
    ): DebateArgumentVote {
        $debateArgumentVote = $this->repository->getOneByDebateArgumentAndUser(
            $debateArgument,
            $viewer
        );
        if (null === $debateArgumentVote) {
            throw new UserError(self::NOT_VOTED);
        }

        return $debateArgumentVote;
    }

    private static function removePreviousVote(
        DebateArgument $debateArgument,
        DebateArgumentVote $debateArgumentVote
    ): void {
        $debateArgument->removeVote($debateArgumentVote);
    }
}
