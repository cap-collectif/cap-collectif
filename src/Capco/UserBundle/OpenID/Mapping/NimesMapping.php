<?php

namespace Capco\UserBundle\OpenID\Mapping;

class NimesMapping implements MappingInterface
{
    /**
     * @return array<string, array<int, string>|string>
     */
    public function getPaths(): array
    {
        return [
            'identifier' => 'sub',
            'email' => 'upn',
            'nickname' => ['name'],
        ];
    }
}
