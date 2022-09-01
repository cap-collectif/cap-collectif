<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class LeaveOrganizationMutation implements MutationInterface
{
    public const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';
    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $entityManager;

    public function __construct(
        GlobalIdResolver $globalIdResolver,
        EntityManagerInterface $entityManager
    ) {
        $this->globalIdResolver = $globalIdResolver;
        $this->entityManager = $entityManager;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $organizationId = $input->offsetGet('organizationId');
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);

        if (!$organization instanceof Organization) {
            return ['errorCode' => self::ORGANIZATION_NOT_FOUND];
        }
        $organizations = $viewer->removeOrganization($organization);
        $this->entityManager->flush();

        return ['errorCode' => null, 'organizations' => $organizations];
    }
}
