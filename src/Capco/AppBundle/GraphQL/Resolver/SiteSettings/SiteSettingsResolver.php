<?php

namespace Capco\AppBundle\GraphQL\Resolver\SiteSettings;

use Capco\AppBundle\Entity\SiteSettings;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\SiteSettingsRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SiteSettingsResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private readonly SiteSettingsRepository $repository
    ) {
    }

    public function __invoke(): SiteSettings
    {
        return $this->repository->findAll()[0] ?? new SiteSettings();
    }
}
