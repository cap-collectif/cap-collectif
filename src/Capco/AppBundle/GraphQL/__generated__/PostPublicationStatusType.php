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
final class PostPublicationStatusType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'PostPublicationStatus';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'PostPublicationStatus',
            'values' => [
                'PUBLISHED' => [
                    'name' => 'PUBLISHED',
                    'value' => 'PUBLISHED',
                    'deprecationReason' => null,
                    'description' => 'Normal status, publicly visible',
                ],
                'NOT_PUBLISHED' => [
                    'name' => 'NOT_PUBLISHED',
                    'value' => 'NOT_PUBLISHED',
                    'deprecationReason' => null,
                    'description' => 'Not publicly visible',
                ],
            ],
            'description' => 'Available statuses',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
