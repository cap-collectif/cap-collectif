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
final class ChangeProposalContentInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'ChangeProposalContentInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'ChangeProposalContentInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'id' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => 'The proposal id',
                ],
                'draft' => [
                    'type' => Type::boolean(),
                    'description' => 'Pass \'true\' to keep your proposal in draft state, otherwise we admit that you want to publish it.',
                ],
                'title' => [
                    'type' => Type::string(),
                    'description' => 'The new proposal title',
                ],
                'body' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('HTML'),
                    'description' => 'The new proposal body',
                ],
                'summary' => [
                    'type' => Type::string(),
                    'description' => 'The new proposal summary',
                ],
                'author' => [
                    'type' => Type::id(),
                    'description' => 'The author id (ROLE_SUPER_ADMIN allowed only)',
                ],
                'theme' => [
                    'type' => Type::string(),
                    'description' => 'The theme id (feature themes enabled)',
                ],
                'category' => [
                    'type' => Type::string(),
                    'description' => 'The category id',
                ],
                'district' => [
                    'type' => Type::string(),
                    'description' => 'The district id (feature districts enabled)',
                ],
                'address' => [
                    'type' => $globalVariable->get('typeResolver')->resolve('Address'),
                    'description' => 'The address geocoded by google',
                ],
                'responses' => [
                    'type' => Type::listOf($globalVariable->get('typeResolver')->resolve('ResponseInput')),
                    'description' => 'The custom fields responses',
                ],
                'media' => [
                    'type' => Type::id(),
                    'description' => 'Current media id',
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
