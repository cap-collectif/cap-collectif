<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ProjectVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteStepMutation implements MutationInterface
{
    use MutationTrait;
    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;
    private AuthorizationCheckerInterface $authorizationChecker;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $stepId = $input->offsetGet('stepId');
        $step = $this->getStep($stepId, $viewer);
        $this->em->remove($step);
        $this->em->flush();

        return ['stepId' => $stepId];
    }

    public function isGranted(string $stepId, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }
        $step = $this->getStep($stepId, $viewer);
        $project = $step->getProject();

        return $this->authorizationChecker->isGranted(ProjectVoter::DELETE, $project);
    }

    private function getStep(string $stepId, User $viewer): AbstractStep
    {
        $step = $this->globalIdResolver->resolve($stepId, $viewer);
        if (!$step instanceof AbstractStep) {
            throw new UserError('Given step is not of type AbstractStep');
        }

        return $step;
    }
}
