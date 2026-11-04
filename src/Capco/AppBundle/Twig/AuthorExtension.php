<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

class AuthorExtension extends AbstractExtension
{
    public function getFilters(): array
    {
        // @phpstan-ignore-next-line Twig resolves the instance callable through its runtime loader.
        return [new TwigFilter('capco_author_profile', [AuthorRuntime::class, 'getProfile'])];
    }
}
