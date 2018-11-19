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
final class CreateProposalInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'CreateProposalInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'CreateProposalInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'proposalFormId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The id of the form form proposal',
                ],
                'draft' => [
                    'type' => Type::boolean(),
                    'description' => 'If true will create a draft proposal, otherwise a published proposal.',
                ],
                'title' => [
                    'type' => Type::string(),
                    'description' => 'The proposal title',
                ],
                'body' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('HTML'),
                    'description' => 'The proposal body',
                ],
                'summary' => [
                    'type' => Type::string(),
                    'description' => 'The proposal summary',
                ],
                'theme' => [
                    'type' => Type::id(),
                    'description' => 'The theme id (feature themes must be enabled)',
                ],
                'category' => [
                    'type' => Type::id(),
                    'description' => 'The category id',
                ],
                'district' => [
                    'type' => Type::id(),
                    'description' => 'The district id (feature districts must be enabled)',
                ],
                'address' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('Address'),
                    'description' => 'The address geocoded by google',
                ],
                'responses' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('ResponseInput')),
                    'description' => 'The responses to the form questions',
                ],
                'media' => [
                    'type' => Type::id(),
                    'description' => 'The media id to illustrate',
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
