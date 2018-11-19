<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use Overblog\GraphQLBundle\Definition\Type\CustomScalarType;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class CssJSONType extends CustomScalarType implements GeneratedTypeInterface
{
    const NAME = 'CssJSON';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'CssJSON',
            'description' => 'A string containing CSS.',
            'scalarType' => null,
            'serialize' => function () use ($globalVariable) {
                return call_user_func_array(['Capco\\AppBundle\\GraphQL\\Type\\CssJSONType', 'serialize'], func_get_args());
            },
            'parseValue' => function () use ($globalVariable) {
                return call_user_func_array(['Capco\\AppBundle\\GraphQL\\Type\\CssJSONType', 'parseValue'], func_get_args());
            },
            'parseLiteral' => function () use ($globalVariable) {
                return call_user_func_array(['Capco\\AppBundle\\GraphQL\\Type\\CssJSONType', 'parseLiteral'], func_get_args());
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
