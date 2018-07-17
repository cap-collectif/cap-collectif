<?php
namespace Overblog\GraphQLBundle\__DEFINITIONS__;

use GraphQL\Type\Definition\EnumType;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class ProposalPublicationStatusType extends EnumType implements GeneratedTypeInterface
{
    public function __construct(
        ConfigProcessor $configProcessor,
        GlobalVariables $globalVariables = null
    ) {
        $configLoader = function (GlobalVariables $globalVariable) {
            return [
                'name' => 'ProposalPublicationStatus',
                'values' => [
                    'EXPIRED' => [
                        'name' => 'EXPIRED',
                        'value' => 'EXPIRED',
                        'deprecationReason' => null,
                        'description' => 'Was publicly visible, but has expired.',
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
                    'DELETED' => [
                        'name' => 'DELETED',
                        'value' => 'DELETED',
                        'deprecationReason' => null,
                        'description' => 'Not publicly visible, deleted by author',
                    ],
                    'DRAFT' => [
                        'name' => 'DRAFT',
                        'value' => 'DRAFT',
                        'deprecationReason' => null,
                        'description' => 'Draft, not publicly visible, only showed for his author.',
                    ],
                    'NOT_ACCOUNTED' => [
                        'name' => 'NOT_ACCOUNTED',
                        'value' => 'NOT_ACCOUNTED',
                        'deprecationReason' => null,
                        'description' => 'Visible only by the author, he is not yet confirmed !',
                    ],
                ],
                'description' => 'Available statuses',
            ];
        };
        $config = $configProcessor
            ->process(LazyConfig::create($configLoader, $globalVariables))
            ->load();
        parent::__construct($config);
    }
}
