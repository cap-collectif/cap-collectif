<?php

namespace Capco\UserBundle\OpenID\Mapping;

class DecathlonMapping implements MappingInterface
{
    public function getPaths(): array
    {
        return [
            'identifier' => 'sub',
            'email' => 'mail',
            'nickname' => 'displayName',
        ];
    }
}
