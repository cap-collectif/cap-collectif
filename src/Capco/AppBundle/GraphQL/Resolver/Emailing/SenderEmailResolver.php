<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Repository\SenderEmailRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SenderEmailResolver implements QueryInterface
{
    public function __construct(
        private readonly SenderEmailRepository $repository
    ) {
    }

    public function __invoke(?User $viewer = null): array
    {
        return $viewer && $viewer->isAdmin()
            ? $this->repository->findAll()
            : [$this->repository->getDefault()];
    }
}
