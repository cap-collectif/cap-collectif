<?php
namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionChoiceRankingResolver implements ResolverInterface
{
    private $responseRepository;

    public function __construct(AbstractResponseRepository $responseRepository)
    {
        $this->responseRepository = $responseRepository;
    }

    public function __invoke(QuestionChoice $questionChoice): ?array
    {
        if (
            $questionChoice->getQuestion() &&
            'ranking' !== $questionChoice->getQuestion()->getInputType()
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

        return $rankingArray;
    }
}
