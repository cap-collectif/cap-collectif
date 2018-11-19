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
final class QuestionChoiceRankingType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'QuestionChoiceRanking';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'QuestionChoiceRanking',
            'description' => 'The choice ranking',
            'fields' => function () use ($globalVariable) {
                return [
                'position' => [
                    'type' => Type::nonNull(Type::int()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Return the position of the choice',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'responses' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ResponseConnection')),
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
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\QuestionChoice\\QuestionChoiceRankingResponseResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'Select the responses of the c',
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
