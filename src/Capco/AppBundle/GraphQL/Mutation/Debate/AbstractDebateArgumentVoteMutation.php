<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository;
use Capco\AppBundle\Security\DebateArgumentVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

abstract class AbstractDebateArgumentVoteMutation
{
    public const UNKNOWN_DEBATE_ARGUMENT = 'UNKNOWN_DEBATE_ARGUMENT';
    public const CLOSED_DEBATE = 'CLOSED_DEBATE';

    protected DebateArgumentVoteRepository $repository;
    protected EntityManagerInterface $em;
    protected AuthorizationCheckerInterface $authorizationChecker;
    protected Indexer $indexer;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        DebateArgumentVoteRepository $repository,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
        $this->repository = $repository;
        $this->indexer = $indexer;
    }

    protected function getDebateArgument(Arg $input, User $viewer): DebateArgument
    {
        $debateArgument = $this->globalIdResolver->resolve(
            $input->offsetGet('debateArgumentId'),
            $viewer
        );
        if (!($debateArgument instanceof DebateArgument) || !$debateArgument->isPublished()) {
            throw new UserError(self::UNKNOWN_DEBATE_ARGUMENT);
        }

        return $debateArgument;
    }

    protected function checkCanParticipate(DebateArgument $debateArgument): void
    {
        if (
            !$this->authorizationChecker->isGranted(
                DebateArgumentVoter::PARTICIPATE,
                $debateArgument
            )
        ) {
            throw new UserError(self::CLOSED_DEBATE);
        }
    }
}
