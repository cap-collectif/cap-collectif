<?php

namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionChoiceResponseResolver implements ResolverInterface
{
    private $responseRepository;

    public function __construct(ValueResponseRepository $responseRepository)
    {
        $this->responseRepository = $responseRepository;
    }

    public function __invoke(QuestionChoice $questionChoice, Arg $args): Connection
    {
        $responses = $this->responseRepository->getAllByQuestionWithoutPaginator(
            $questionChoice->getQuestion()
        );
        $totalCount = 0;
        // Responses values are in an array so we can't directly request them. Maybe SQL request with JSON conditions ?
        foreach ($responses as $response) {
            $responseValue = $response ? $response->getValue() : null;
            if ($responseValue) {
                if (isset($responseValue['labels'])) {
                    foreach ($responseValue['labels'] as $label) {
                        if ($label === $questionChoice->getTitle()) {
                            ++$totalCount;
                        }
                    }
                } else {
                    // Question type is select
                    if ($responseValue === $questionChoice->getTitle()) {
                        ++$totalCount;
                    }
                }
            }
        }

        $paginator = new Paginator(function () use ($responses) {
            return $responses;
        });

        return $paginator->auto($args, $totalCount);
    }
}
