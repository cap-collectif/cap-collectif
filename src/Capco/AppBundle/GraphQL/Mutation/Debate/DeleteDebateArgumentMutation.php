<?php

namespace Capco\AppBundle\GraphQL\Mutation\Debate;

use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Security\DebateArgumentVoter;
use Capco\UserBundle\Entity\User;
use GraphQL\Error\UserError;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteDebateArgumentMutation implements MutationInterface
{
    public const UNKNOWN_DEBATE_ARGUMENT = 'UNKNOWN_DEBATE_ARGUMENT';
    public const CANNOT_DELETE_DEBATE_ARGUMENT = 'CANNOT_DELETE_DEBATE_ARGUMENT';

    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $debateArgument = $this->getArgument($input, $viewer);
            $this->checkRights($debateArgument);
            $this->em->remove($debateArgument);
            $this->em->flush();
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }

        return ['deletedDebateArgumentId' => $input->offsetGet('id')];
    }

    private function checkRights(DebateArgument $argument): void
    {
        if (!$this->authorizationChecker->isGranted(DebateArgumentVoter::DELETE, $argument)) {
            throw new UserError(self::CANNOT_DELETE_DEBATE_ARGUMENT);
        }
    }

    private function getArgument(Arg $input, User $viewer): DebateArgument
    {
        $debateArgument = $this->globalIdResolver->resolve($input->offsetGet('id'), $viewer);
        if (!($debateArgument instanceof DebateArgument)) {
            throw new UserError(self::UNKNOWN_DEBATE_ARGUMENT);
        }

        return $debateArgument;
    }
}
