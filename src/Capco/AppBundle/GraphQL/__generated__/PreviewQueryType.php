<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\Type;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class PreviewQueryType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'Query';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'Query',
            'description' => 'Root of the schema.',
            'fields' => function () use ($globalVariable) {
                return [
                'viewer' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('PublicUser')),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable);
                    },
                    'description' => 'The currently authenticated user.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'node' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('Node'),
                    'args' => [
                        [
                            'name' => 'id',
                            'type' => Type::nonNull(Type::id()),
                            'description' => 'The ID of an object',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_node_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('resolverResolver')->resolve(["query_node", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => 'The ID of an object.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'nodes' => [
                    'type' => Type::nonNull(Type::listOf($globalVariable->get('typeResolver')->resolve('Node'))),
                    'args' => [
                        [
                            'name' => 'ids',
                            'type' => Type::nonNull(Type::listOf(Type::nonNull(Type::id()))),
                            'description' => 'The list of node IDs.',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["query_nodes", array(0 => $args["ids"], 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]);
                    },
                    'description' => 'Lookup nodes by a list of IDs.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'events' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('PreviewEventConnection')),
                    'args' => [
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified cursor.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => 'Returns the first `n` elements from the list.',
                            'defaultValue' => 100,
                        ],
                        [
                            'name' => 'before',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come before the specified cursor.',
                        ],
                        [
                            'name' => 'last',
                            'type' => Type::int(),
                            'description' => 'Returns the last `n` elements from the list.',
                        ],
                        [
                            'name' => 'isFuture',
                            'type' => Type::boolean(),
                            'description' => 'If non-null, filters events by comparing the start date with present.',
                        ],
                        [
                            'name' => 'theme',
                            'type' => Type::id(),
                            'description' => 'If non-null, filters events with the given theme.',
                        ],
                        [
                            'name' => 'project',
                            'type' => Type::id(),
                            'description' => 'If non-null, filters events with the given project.',
                        ],
                        [
                            'name' => 'author',
                            'type' => Type::id(),
                            'description' => 'If non-null, filters events with the given author.',
                        ],
                        [
                            'name' => 'search',
                            'type' => Type::string(),
                            'description' => 'If non-null, filters events with the given string to look for.',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Query\\QueryEventsResolver", array(0 => $args)]);
                    },
                    'description' => 'Lookup events.',
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
