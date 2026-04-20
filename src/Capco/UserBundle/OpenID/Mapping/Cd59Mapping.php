<?php

namespace Capco\UserBundle\OpenID\Mapping;

class Cd59Mapping implements MappingInterface
{
    /**
     * Microsoft Entra ID v2 exposes a stable subject in `sub` and the
     * human login in `preferred_username`.
     *
     * @return array<string, array<int, string>|string>
     */
    public function getPaths(): array
    {
        return [
            'identifier' => 'sub',
            'email' => 'preferred_username',
            'firstname' => 'given_name',
            'lastname' => 'family_name',
            'nickname' => 'name',
        ];
    }
}
