<?php

namespace Capco\AppBundle\GraphQL\Resolver\AppearanceSettings;

use Capco\AppBundle\Repository\SiteColorRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class AppearanceColorsQueryResolver implements QueryInterface
{
    public function __construct(private readonly SiteColorRepository $repository)
    {
    }

    /** @return array<int, object> */
    public function __invoke(): array
    {
        return $this->repository->findBy(['category' => 'settings.appearance'], ['position' => 'ASC', 'id' => 'ASC']);
    }
}
