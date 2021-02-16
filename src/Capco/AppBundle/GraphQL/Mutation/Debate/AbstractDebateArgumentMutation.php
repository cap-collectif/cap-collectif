<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\Debate;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\DebateArgumentRepository;
use Capco\AppBundle\Security\DebateArgumentVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class AbstractDebateArgumentMutation
{
    public const UNKNOWN_DEBATE = 'UNKNOWN_DEBATE';
    public const UNKNOWN_DEBATE_ARGUMENT = 'UNKNOWN_DEBATE_ARGUMENT';
    public const CANNOT_DELETE_DEBATE_ARGUMENT = 'CANNOT_DELETE_DEBATE_ARGUMENT';
    public const NOT_ARGUMENT_AUTHOR = 'NOT_ARGUMENT_AUTHOR';
    public const ALREADY_HAS_ARGUMENT = 'ALREADY_HAS_ARGUMENT';

    protected EntityManagerInterface $em;
    protected GlobalIdResolver $globalIdResolver;
    protected DebateArgumentRepository $repository;
    protected AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        DebateArgumentRepository $repository,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->repository = $repository;
        $this->authorizationChecker = $authorizationChecker;
    }

    protected function getDebateFromInput(Arg $input, User $viewer): Debate
    {
        $debate = $this->globalIdResolver->resolve($input->offsetGet('debate'), $viewer);
        if (!($debate instanceof Debate)) {
            throw new UserError(self::UNKNOWN_DEBATE);
        }

        return $debate;
    }

    protected function getArgument(Arg $input, User $viewer): DebateArgument
    {
        $debateArgument = $this->globalIdResolver->resolve($input->offsetGet('id'), $viewer);
        if (!($debateArgument instanceof DebateArgument)) {
            throw new UserError(self::UNKNOWN_DEBATE_ARGUMENT);
        }

        return $debateArgument;
    }

    protected function checkCreateRights(Debate $debate, User $viewer): void
    {
        if ($this->repository->countByDebateAndUser($debate, $viewer)) {
            throw new UserError(self::ALREADY_HAS_ARGUMENT);
        }
    }

    protected function checkUpdateRightsOnArgument(DebateArgument $argument): void
    {
        if (!$this->authorizationChecker->isGranted(DebateArgumentVoter::UPDATE, $argument)) {
            throw new UserError(self::NOT_ARGUMENT_AUTHOR);
        }
    }

    protected function checkDeleteRightsOnArgument(DebateArgument $argument): void
    {
        if (!$this->authorizationChecker->isGranted(DebateArgumentVoter::DELETE, $argument)) {
            throw new UserError(self::CANNOT_DELETE_DEBATE_ARGUMENT);
        }
    }
}
