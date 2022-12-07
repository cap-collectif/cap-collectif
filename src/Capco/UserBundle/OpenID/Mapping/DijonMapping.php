<?php

namespace Capco\UserBundle\OpenID\Mapping;

class DijonMapping implements MappingInterface
{
    public function getPaths(): array
    {
        return [
            'identifier' => 'email',
            'email' => 'email',
        ];
    }
}
