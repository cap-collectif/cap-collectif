<?php

namespace Capco\AppBundle\Twig;

use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Twig\TwigFilter;

class GlobalIdExtension extends \Twig_Extension
{
    public function getFilters(): array
    {
        return [new TwigFilter('toGlobalId', [$this, 'toGlobalId'])];
    }

    public function toGlobalId(string $id, string $type): string
    {
        return GlobalId::toGlobalId($type, $id);
    }
}
