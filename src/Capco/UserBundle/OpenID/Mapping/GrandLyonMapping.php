<?php

namespace Capco\UserBundle\OpenID\Mapping;

class GrandLyonMapping implements MappingInterface
{
    public function getPaths(): array
    {
        return [
            'identifier' => 'sub',
            'email' => 'email',
            'nickname' => ['first_name', 'last_name']
        ];
    }
}
