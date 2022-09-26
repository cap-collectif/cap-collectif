<?php

namespace Capco\UserBundle\OpenID\Mapping;

class ParisMapping implements MappingInterface
{
    public function getPaths(): array
    {
        return [
            'profilepicture' => null,
            'identifier' => 'sub',
            'email' => 'mail',
            'firstname' => 'identity.attributes.first_name.value',
            'lastname' => 'identity.attributes.family_name.value',
            'nickname' => [
                'identity.attributes.first_name.value',
                'identity.attributes.family_name.value',
            ],
        ];
    }
}
