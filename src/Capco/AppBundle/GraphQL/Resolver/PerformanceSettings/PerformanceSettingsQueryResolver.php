<?php

namespace Capco\AppBundle\GraphQL\Resolver\PerformanceSettings;

use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class PerformanceSettingsQueryResolver implements QueryInterface
{
    public function __construct(private readonly SiteParameterRepository $repository)
    {
    }

    /**
     * @return SiteParameter[]
     */
    public function __invoke(): array
    {
        return $this->repository->findBy(['category' => 'settings.performance'], ['position' => 'ASC']);
    }
}
