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
final class AddUsersToGroupFromEmailPayloadType extends ObjectType implements GeneratedTypeInterface
{
    const NAME = 'AddUsersToGroupFromEmailPayload';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'AddUsersToGroupFromEmailPayload',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'importedUsers' => [
                    'type' => Type::nonNull(Type::listOf($globalVariable->get('typeResolver')->resolve('InternalUser'))),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'List of imported users.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'notFoundEmails' => [
                    'type' => Type::nonNull(Type::listOf($globalVariable->get('typeResolver')->resolve('Email'))),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'List of emails that didn\'t match an existing user.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'alreadyImportedUsers' => [
                    'type' => Type::nonNull(Type::listOf($globalVariable->get('typeResolver')->resolve('InternalUser'))),
                    'args' => [
                    ],
                    'resolve' => null,
                    'description' => 'If an email from your list is already associated to a user who is in the chosen group, it will be in this field.',
                    'deprecationReason' => null,
                    'complexity' => null,
                    # public and access are custom options managed only by the bundle
                    'public' => null,
                    'access' => null,
                ],
                'clientMutationId' => [
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
