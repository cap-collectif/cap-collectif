<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Repository\UserTypeRepository;
use Doctrine\ORM\OptimisticLockException;
use Doctrine\ORM\ORMException;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteUserTypeMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly UserTypeRepository $userTypeRepository)
    {
    }

    /**
     * @throws OptimisticLockException
     * @throws ORMException
     *
     * @return string[]
     */
    public function __invoke(string $id): array
    {
        $userType = $this->userTypeRepository->find($id);
        if (null === $userType) {
            throw new UserError(sprintf('Unknown userType with id "%s"', $id));
        }
        $this->userTypeRepository->remove($userType);

        return ['deletedUserTypeId' => $id];
    }
}
