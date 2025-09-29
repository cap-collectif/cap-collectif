<?php

namespace Capco\AppBundle\GraphQL\Mutation\Organization;

use Capco\AppBundle\Entity\Organization\Organization;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\Organization\OrganizationMemberRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class LeaveOrganizationMutation implements MutationInterface
{
    use MutationTrait;

    final public const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND';

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly EntityManagerInterface $entityManager,
        private readonly OrganizationMemberRepository $repository
    ) {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $organizationId = $input->offsetGet('organizationId');
        $organization = $this->globalIdResolver->resolve($organizationId, $viewer);

        if (!$organization instanceof Organization) {
            return ['errorCode' => self::ORGANIZATION_NOT_FOUND];
        }
        $organizations = $viewer->removeOrganization($organization);
        $organizationMember = $this->repository->findOneBy([
            'user' => $viewer,
            'organization' => $organization,
        ]);
        $this->entityManager->remove($organizationMember);
        $this->entityManager->flush();

        return ['errorCode' => null, 'organizations' => $organizations];
    }
}
