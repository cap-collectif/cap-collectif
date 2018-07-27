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
final class NotPublishedReasonType extends EnumType implements GeneratedTypeInterface
{

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'NotPublishedReason',
            'values' => [
                'WAITING_AUTHOR_CONFIRMATION' => [
                    'name' => 'WAITING_AUTHOR_CONFIRMATION',
                    'value' => 'WAITING_AUTHOR_CONFIRMATION',
                    'deprecationReason' => null,
                    'description' => 'Author account isn\'t confirmed yet.',
                ],
                'AUTHOR_NOT_CONFIRMED' => [
                    'name' => 'AUTHOR_NOT_CONFIRMED',
                    'value' => 'AUTHOR_NOT_CONFIRMED',
                    'deprecationReason' => null,
                    'description' => 'Author account isn\'t confirmed and the step has ended.',
                ],
                'AUTHOR_CONFIRMED_TOO_LATE' => [
                    'name' => 'AUTHOR_CONFIRMED_TOO_LATE',
                    'value' => 'ACCOUNT_CONFIRMED_TOO_LATE',
                    'deprecationReason' => null,
                    'description' => 'Author account was confirmed after the step has ended.',
                ],
            ],
            'description' => '3 possible values',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
