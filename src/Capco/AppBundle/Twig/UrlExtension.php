<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class UrlExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        return [
            new TwigFilter('usort', [UrlRuntime::class, 'getUsort']),
            new TwigFilter('graphql_description', [UrlRuntime::class, 'formatDescription']),
            new TwigFilter('capco_url', [UrlRuntime::class, 'getObjectUrl']),
            new TwigFilter('capco_admin_url', [UrlRuntime::class, 'getAdminObjectUrl']),
            new TwigFilter('capco_developer_type_url', [UrlRuntime::class, 'getDeveloperTypeUrl']),
        ];
    }
}
