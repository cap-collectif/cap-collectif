<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use ZxcvbnPhp\Zxcvbn;

class RegistrationValidationResolver implements ResolverInterface
{
    public function __invoke(Argument $args): int
    {
        $password = $args->offsetGet('password');
        $userData = [$args->offsetGet('username'), $args->offsetGet('email')];
        $zxcvbn = new Zxcvbn();
        $strength = $zxcvbn->passwordStrength($password, $userData);

        return $strength['score'] ?? -1;
    }
}
