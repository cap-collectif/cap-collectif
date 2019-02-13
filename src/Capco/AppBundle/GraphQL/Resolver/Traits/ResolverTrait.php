<?php

namespace Capco\AppBundle\GraphQL\Resolver\Traits;

use Overblog\GraphQLBundle\Definition\Argument;

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
}
