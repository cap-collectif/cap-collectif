<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\SiteColorRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuerySiteColorsResolver implements QueryInterface
{
    public function __construct(
        private readonly SiteColorRepository $repository
    ) {
    }

    public function __invoke(): array
    {
        return $this->repository->findAll();
    }
}
