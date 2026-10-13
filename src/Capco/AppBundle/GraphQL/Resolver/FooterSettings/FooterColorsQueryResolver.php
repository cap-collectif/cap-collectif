<?php

namespace Capco\AppBundle\GraphQL\Resolver\FooterSettings;

use Capco\AppBundle\Repository\SiteColorRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class FooterColorsQueryResolver implements QueryInterface
{
    public function __construct(private readonly SiteColorRepository $repository)
    {
    }

    /** @return array<int, object> */
    public function __invoke(): array
    {
        return $this->repository->findBy(['category' => 'pages.footer'], ['position' => 'ASC', 'id' => 'ASC']);
    }
}
