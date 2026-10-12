<?php

namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionChoiceRankingResolver implements QueryInterface
{
    public function __construct(
        private readonly AbstractResponseRepository $responseRepository,
        private readonly QuestionnaireResultsAccessResolver $resultsAccess
    ) {
    }

    public function __invoke(QuestionChoice $questionChoice, ?User $viewer = null, ?\ArrayObject $context = null): ?array
    {
        if (!$this->resultsAccess->canViewQuestionResults($questionChoice->getQuestion(), $context)) {
            return [];
        }

        if (
            $questionChoice->getQuestion()
            && 'ranking' !== $questionChoice->getQuestion()->getInputType()
        ) {
            return null;
        }

        $responses = $this->responseRepository->findBy([
            'question' => $questionChoice->getQuestion(),
        ]);
        $rankingArray = [];

        // Responses values are in an array so we can't directly request them. Maybe SQL request with JSON conditions ?
        foreach ($responses as $response) {
            $responseValue = $response ? $response->getValue() : null;
            if ($responseValue && isset($responseValue['labels'])) {
                $position = 0;
                foreach ($responseValue['labels'] as $label) {
                    ++$position;
                    if ($label === $questionChoice->getTitle()) {
                        $rankingArray[$position]['position'] = $position;
                        if (!isset($rankingArray[$position]['responses'])) {
                            $rankingArray[$position]['responses'] = [];
                        }
                        $rankingArray[$position]['responses'][] = $response;
                    }
                }
            }
        }

        usort($rankingArray, fn ($a, $b) => $a['position'] <=> $b['position']);

        return $rankingArray;
    }
}
