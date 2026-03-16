<?php

namespace Capco\UserBundle\Jwt;

use ArrayAccess;
use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;

class Jwt
{
    /**
     * @param array<string,Key>|ArrayAccess<string,Key>|Key $keyOrKeyArray
     */
    public function decode(string $jwt, $keyOrKeyArray): \stdClass
    {
        return FirebaseJWT::decode($jwt, $keyOrKeyArray);
    }
}
