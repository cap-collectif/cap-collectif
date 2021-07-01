<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Repository\SenderEmailRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SenderEmailResolver implements ResolverInterface
{
    private SenderEmailRepository $repository;

    public function __construct(SenderEmailRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(): array
    {
        return $this->repository->findAll();
    }
}
