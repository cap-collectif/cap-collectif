<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;

class AddDebateArgumentVoteMutation extends AbstractDebateArgumentVoteMutation implements
    MutationInterface
{
    public const ALREADY_VOTED = 'ALREADY_VOTED';

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $debateArgument = $this->getDebateArgument($input, $viewer);
            $this->checkCanParticipate($debateArgument);
            $this->checkNoPreviousVote($debateArgument, $viewer);
            $debateArgumentVote = self::createNewVote($debateArgument, $viewer);
            $this->em->persist($debateArgumentVote);

            try {
                $this->em->flush();
                $this->indexer->index(DebateArgumentVote::class, $debateArgumentVote->getId());
                $this->indexer->finishBulk();
            } catch (UniqueConstraintViolationException $e) {
                return [
                    'errorCode' => self::ALREADY_VOTED,
                    'debateArgument' => null,
                    'debateArgumentVote' => null,
                ];
            }
        } catch (UserError $error) {
            return [
                'errorCode' => $error->getMessage(),
                'debateArgument' => null,
                'debateArgumentVote' => null,
            ];
        }

        return [
            'debateArgument' => $debateArgument,
            'debateArgumentVote' => $debateArgumentVote,
            'errorCode' => null,
        ];
    }

    private function checkNoPreviousVote(DebateArgument $debateArgument, User $viewer): void
    {
        if (null !== $this->repository->getOneByDebateArgumentAndUser($debateArgument, $viewer)) {
            throw new UserError(self::ALREADY_VOTED);
        }
    }

    private static function createNewVote(
        DebateArgument $debateArgument,
        User $viewer
    ): DebateArgumentVote {
        $vote = new DebateArgumentVote();
        $vote->setDebateArgument($debateArgument);
        $vote->setUser($viewer);
        $debateArgument->addVote($vote);

        return $vote;
    }
}
