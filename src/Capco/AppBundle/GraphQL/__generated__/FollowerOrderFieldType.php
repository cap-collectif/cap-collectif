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
final class FollowerOrderFieldType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'FollowerOrderField';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'FollowerOrderField',
            'values' => [
                'NAME' => [
                    'name' => 'NAME',
                    'value' => 'NAME',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of followers namely.',
                ],
                'FOLLOWED_AT' => [
                    'name' => 'FOLLOWED_AT',
                    'value' => 'FOLLOWED_AT',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of followers by when they were followed.',
                ],
                'RANDOM' => [
                    'name' => 'RANDOM',
                    'value' => 'RANDOM',
                    'deprecationReason' => null,
                    'description' => 'Allows ordering a list of followers randomly.',
                ],
            ],
            'description' => 'Properties by which follower connections can be ordered',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
