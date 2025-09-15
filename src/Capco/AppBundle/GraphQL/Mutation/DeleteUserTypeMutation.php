<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserTypeRepository;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteUserTypeMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly UserTypeRepository $userTypeRepository
    ) {
    }

    /**
     * @throws ORMException
     * @throws OptimisticLockException
     *
     * @return string[]
     */
    public function __invoke(string $globalId, User $viewer): array
    {
        $userType = $this->globalIdResolver->resolve($globalId, $viewer);
        if (null === $userType) {
            throw new UserError(sprintf('Unknown userType with globalID: %s', $globalId));
        }
        $this->userTypeRepository->remove($userType);

        return ['deletedUserTypeId' => $globalId];
    }
}
