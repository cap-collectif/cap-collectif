<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryFeatureFlagsResolver implements QueryInterface
{
    public function __construct(
        private readonly Manager $toggleManager
    ) {
    }

    public function __invoke(): array
    {
        return array_map(fn (string $key) => [
            'type' => $key,
            'enabled' => $this->toggleManager->isActive($key),
        ], Manager::$toggles);
    }
}
