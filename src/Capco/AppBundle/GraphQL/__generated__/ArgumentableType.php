<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\InterfaceType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class ArgumentableType extends InterfaceType implements GeneratedTypeInterface
{

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'Argumentable',
            'description' => 'An argumentable',
            'fields' => function () use ($globalVariable) {
                return [
                'id' => [
                    'type' => Type::nonNull(Type::id()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'contribuable' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'arguments' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ArgumentConnection')),
                    'args' => [
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => null,
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => null,
                        ],
                        [
                            'name' => 'before',
                            'type' => Type::string(),
                            'description' => null,
                        ],
                        [
                            'name' => 'last',
                            'type' => Type::int(),
                            'description' => null,
                        ],
                        [
                            'name' => 'orderBy',
                            'type' => $globalVariable->get('typeResolver')->resolve('ArgumentOrder'),
                            'description' => null,
                            'defaultValue' => ['field' => 'CREATED_AT', 'direction' => 'DESC'],
                        ],
                        [
                            'name' => 'type',
                            'type' => $globalVariable->get('typeResolver')->resolve('ArgumentValue'),
                            'description' => 'If omitted, returns all arguments. If provided, returns the arguments of this particular type.',
                        ],
                    ],
                    'resolve' => null,
                    'description' => 'The arguments related to the argumentable.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
            ];
            },
            'resolveType' => function ($value, $context, ResolveInfo $info) use ($globalVariable) {
                return $globalVariable->get('resolverResolver')->resolve(["contribution_type", array(0 => $value)]);
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
