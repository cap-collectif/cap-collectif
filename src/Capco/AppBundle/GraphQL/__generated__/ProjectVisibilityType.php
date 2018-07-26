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
final class ProjectVisibilityType extends EnumType implements GeneratedTypeInterface
{

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ProjectVisibility',
            'values' => [
                'ME' => [
                    'name' => 'ME',
                    'value' => 0,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'ADMIN' => [
                    'name' => 'ADMIN',
                    'value' => 1,
                    'deprecationReason' => null,
                    'description' => null,
                ],
                'PUBLIC' => [
                    'name' => 'PUBLIC',
                    'value' => 2,
                    'deprecationReason' => null,
                    'description' => null,
                ],
            ],
            'description' => '3 possible values',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
