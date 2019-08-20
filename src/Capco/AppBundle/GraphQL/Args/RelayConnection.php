<?php

namespace Capco\AppBundle\GraphQL\Args;

use Overblog\GraphQLBundle\Definition\Builder\MappingInterface;

class RelayConnection implements MappingInterface
{
    public function toMappingDefinition(array $config): array
    {
        $defaultLimit = isset($config['defaultLimit']) ? (int) $config['defaultLimit'] : 100;

        return [
            'after' => [
                'type' => 'String',
                'description' =>
                    'Returns the elements in the list that come after the specified cursor.'
            ],
            'first' => [
                'type' => 'Int',
                'description' => 'Returns the first `n` elements from the list.',
                'defaultValue' => $defaultLimit
            ],
            'before' => [
                'type' => 'String',
                'description' =>
                    'Returns the elements in the list that come before the specified cursor.'
            ],
            'last' => [
                'type' => 'Int',
                'description' => 'Returns the last `n` elements from the list.'
            ]
        ];
    }
}
