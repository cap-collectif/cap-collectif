<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteOrganizationMutation implements MutationInterface
{
    public const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';

    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;

    public function __construct(EntityManagerInterface $em, GlobalIdResolver $globalIdResolver)
    {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $organizationId = $input->offsetGet('organizationId');
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);
        if (!$organization instanceof Organization) {
            return ['errorCode' => self::ORGANIZATION_NOT_FOUND];
        }

        $organization->remove();
        $this->em->flush();

        return ['deletedOrganization' => $organization];
    }
}
