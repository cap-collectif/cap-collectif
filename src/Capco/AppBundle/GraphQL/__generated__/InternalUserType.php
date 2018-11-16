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
final class InternalUserType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'User';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'User',
            'description' => 'A user is an individual\'s account.',
            'fields' => function () use ($globalVariable) {
                return [
                'id' => [
                    'type' => Type::nonNull(Type::id()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The ID of an object',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'url' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('URI'),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["user_show_url", array(0 => $value)]);
                    },
                    'description' => 'The HTTP URL for this user, always `null` if feature toggle `profiles` is disabled.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'username' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The user\'s public name.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'isViewer' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isViewer(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value);
                    },
                    'description' => 'Whether or not this user is the authenticated user.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get('security.authorization_checker')->isGranted("ROLE_USER");
                    },
                ],
                'createdAt' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('DateTime')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Identifies the date and time when the object was created.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'displayName' => [
                    'type' => Type::nonNull(Type::string()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The user\'s public profile name.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'vip' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Whether or not this user is a vip.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'slug' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The user\'s slug (unique).',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'email' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["user_email", array(0 => $value)]);
                    },
                    'description' => 'The user\'s email.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'media' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('Media'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The user\'s public avatar.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'updatedAt' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Identifies the date and time when the object was last updated.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'lastLogin' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Last connection of the user.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'enabled' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Is user is activated.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'notificationsConfiguration' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('UserNotificationsConfiguration')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'A user notifications preferences',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'locked' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'phoneConfirmed' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'phoneConfirmationSentAt' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["user_phoneConfirmationSentAt", array(0 => $value)]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'gender' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('GenderValue'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'firstname' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'lastname' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'dateOfBirth' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'roles' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('UserRole')),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Unattended roles as array.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'rolesText' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["user_rolesText", array(0 => $value)]);
                    },
                    'description' => 'Array of roles converted and translated to string.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'isArchiveDeleted' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserArchiveDeletedResolver", array(0 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]);
                    },
                    'description' => 'Is the personal archive of the user has been deleted',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'isArchiveReady' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserArchiveReadyResolver", array(0 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]);
                    },
                    'description' => 'Is the personal archive of the user is ready?',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'firstArchive' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserArchiveFirstResolver", array(0 => \Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable))]);
                    },
                    'description' => 'Is the personal archive of the user is being asked for the first time?',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'website' => [
                    'type' => Type::string(),
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
                'biography' => [
                    'type' => Type::string(),
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
                'address' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'address2' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'zipCode' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'city' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'phone' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'googleId' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'facebookId' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'samlId' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'opinionsCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'opinionVotesCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'opinionVersionsCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'argumentsCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'argumentVotesCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'proposalsCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'proposalVotesCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'commentVotesCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'votesCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'contributionsToDeleteCount' => [
                    'type' => Type::nonNull(Type::int()),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["user_contributionsToDeleteCount", array(0 => $value)]);
                    },
                    'description' => 'Previsionnal number of contributions who will be totally deleted if the user chose to delete his account.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'sourcesCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'repliesCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'postCommentsCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'eventCommentsCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'projectsCount' => [
                    'type' => Type::nonNull(Type::int()),
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
                'userType' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('UserType'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The type of the person.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'consentExternalCommunication' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Is user accepted the external communication during the registration.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'followingProposals' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ProposalConnection')),
                    'args' => [
                        [
                            'name' => 'orderBy',
                            'type' => Type::string(),
                            'description' => 'Ordering options for followers returning from the connection',
                        ],
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified global ID.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => 'Returns the first n elements from the list.',
                            'defaultValue' => 32,
                        ],
                        [
                            'name' => 'before',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come before the specified global ID.',
                        ],
                        [
                            'name' => 'last',
                            'type' => Type::int(),
                            'description' => 'Returns the last n elements from the list.',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Proposal\\ProposalsFollowedByUserResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'Array of proposals followed by current user.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'followingOpinions' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('OpinionConnection')),
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
                            'name' => 'orderBy',
                            'type' => Type::string(),
                            'description' => 'Ordering options for followers returning from the connection',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Opinion\\OpinionsFollowedByUserResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'Array of opinions followed by current user.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'contributionsCount' => [
                    'type' => Type::nonNull(Type::int()),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Total of contributions count',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'facebookUrl' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Your facebook url',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'twitterUrl' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Your twitter url',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'linkedInUrl' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Your linkedIn url',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'profilePageIndexed' => [
                    'type' => Type::boolean(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Is your profile indexed or not',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'neighborhood' => [
                    'type' => Type::string(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Your localisation',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => function ($value, $args, $context, ResolveInfo $info, $object) use ($globalVariable) {
                        return $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Resolver\\UserIsGrantedResolver")->isGranted(\Overblog\GraphQLBundle\ExpressionLanguage\ExpressionFunction\Security\Helper::getUser($globalVariable), $value, $context);
                    },
                ],
                'proposalVotes' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ProposalVoteConnection')),
                    'args' => [
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified cursor.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => null,
                            'defaultValue' => 100000,
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
                            'name' => 'orderBy',
                            'type' => $globalVariable->get('typeResolver')->resolve('ProposalVotesOrder'),
                            'description' => null,
                            'defaultValue' => ['field' => 'PUBLISHED_AT', 'direction' => 'DESC'],
                        ],
                        [
                            'name' => 'stepId',
                            'type' => Type::id(),
                            'description' => null,
                        ],
                        [
                            'name' => 'includeUnpublished',
                            'type' => Type::boolean(),
                            'description' => '(ROLE_SUPER_ADMIN only) Select also unpublished votes.',
                            'defaultValue' => false,
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\ViewerProposalVotesResolver", array(0 => $value, 1 => $args, 2 => $context)]);
                    },
                    'description' => null,
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'deletedAccountAt' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
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
                'medias' => [
                    'type' => Type::nonNull(Type::listOf($globalVariable->get('typeResolver')->resolve('Media'))),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserMediasResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'Get all medias the user has published.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'votes' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('VoteConnection')),
                    'args' => [
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified cursor.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => null,
                            'defaultValue' => 100000,
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
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserVotesResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'Get all votes of the user.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'groups' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('GroupConnection')),
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
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserGroupsResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'Get all groups where the user is.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'reports' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ReportConnection')),
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
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserReportsResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'Get all reports the user has done.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'events' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('InternalEventConnection')),
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
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserEventsResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'Get all events the user has created.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'contributions' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ContributionConnection')),
                    'args' => [
                        [
                            'name' => 'type',
                            'type' => $globalVariable->get('typeResolver')->resolve('ContributionType'),
                            'description' => 'Type of contribustion requested',
                        ],
                        [
                            'name' => 'after',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come after the specified global ID.',
                        ],
                        [
                            'name' => 'first',
                            'type' => Type::int(),
                            'description' => 'Returns the first n elements from the list.',
                            'defaultValue' => 100,
                        ],
                        [
                            'name' => 'before',
                            'type' => Type::string(),
                            'description' => 'Returns the elements in the list that come before the specified global ID.',
                        ],
                        [
                            'name' => 'last',
                            'type' => Type::int(),
                            'description' => 'Returns the last n elements from the list.',
                        ],
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserContributionResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'Return the user\'s contributions of the type requested.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'isSubscribedToNewsLetter' => [
                    'type' => Type::boolean(),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserNewsLetterResolver", array(0 => $value)]);
                    },
                    'description' => 'Is user subscribed to the newsletter ?',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'subscribedToNewsLetterAt' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserNewsLetterResolver", array(0 => $value, 1 => "at")]);
                    },
                    'description' => 'The user subrscibes to the newsletter at date',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'isEmailConfirmed' => [
                    'type' => Type::boolean(),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'Has the user confirmed his email address ?',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'emailConfirmationSentAt' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('DateTime'),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'The user\'s email was confirmed at date',
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
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\Argument\\ArgumentByUserResolver", array(0 => $value, 1 => $args)]);
                    },
                    'description' => 'The arguments created by user.',
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
                        return $globalVariable->get('resolverResolver')->resolve(["Capco\\AppBundle\\GraphQL\\Resolver\\User\\UserResponsesResolver", array(0 => $value)]);
                    },
                    'description' => 'The responses answered by user.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'show_url' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('URI'),
                    'args' => [
                    ],
                    'resolve' => function ($value, $args, $context, ResolveInfo $info) use ($globalVariable) {
                        return $globalVariable->get('resolverResolver')->resolve(["user_show_url", array(0 => $value)]);
                    },
                    'description' => 'The HTTP URL for this user, null if feature `profiles` is disabled.',
                    'deprecationReason' => $globalVariable->get('container')->get("Capco\\AppBundle\\GraphQL\\Deprecation")->toString(array("startAt" => "2019-01-01", "reason" => "This field does not respect naming consistency.", "supersededBy" => "Use `url` instead.")),
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
            ];
            },
            'interfaces' => function () use ($globalVariable) {
                return [$globalVariable->get('typeResolver')->resolve('Node')];
            },
            'isTypeOf' => null,
            'resolveField' => null,
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
