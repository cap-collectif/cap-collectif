<?php

namespace Capco\AppBundle\Twig;

use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class GlobalIdExtension extends \Twig_Extension
{
    public function getFilters(): array
    {
        return [
            'toGlobalId' => new \Twig_SimpleFilter($this, 'toGlobalId'),
        ];
    }

    public function toGlobalId(string $id, string $type): string
    {
        return GlobalId::toGlobalId($type, $id);
    }
}
