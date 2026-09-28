<?php

namespace Capco\AppBundle\GraphQL\Resolver\ThemeSettings;

use Capco\AppBundle\Repository\SiteImageRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ThemeSettingsImageQueryResolver implements QueryInterface
{
    public function __construct(private readonly SiteImageRepository $repository)
    {
    }

    /**
     * @return array<int, object>
     */
    public function __invoke(): array
    {
        return $this->repository->findBy(['category' => 'pages.themes'], ['position' => 'ASC']);
    }
}
