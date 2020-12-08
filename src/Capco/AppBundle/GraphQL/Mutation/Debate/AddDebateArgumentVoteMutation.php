<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Capco\AppBundle\Security\DebateArgumentVoter;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

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
            $this->em->flush();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return [
            'debateArgument' => $debateArgument,
            'debateArgumentVote' => $debateArgumentVote,
            'errorCode' => null,
        ];
    }

    private function checkNoPreviousVote(DebateArgument $debateArgument, User $viewer): void
    {
        if (!$this->authorizationChecker->isGranted(DebateArgumentVoter::VOTE, $debateArgument)) {
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
        $debateArgument->incrementVotesCount();

        return $vote;
    }
}
