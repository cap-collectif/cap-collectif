<?php

namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class QuestionChoiceRankingResolver implements QueryInterface
{
    public function __construct(
        private readonly AbstractResponseRepository $responseRepository
    ) {
    }

    public function __invoke(QuestionChoice $questionChoice): ?array
    {
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
