<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use ZxcvbnPhp\Zxcvbn;

class PasswordComplexityScoreResolver implements ResolverInterface
{
    private $zxcvbn;

    public function __construct(Zxcvbn $zxcvbn)
    {
        $this->zxcvbn = $zxcvbn;
    }

    public function __invoke(Argument $args): int
    {
        $password = $args->offsetGet('password');
        $userData = [$args->offsetGet('email')];
        if (!empty($args->offsetGet('username'))) {
            $userData[] = $args->offsetGet('username');
        }
        $strength = $this->zxcvbn->passwordStrength($password, $userData);

        return $strength['score'] ?? 0;
    }
}
