<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Security\UserIdentificationCodeList;
use Capco\AppBundle\Repository\Security\UserIdentificationCodeRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class AlreadyUsedUserIdentificationCodesCountResolver implements QueryInterface
{
    public function __construct(private readonly UserIdentificationCodeRepository $repository)
    {
    }

    public function __invoke(UserIdentificationCodeList $list): int
    {
        return $this->repository->countCodeUsedInList($list);
    }
}
