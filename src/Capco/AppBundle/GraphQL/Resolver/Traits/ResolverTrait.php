<?php

namespace Capco\AppBundle\GraphQL\Resolver\Traits;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserWarning;

trait ResolverTrait
{
    private function protectArguments(Argument $args): void
    {
        if ($args->offsetExists('first')) {
            if ($args->offsetGet('first') > 100) {
                $args->offsetSet('first', 100);
            }
        }
        if ($args->offsetExists('last')) {
            if ($args->offsetGet('last') > 100) {
                $args->offsetSet('last', 100);
            }
        }
    }

    private function preventNullableViewer($viewer): User
    {
        if (!$viewer) {
            throw new UserWarning('Cannot call this resolver with a nullable viewer.');
        }

        if (\is_string($viewer)) {
            throw new UserWarning('Cannot call this resolver with anonymous user.');
        }

        return $viewer;
    }
}
