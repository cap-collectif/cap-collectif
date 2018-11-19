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
final class InternalMutationType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'Mutation';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'Mutation',
            'description' => null,
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
                'addSourceVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddSourceVotePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddSourceVoteInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddSourceVoteMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'addCommentVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddCommentVotePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddCommentVoteInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddCommentVoteMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'addArgument' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddArgumentPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddArgumentInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddArgumentMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'addArgumentVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddArgumentVotePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddArgumentVoteInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddArgumentVoteMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'addSource' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddSourcePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddSourceInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddSourceMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'addVersion' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddVersionPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddVersionInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddVersionMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'changeArgument' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeArgumentPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeArgumentInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\ChangeArgumentMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'changeVersion' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeVersionPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeVersionInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\ChangeVersionMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'changeSource' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeSourcePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeSourceInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\ChangeSourceMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'deleteArgument' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DeleteArgumentPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteArgumentInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\DeleteArgumentMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'deleteComment' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DeleteCommentPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteCommentInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\DeleteCommentMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'deleteSource' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DeleteSourcePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteSourceInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\DeleteSourceMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'deleteOpinion' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DeleteOpinionPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteOpinionInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\DeleteOpinionMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'deleteVersion' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DeleteVersionPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteVersionInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\DeleteVersionMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'addReply' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddReplyPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddReplyInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddReplyMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'updateReply' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateReplyPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateReplyInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateReplyMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'deleteReply' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DeleteReplyPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteReplyInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\DeleteReplyMutation", array(0 => $value["id"], 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'changeUserNotificationsConfiguration' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeUserNotificationsConfigurationPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeUserNotificationsConfigurationInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["changeUserNotificationsConfiguration", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'addOpinionVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddOpinionVotePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddOpinionVoteInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddOpinionVoteMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), 2 => $globalVariable->get('container')->get("request_stack"))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'removeOpinionVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('RemoveOpinionVotePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('RemoveOpinionVoteInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\RemoveOpinionVoteMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'removeArgumentVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('RemoveArgumentVotePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('RemoveArgumentVoteInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\RemoveArgumentVoteMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'removeCommentVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('RemoveCommentVotePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('RemoveCommentVoteInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\RemoveCommentVoteMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'removeSourceVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('RemoveSourceVotePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('RemoveSourceVoteInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\RemoveSourceVoteMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'addProposalVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddProposalVotePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddProposalVoteInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddProposalVoteMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), 2 => $globalVariable->get('container')->get("request_stack"))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'removeProposalVote' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('RemoveProposalVotePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('RemoveProposalVoteInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\RemoveProposalVoteMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'updateProposalVotes' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateProposalVotesPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateProposalVotesInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateProposalVotesMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'requestUserArchive' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('RequestUserArchivePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('RequestUserArchiveInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\RequestUserArchiveMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'changeProposalPublicationStatus' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeProposalPublicationStatusPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeProposalPublicationStatusInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["changeProposalPublicationStatus", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'changeProposalContent' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeProposalContentPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeProposalContentInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["changeProposalContent", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'createProposal' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('CreateProposalPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('CreateProposalInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["createProposal", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'createProposalFusion' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('CreateProposalFusionPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('CreateProposalFusionInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\CreateProposalFusionMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'updateProposalFusion' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateProposalFusionPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateProposalFusionInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateProposalFusionMutation", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'changeProposalNotation' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeProposalNotationPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeProposalNotationInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["changeProposalNotation", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'changeProposalEvaluers' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeProposalEvaluersPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeProposalEvaluersInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["changeProposalEvaluers", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'followProposal' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('FollowProposalPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('FollowProposalInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\FollowProposalMutation", array(0 => $value["proposalId"], 1 => $value["notifiedOf"], 2 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'followOpinion' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('FollowOpinionPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('FollowOpinionInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\FollowOpinionMutation", array(0 => $value["opinionId"], 1 => $value["notifiedOf"], 2 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'updateFollowProposal' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateFollowProposalPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateFollowProposalInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateFollowProposalMutation", array(0 => $value["proposalId"], 1 => $value["notifiedOf"], 2 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'updateFollowOpinion' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateFollowOpinionPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateFollowOpinionInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateFollowOpinionMutation", array(0 => $value["opinionId"], 1 => $value["notifiedOf"], 2 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'unfollowProposal' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UnfollowProposalPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UnfollowProposalInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UnfollowProposalMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'unfollowOpinion' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UnfollowOpinionPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UnfollowOpinionInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UnfollowOpinionMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'selectProposal' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('SelectProposalPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('SelectProposalInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["selectProposal", array(0 => $value["proposalId"], 1 => $value["stepId"], 2 => $value["statusId"])]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'unselectProposal' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UnselectProposalPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UnselectProposalInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["unselectProposal", array(0 => $value["proposalId"], 1 => $value["stepId"])]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'changeSelectionStatus' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeSelectionStatusPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeSelectionStatusInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["changeSelectionStatus", array(0 => $value["proposalId"], 1 => $value["stepId"], 2 => $value["statusId"])]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'changeCollectStatus' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeCollectStatusPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeCollectStatusInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["changeCollectStatus", array(0 => $value["proposalId"], 1 => $value["statusId"])]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'changeProposalProgressSteps' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeProposalProgressStepsPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeProposalProgressStepsInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["changeProgressSteps", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'deleteProposal' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DeleteProposalPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteProposalInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\DeleteProposalMutation", array(0 => $value["proposalId"], 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return ($globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_SUPER_ADMIN") || ($globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER") && $globalVariable->get('container')->get("Capco\\AppBundle\\Helper\\ProposalHelper")->isAuthor($args["input"]["proposalId"], \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))));
                    },
                ],
                'updateRegistrationForm' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateRegistrationFormQuestionsPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateRegistrationFormQuestionsInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateRegistrationFormQuestionsMutation", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_SUPER_ADMIN");
                    },
                ],
                'createProposalForm' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('CreateProposalFormPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('CreateProposalFormInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["createProposalForm", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'changeDistrict' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeDistrictPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeDistrictInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["changeDistrict", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'updateProposalForm' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateProposalFormPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateProposalFormInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateProposalFormMutation", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'updateProposalFormNotificationsConfiguration' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateProposalFormNotificationsConfigurationPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateProposalFormNotificationsConfigurationInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["updateProposalFormNotificationsConfiguration", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'setEvaluationFormInProposalForm' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('SetEvaluationFormInProposalFormPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('SetEvaluationFormInProposalFormInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["setEvaluationFormInProposalForm", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'changeProposalEvaluation' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('ChangeProposalEvaluationPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ChangeProposalEvaluationInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["changeProposalEvaluation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'createGroup' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('CreateGroupPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('CreateGroupInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["createGroup", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'updateGroup' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateGroupPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateGroupInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["updateGroup", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'deleteGroup' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DeleteGroupPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteGroupInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["deleteGroup", array(0 => $value["groupId"])]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'deleteUserInGroup' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DeleteUserInGroupPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteUserInGroupInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["deleteUserInGroup", array(0 => $value["userId"], 1 => $value["groupId"])]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'addUsersInGroup' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddUsersInGroupPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddUsersInGroupInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["addUsersInGroup", array(0 => $value["users"], 1 => $value["groupId"])]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'updateProfile' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateProfilePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateProfileInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateProfileMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'updateProfilePassword' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateProfilePasswordPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateProfilePasswordInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateProfilePasswordMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return ($globalVariable->get('container')->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED') || $globalVariable->get('container')->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY'));
                    },
                ],
                'updateProfilePersonalData' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateProfilePersonalDataPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateProfilePersonalDataInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateProfilePersonalDataMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'updateProfilePublicData' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateProfilePublicDataPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateProfilePublicDataInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateProfilePublicDataMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context, array(0 => "ROLE_SUPER_ADMIN"));
                    },
                ],
                'deleteAccount' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DeleteAccountPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DeleteAccountInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\DeleteAccountMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'updateRequirement' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateRequirementPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateRequirementInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateRequirementMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'createUser' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('CreateUserPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('CreateUserInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\CreateUserMutation", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'updateUserAccount' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateUserAccountPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateUserAccountInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateUserAccountMutation", array(0 => $value, 1 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'addUsersToGroupFromEmail' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('AddUsersToGroupFromEmailPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('AddUsersToGroupFromEmailInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\AddUsersToGroupFromEmailMutation", array(0 => $value["emails"], 1 => $value["dryRun"], 2 => $value["groupId"])]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'createQuestionnaire' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('CreateQuestionnairePayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('CreateQuestionnaireInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\CreateQuestionnaireMutation", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'updateQuestionnaireParameters' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateQuestionnaireParametersPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateQuestionnaireParametersInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateQuestionnaireParametersMutation", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
                ],
                'updateQuestionnaireConfiguration' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UpdateQuestionnaireConfigurationPayload'),
                    'args' => [
                        [
                            'name' => 'input',
                            'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UpdateQuestionnaireConfigurationInput')),
                            'description' => null,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["relay_mutation_field", array(0 => $args, 1 => $context, 2 => $info, 3 => function ($value) use ($globalVariable, $args, $context, $info) { return $globalVariable->get('mutationResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Mutation\\UpdateQuestionnaireConfigurationMutation", array(0 => $value)]); })]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_ADMIN");
                    },
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
