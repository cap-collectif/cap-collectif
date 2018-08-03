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
final class ChangeProposalEvaluationInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'ChangeProposalEvaluationInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ChangeProposalEvaluationInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'proposalId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The proposal id',
                ],
                'version' => [
                    'type' => Type::nonNull(Type::int()),
                    'description' => 'The revision number of the evaluation',
                ],
                'responses' => [
                    'type' => Type::nonNull(Type::listOf(Type::nonNull($globalVariable->get('typeResolver')->resolve('ResponseInput')))),
                    'description' => null,
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
