<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\SiteColorRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuerySiteColorsResolver implements ResolverInterface
{
    private $repository;

    public function __construct(SiteColorRepository $repository)
    {
        $this->repository = $repository;
    }

    public function __invoke(): array
    {
        return $this->repository->findAll();
    }
}
