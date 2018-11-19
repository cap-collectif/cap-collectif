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
final class LogicJumpConditionOperatorType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'LogicJumpConditionOperator';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'LogicJumpConditionOperator',
            'values' => [
                'IS' => [
                    'name' => 'IS',
                    'value' => 'IS',
                    'deprecationReason' => null,
                    'description' => 'Allows to test an equality.',
                ],
                'IS_NOT' => [
                    'name' => 'IS_NOT',
                    'value' => 'IS_NOT',
                    'deprecationReason' => null,
                    'description' => 'Allows to test the opposite of an equality test.',
                ],
            ],
            'description' => 'Possible operator for a logic jump condition',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
