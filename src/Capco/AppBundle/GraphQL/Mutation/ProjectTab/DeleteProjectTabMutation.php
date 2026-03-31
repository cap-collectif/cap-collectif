<?php

namespace Capco\AppBundle\GraphQL\Mutation\ProjectTab;

use Capco\AppBundle\Form\Persister\ProjectTab\DeleteProjectTabPersister;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteProjectTabMutation extends AbstractProjectTabMutation implements MutationInterface
{
    public function __construct(
        private readonly DeleteProjectTabPersister $deleteProjectTabPersister,
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        parent::__construct($em, $globalIdResolver, $authorizationChecker);
    }

    /**
     * @return array<string, mixed>
     */
    public function __invoke(Argument $input, User $viewer): array
    {
        $this->normalizeInput($input);

        return $this->deleteProjectTabPersister->persist($input, $viewer);
    }

    public function isGranted(string $tabId, ?User $viewer = null): bool
    {
        $tab = $this->getProjectTab($tabId, $viewer);

        return $this->canEditProject($tab?->getProject());
    }
}
