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
final class QuestionnaireType extends ObjectType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'Questionnaire',
                'description' => 'Fetches an object given its ID',
                'fields' =>
                    function () use ($globalVariable) {
                        return [
                            'id' => [
                                'type' => Type::nonNull(Type::id()),
                                'args' => [],
                                'resolve' => null,
                                'description' => 'The ID of an object',
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
                            'anonymousAllowed' => [
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
                            'multipleRepliesAllowed' => [
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
                            'contribuable' => [
                                'type' => Type::nonNull(Type::boolean()),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $value->canContribute();
                                    },
                                'description' => 'accept answers or not',
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'phoneConfirmationRequired' => [
                                'type' => Type::nonNull(Type::boolean()),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $value->isPhoneConfirmationRequired();
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' => null,
                            ],
                            'questions' => [
                                'type' =>
                                    Type::nonNull(
                                        Type::listOf(
                                            Type::nonNull(
                                                $globalVariable
                                                    ->get('typeResolver')
                                                    ->resolve('Question')
                                            )
                                        )
                                    ),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve([
                                                "questionnaire_questions",
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
                            'viewerReplies' => [
                                'type' =>
                                    Type::nonNull(
                                        Type::listOf(
                                            Type::nonNull(
                                                $globalVariable
                                                    ->get('typeResolver')
                                                    ->resolve('Reply')
                                            )
                                        )
                                    ),
                                'args' => [],
                                'resolve' =>
                                    function ($value, $args, $context, ResolveInfo $info) use (
                                        $globalVariable
                                    ) {
                                        return $globalVariable
                                            ->get('resolverResolver')
                                            ->resolve([
                                                "Capco\\AppBundle\\GraphQL\\Resolver\\Questionnaire\\QuestionnaireViewerRepliesResolver",
                                                array(
                                                    0 => $value,
                                                    1 =>
                                                        \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser(
                                                            $globalVariable
                                                        ),
                                                ),
                                            ]);
                                    },
                                'description' => null,
                                'deprecationReason' => null,
                                'complexity' => null,
                                # public and access are custom options managed only by the bundle
                                'public' => null,
                                'access' =>
                                    function (
                                        $value,
                                        $args,
                                        $context,
                                        ResolveInfo $info,
                                        $object
                                    ) use ($globalVariable) {
                                        return (
                                            $globalVariable
                                                ->get('container')
                                                ->get('security.authorization_checker')
                                                ->isGranted('IS_AUTHENTICATED_REMEMBERED') ||
                                            $globalVariable
                                                ->get('container')
                                                ->get('security.authorization_checker')
                                                ->isGranted('IS_AUTHENTICATED_FULLY')
                                        );
                                    },
                            ],
                        ];
                    },
                'interfaces' =>
                    function () use ($globalVariable) {
                        return [$globalVariable->get('typeResolver')->resolve('Node')];
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
