<?php
namespace Capco\AppBundle\GraphQL\__GENERATED__;

use GraphQL\Type\Definition\InputObjectType;
use GraphQL\Type\Definition\Type;
use Overblog\GraphQLBundle\Definition\ConfigProcessor;
use Overblog\GraphQLBundle\Definition\LazyConfig;
use Overblog\GraphQLBundle\Definition\GlobalVariables;
use Overblog\GraphQLBundle\Definition\Type\GeneratedTypeInterface;

/**
 * THIS FILE WAS GENERATED AND SHOULD NOT BE MODIFIED!
 */
final class ChangeProposalPublicationStatusInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'ChangeProposalPublicationStatusInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ChangeProposalPublicationStatusInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'publicationStatus' => [
                    'type' => Type::nonNull($globalVariable->get('typeResolver')->resolve('ProposalPublicationStatus')),
                    'description' => 'The new publication status',
                ],
                'trashedReason' => [
                    'type' => Type::string(),
                    'description' => 'Added if you set publicationStatus to TRASHED',
                ],
                'proposalId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The proposal id',
                ],
                'clientMutationId' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
            ];
            },
        ];
        };
        $config = $configProcessor->process(LazyConfig::create($configLoader, $globalVariables))->load();
        parent::__construct($config);
    }
}
