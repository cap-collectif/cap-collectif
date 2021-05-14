<?php

namespace Capco\UserBundle\OpenID\Mapping;

class EdfMapping implements MappingInterface
{
    public function getPaths(): array
    {
        return [
            'identifier' => 'sub',
            'email' => 'email',
            'nickname' => ['givenName'],
        ];
    }
}
