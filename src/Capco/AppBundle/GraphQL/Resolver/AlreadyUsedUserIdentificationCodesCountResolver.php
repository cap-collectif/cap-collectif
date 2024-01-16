<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Capco\AppBundle\Repository\Security\UserIdentificationCodeRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class AlreadyUsedUserIdentificationCodesCountResolver implements QueryInterface
{
    private UserIdentificationCodeRepository $repository;

    public function __construct(UserIdentificationCodeRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(UserIdentificationCodeList $list): int
    {
        return $this->repository->countCodeUsedInList($list);
    }
}
