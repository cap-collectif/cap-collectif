<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Debate\DebateAnonymousArgumentVote;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Debate\DebateArgumentVote;
use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class AddDebateArgumentVoteMutation extends AbstractDebateArgumentVoteMutation implements MutationInterface
{
    public const ALREADY_VOTED = 'ALREADY_VOTED';

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $debateArgument = $this->getDebateArgument($input, $viewer);
            $this->checkCanParticipate($debateArgument);
            $this->checkNoPreviousVote($debateArgument, $viewer);
            $debateArgumentVote = self::createNewVote($debateArgument, $viewer);
            self::setOrigin($debateArgumentVote, $input);
            $this->em->persist($debateArgumentVote);

            try {
                $this->em->flush();
                $this->indexer->index(
                    \get_class($debateArgumentVote),
                    $debateArgumentVote->getId()
                );
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

    private function checkNoPreviousVote(
        DebateArgumentInterface $debateArgument,
        User $viewer
    ): void {
        $repo =
            $debateArgument instanceof DebateArgument
                ? $this->repository
                : $this->anonymousRepository;
        if (null !== $repo->getOneByDebateArgumentAndUser($debateArgument, $viewer)) {
            throw new UserError(self::ALREADY_VOTED);
        }
    }

    private static function createNewVote(
        DebateArgumentInterface $debateArgument,
        User $viewer
    ): AbstractVote {
        $vote =
            $debateArgument instanceof DebateArgument
                ? new DebateArgumentVote()
                : new DebateAnonymousArgumentVote();
        $vote->setDebateArgument($debateArgument);
        $vote->setUser($viewer);
        $debateArgument->addVote($vote);

        return $vote;
    }

    private static function setOrigin(AbstractVote $vote, Arg $input): AbstractVote
    {
        $widgetOriginURI = $input->offsetGet('widgetOriginURI');
        if ($widgetOriginURI) {
            $vote->setWidgetOriginUrl($widgetOriginURI);
        }

        return $vote;
    }
}
