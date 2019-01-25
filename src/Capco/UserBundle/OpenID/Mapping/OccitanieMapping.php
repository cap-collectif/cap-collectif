<?php

namespace Capco\UserBundle\OpenID\Mapping;

class OccitanieMapping implements MappingInterface
{
    public function getPaths(): array
    {
        return [
            'identifier' => 'sub',
            'email' => 'email',
            'nickname' => 'preferred_username',
        ];
    }
}
