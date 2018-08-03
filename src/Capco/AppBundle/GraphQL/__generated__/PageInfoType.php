<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class PageInfoType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'PageInfo';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'PageInfo',
            'description' => 'Information about pagination in a connection.',
            'fields' => function () use ($globalVariable) {
                return [
                'hasNextPage' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'When paginating forwards, are there more items?',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'hasPreviousPage' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'When paginating backwards, are there more items?',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'startCursor' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'When paginating backwards, the cursor to continue.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'endCursor' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'When paginating forwards, the cursor to continue.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
            ];
            },
            'interfaces' => function () use ($globalVariable) {
                return [];
            },
            'isTypeOf' => null,
            'resolveField' => null,
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
