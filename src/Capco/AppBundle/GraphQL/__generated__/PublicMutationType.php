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
final class PublicMutationType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'Mutation';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'Mutation',
            'description' => 'Root of the schema.',
            'fields' => function () use ($globalVariable) {
                return [
                'addComment' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddCommentPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddCommentInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddCommentMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), 2 => $globalVariable->get('container')->get("request_stack"))]); })]);
                    },
                    'description' => null,
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
