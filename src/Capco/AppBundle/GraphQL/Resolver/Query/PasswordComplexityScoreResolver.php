<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use ZxcvbnPhp\Zxcvbn;

class PasswordComplexityScoreResolver implements ResolverInterface
{
    public function __invoke(Argument $args): int
    {
        $password = $args->offsetGet('password');
        $userData = [$args->offsetGet('email')];
        if (!empty($args->offsetGet('username'))) {
            array_push($userData, $args->offsetGet('username'));
        }
        $zxcvbn = new Zxcvbn();
        $strength = $zxcvbn->passwordStrength($password, $userData);

        return $strength['score'] ?? 0;
    }
}
