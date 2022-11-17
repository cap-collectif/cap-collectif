<?php

namespace Capco\UserBundle\OpenID\Mapping;

class AixMarseilleUnivMapping implements MappingInterface
{
    public function getPaths(): array
    {
        return [
            'identifier' => 'sub',
            'email' => 'email',
            'nickname' => 'nickname',
        ];
    }
}
