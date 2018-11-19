<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class AddUsersToGroupFromEmailInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'AddUsersToGroupFromEmailInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'AddUsersToGroupFromEmailInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'emails' => [
                    'type' => Type::nonNull(Type::listOf(Type::nonNull($globalVariable->get('typeResolver')->resolve('Email')))),
                    'description' => 'A list of email(s).',
                ],
                'dryRun' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => 'This option is useful if you want to test your emails list. Set it to true if you want to import definitively.',
                ],
                'groupId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The Node ID of the group.',
                ],
                'clientMutationId' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
            ];
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
