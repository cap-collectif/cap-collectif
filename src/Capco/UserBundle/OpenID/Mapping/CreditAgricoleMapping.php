<?php

namespace Capco\UserBundle\OpenID\Mapping;

class CreditAgricoleMapping implements MappingInterface
{
    /**
     * @return array<string, null|array<int, string>|string>
     */
    public function getPaths(): array
    {
        return [
            'identifier' => 'sub',
            'email' => 'email',
            'firstname' => 'given_name',
            'lastname' => 'family_name',
            'nickname' => ['given_name', 'family_name'],
        ];
    }
}
