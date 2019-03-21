<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\Helper\GeometryHelper;
use Capco\AppBundle\Repository\AbstractQuestionRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Definition\Argument;

class QuestionResolver implements ResolverInterface
{
    private $abstractQuestionRepository;
    private $proposalFormRepository;
    private $questionnaireRepository;

    public function __construct(
        AbstractQuestionRepository $abstractQuestionRepository,
        ProposalFormRepository $proposalFormRepository,
        QuestionnaireRepository $questionnaireRepository
    ) {
        $this->questionnaireRepository = $questionnaireRepository;
        $this->abstractQuestionRepository = $abstractQuestionRepository;
        $this->proposalFormRepository = $proposalFormRepository;
    }

    public function resolveType(AbstractQuestion $question): string
    {
        return $question->getType();
    }

    public function resolve(Argument $args): AbstractQuestion
    {
        return $this->abstractQuestionRepository->find($args['id']);
    }

    public function resolveDistrictsForLocalisation(
        string $proposalFormId,
        float $latitude,
        float $longitude
    ): array {
        $form = $this->proposalFormRepository->find($proposalFormId);
        $districts = $form->getDistricts();

        return $form->isProposalInAZoneRequired()
            ? $districts
                ->filter(function ($district) use ($longitude, $latitude) {
                    return $district->getGeojson() &&
                        GeometryHelper::isIncluded($longitude, $latitude, $district->getGeojson());
                }, [])
                ->toArray()
            : $districts->toArray();
    }

    public function resolvePosition(AbstractQuestion $question): int
    {
        return $question->getQuestionnaireAbstractQuestion()->getPosition();
    }

    public function resolveisOtherAllowed(AbstractQuestion $question): bool
    {
        if ($question instanceof MultipleChoiceQuestion) {
            return $question->isOtherAllowed();
        }

        return false;
    }

    public function resolveValidationRule(AbstractQuestion $question)
    {
        if ($question instanceof MultipleChoiceQuestion) {
            return $question->getValidationRule();
        }

        return null;
    }

    public function resolveAvailableQuestionnaires()
    {
        return $this->questionnaireRepository->getAvailableQuestionnaires();
    }

    public function resolveQuestionnaireQuestions(Questionnaire $questionnaire)
    {
        $questions = $questionnaire->getRealQuestions()->toArray();
        usort($questions, function ($a, $b) {
            return $a->getQuestionnaireAbstractQuestion()->getPosition() <=>
                $b->getQuestionnaireAbstractQuestion()->getPosition();
        });

        return $questions;
    }

    public function resolveQuestionnaireOpen(Questionnaire $questionnaire): bool
    {
        return $questionnaire->canContribute();
    }

    public function resolveQuestionnairePhoneConfirmationRequired(
        Questionnaire $questionnaire
    ): bool {
        return $questionnaire->isPhoneConfirmationRequired();
    }
}
