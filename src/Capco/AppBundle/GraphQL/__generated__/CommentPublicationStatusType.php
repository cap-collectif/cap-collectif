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
final class CommentPublicationStatusType extends EnumType implements GeneratedTypeInterface
{
    const NAME = 'CommentPublicationStatus';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'CommentPublicationStatus',
            'values' => [
                'UNPUBLISHED' => [
                    'name' => 'UNPUBLISHED',
                    'value' => 'UNPUBLISHED',
                    'deprecationReason' => null,
                    'description' => 'Visible by author only.',
                ],
                'PUBLISHED' => [
                    'name' => 'PUBLISHED',
                    'value' => 'PUBLISHED',
                    'deprecationReason' => null,
                    'description' => 'Normal status, Publicly visible',
                ],
                'TRASHED' => [
                    'name' => 'TRASHED',
                    'value' => 'TRASHED',
                    'deprecationReason' => null,
                    'description' => 'Publicly visible in the trash bin',
                ],
                'TRASHED_NOT_VISIBLE' => [
                    'name' => 'TRASHED_NOT_VISIBLE',
                    'value' => 'TRASHED_NOT_VISIBLE',
                    'deprecationReason' => null,
                    'description' => 'In the trash bin, content not visible',
                ],
            ],
            'description' => 'Available statuses',
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
