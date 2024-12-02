<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\UserBundle\Entity\UserType;
use Capco\UserBundle\Repository\UserTypeRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryUserTypesResolver implements QueryInterface
{
    public function __construct(private readonly UserTypeRepository $userTypeRepository)
    {
    }

    /**
     * @return array<int, UserType>
     */
    public function __invoke(): array
    {
        return $this->userTypeRepository->findAllToArray();
    }
}
