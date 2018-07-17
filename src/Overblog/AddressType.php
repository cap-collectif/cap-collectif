<?php
namespace Overblog\GraphQLBundle\__DEFINITIONS__;

use Overblog\GraphQLBundle\Definition\Type\CustomScalarType;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class AddressType extends CustomScalarType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'Address',
                'description' => null,
                'scalarType' => null,
                'serialize' =>
                    function () use ($globalVariable) {
                        return call_user_func_array(
                            ['Capco\\AppBundle\\GraphQL\\Type\\AddressType', 'serialize'],
                            func_get_args()
                        );
                    },
                'parseValue' =>
                    function () use ($globalVariable) {
                        return call_user_func_array(
                            ['Capco\\AppBundle\\GraphQL\\Type\\AddressType', 'parseValue'],
                            func_get_args()
                        );
                    },
                'parseLiteral' =>
                    function () use ($globalVariable) {
                        return call_user_func_array(
                            ['Capco\\AppBundle\\GraphQL\\Type\\AddressType', 'parseLiteral'],
                            func_get_args()
                        );
                    },
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
