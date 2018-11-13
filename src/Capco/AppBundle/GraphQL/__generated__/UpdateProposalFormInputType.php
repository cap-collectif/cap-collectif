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
final class UpdateProposalFormInputType extends InputObjectType implements GeneratedTypeInterface
{
    const NAME = 'UpdateProposalFormInput';

    public function __construct(ConfigProcessor $configProcessor, GlobalVariables $globalVariables = null)
    {
        $configLoader = function(GlobalVariables $globalVariable) {
            return [
            'name' => 'UpdateProposalFormInput',
            'description' => null,
            'fields' => function () use ($globalVariable) {
                return [
                'proposalFormId' => [
                    'type' => Type::nonNull(Type::id()),
                    'description' => null,
                ],
                'title' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'description' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'summaryHelpText' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'illustrationHelpText' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'usingThemes' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'themeMandatory' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'themeHelpText' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'usingDistrict' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'districtMandatory' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'commentable' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'costable' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'districtHelpText' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'usingCategories' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'categoryMandatory' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'categoryHelpText' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'usingAddress' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'proposalInAZoneRequired' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'titleHelpText' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'descriptionHelpText' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'addressHelpText' => [
                    'type' => Type::string(),
                    'description' => null,
                ],
                'latMap' => [
                    'type' => Type::float(),
                    'description' => null,
                ],
                'lngMap' => [
                    'type' => Type::float(),
                    'description' => null,
                ],
                'zoomMap' => [
                    'type' => Type::int(),
                    'description' => null,
                ],
                'categories' => [
                    'type' => Type::listOf(Type::nonNull($globalVariable->get('typeResolver')->resolve('ProposalCategoryInput'))),
                    'description' => null,
                ],
                'districts' => [
                    'type' => Type::listOf(Type::nonNull($globalVariable->get('typeResolver')->resolve('DistrictInput'))),
                    'description' => null,
                ],
                'questions' => [
                    'type' => Type::listOf(Type::nonNull($globalVariable->get('typeResolver')->resolve('QuestionnaireAbstractQuestionInput'))),
                    'description' => null,
                ],
                'allowAknowledge' => [
                    'type' => Type::boolean(),
                    'description' => null,
                ],
                'isProposalForm' => [
                    'type' => Type::nonNull(Type::boolean()),
                    'description' => 'Proposal form is type of Proposal or Question',
                ],
                'usingDescription' => [
                    'type' => Type::boolean(),
                    'description' => 'Proposal form using description field',
                ],
                'usingIllustration' => [
                    'type' => Type::boolean(),
                    'description' => 'Proposal form using illustration field',
                ],
                'usingSummary' => [
                    'type' => Type::boolean(),
                    'description' => 'Proposal form using summary field',
                ],
                'descriptionMandatory' => [
                    'type' => Type::boolean(),
                    'description' => 'Proposal form is description field is mandatory or not',
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
