<?php

namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Entity\QuestionChoice;
use Capco\AppBundle\Search\ResponseSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionChoiceResponseResolver implements ResolverInterface
{
    private ResponseSearch $responseSearch;

    public function __construct(ResponseSearch $responseSearch)
    {
        $this->responseSearch = $responseSearch;
    }

    public function __invoke(QuestionChoice $questionChoice, Arg $args): ConnectionInterface
    {
        $responses = $this->responseSearch
            ->getResponsesByQuestion($questionChoice->getQuestion(), false, -1)
            ->getEntities();
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
