<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Repository\UserTypeRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryUserTypesResolver implements QueryInterface
{
    private UserTypeRepository $userTypeRepository;

    public function __construct(UserTypeRepository $userTypeRepository)
    {
        $this->userTypeRepository = $userTypeRepository;
    }

    /**
     * @return array<int, UserType>
     */
    public function __invoke(): array
    {
        return $this->userTypeRepository->findAllToArray();
    }
}
