<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\EnumType;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class UserRoleType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'UserRole';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'UserRole',
            'values' => [
                'ROLE_USER' => [
                    'name' => 'ROLE_USER',
                    'value' => 'ROLE_USER',
                    'deprecationReason' => null,
                    'description' => 'Represents a user.',
                ],
                'ROLE_ADMIN' => [
                    'name' => 'ROLE_ADMIN',
                    'value' => 'ROLE_ADMIN',
                    'deprecationReason' => null,
                    'description' => 'Represents an administrator.',
                ],
                'ROLE_SUPER_ADMIN' => [
                    'name' => 'ROLE_SUPER_ADMIN',
                    'value' => 'ROLE_SUPER_ADMIN',
                    'deprecationReason' => null,
                    'description' => 'Represents Cap Collectif account.',
                ],
            ],
            'description' => '3 possible values',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
