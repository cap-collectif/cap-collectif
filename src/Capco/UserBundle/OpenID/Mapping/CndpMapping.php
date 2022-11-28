<?php

namespace Capco\UserBundle\OpenID\Mapping;

class CndpMapping implements MappingInterface
{
    public function getPaths(): array
    {
        return [
            'identifier' => 'sub',
            'email' => 'email',
            'nickname' => 'name',
        ];
    }
}
