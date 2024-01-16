<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Interfaces\DebateArgumentInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\Debate\DebateAnonymousArgumentVoteRepository;
use Capco\AppBundle\Repository\Debate\DebateArgumentVoteRepository;
use Capco\AppBundle\Security\DebateArgumentVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Error\UserError;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

abstract class AbstractDebateArgumentVoteMutation
{
    use MutationTrait;

    public const UNKNOWN_DEBATE_ARGUMENT = 'UNKNOWN_DEBATE_ARGUMENT';
    public const CLOSED_DEBATE = 'CLOSED_DEBATE';

    protected DebateArgumentVoteRepository $repository;
    protected DebateAnonymousArgumentVoteRepository $anonymousRepository;
    protected EntityManagerInterface $em;
    protected AuthorizationCheckerInterface $authorizationChecker;
    protected Indexer $indexer;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker,
        DebateArgumentVoteRepository $repository,
        DebateAnonymousArgumentVoteRepository $anonymousRepository,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
        $this->repository = $repository;
        $this->anonymousRepository = $anonymousRepository;
        $this->indexer = $indexer;
    }

    protected function getDebateArgument(Arg $input, User $viewer): DebateArgumentInterface
    {
        $this->formatInput($input);
        $debateArgument = $this->globalIdResolver->resolve(
            $input->offsetGet('debateArgumentId'),
            $viewer
        );
        if (
            !($debateArgument instanceof DebateArgumentInterface)
            || !$debateArgument->isPublished()
        ) {
            throw new UserError(self::UNKNOWN_DEBATE_ARGUMENT);
        }

        return $debateArgument;
    }

    protected function checkCanParticipate(DebateArgumentInterface $debateArgument): void
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
