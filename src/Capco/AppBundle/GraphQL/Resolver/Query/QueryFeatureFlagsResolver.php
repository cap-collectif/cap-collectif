<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QueryFeatureFlagsResolver implements QueryInterface
{
    private readonly Manager $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    public function __invoke(): array
    {
        return array_map(function (string $key) {
            return [
                'type' => $key,
                'enabled' => $this->toggleManager->isActive($key),
            ];
        }, Manager::$toggles);
    }
}
