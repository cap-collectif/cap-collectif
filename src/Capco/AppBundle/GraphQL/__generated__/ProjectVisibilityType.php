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
    const NAME = 'ProjectVisibility';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ProjectVisibility',
            'values' => [
                'ADMIN' => [
                    'name' => 'ADMIN',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProjectVisibilityMode::VISIBILITY_ADMIN"),
                    'deprecationReason' => null,
                    'description' => 'visible for group admin',
                ],
                'CUSTOM' => [
                    'name' => 'CUSTOM',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProjectVisibilityMode::VISIBILITY_CUSTOM"),
                    'deprecationReason' => null,
                    'description' => 'the project is restricted to users groups',
                ],
                'ME' => [
                    'name' => 'ME',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProjectVisibilityMode::VISIBILITY_ME"),
                    'deprecationReason' => null,
                    'description' => 'visible for me only',
                ],
                'PUBLIC' => [
                    'name' => 'PUBLIC',
                    'value' => \constant("Capco\\AppBundle\\Enum\\ProjectVisibilityMode::VISIBILITY_PUBLIC"),
                    'deprecationReason' => null,
                    'description' => 'visible for all',
                ],
            ],
            'description' => '4 possible values',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
