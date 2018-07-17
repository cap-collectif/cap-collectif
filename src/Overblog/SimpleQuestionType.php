<?php
namespace Overblog\GraphQLBundle\__DEFINITIONS__;

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
final class SimpleQuestionType extends ObjectType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'SimpleQuestion',
                'description' => 'A simple question',
                'fields' =>
                    function () use ($globalVariable) {
                        return [
                            'id' => [
                                'type' => Type::nonNull(Type::string()),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'title' => [
                                'type' => Type::nonNull(Type::string()),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'type' => [
                                'type' =>
                                    Type::nonNull(
                                        $globalVariable
                                            ->get('typeResolver')
                                            ->resolve('QuestionTypeValue')
                                    ),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve(["question_type", array(0 => $value)]);
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'position' => [
                                'type' => Type::nonNull(Type::int()),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve(["question_position", array(0 => $value)]);
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'private' => [
                                'type' => Type::nonNull(Type::boolean()),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'required' => [
                                'type' => Type::nonNull(Type::boolean()),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'helpText' => [
                                'type' => Type::string(),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'description' => [
                                'type' => Type::string(),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'kind' => [
                                'type' => Type::nonNull(Type::string()),
                                'args' => [],
                                'resolve' =>
                                    function () use ($globalVariable) {
                                        return 'simple';
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'isOtherAllowed' => [
                                'type' => Type::nonNull(Type::boolean()),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve([
                                                "question_isOtherAllowed",
                                                array(0 => $value),
                                            ]);
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'choices' => [
                                'type' =>
                                    Type::listOf(
                                        Type::nonNull(
                                            $globalVariable
                                                ->get('typeResolver')
                                                ->resolve('QuestionChoice')
                                        )
                                    ),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve(["question_choices", array(0 => $value)]);
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'validationRule' => [
                                'type' =>
                                    $globalVariable
                                        ->get('typeResolver')
                                        ->resolve('MultipleChoiceQuestionValidationRule'),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve([
                                                "question_validation_rule",
                                                array(0 => $value),
                                            ]);
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'slug' => [
                                'type' => Type::nonNull(Type::string()),
                                'args' => [],
                                'resolve' => null,
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                        ];
                    },
                'interfaces' =>
                    function () use ($globalVariable) {
                        return [$globalVariable->get('typeResolver')->resolve('Question')];
                    },
                'isTypeOf' => null,
                'resolveField' => null,
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
