<?php

namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\ResponseSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class OtherQuestionChoiceResponseResolver implements ResolverInterface
{
    private ResponseSearch $responseSearch;

    public function __construct(ResponseSearch $responseSearch)
    {
        $this->responseSearch = $responseSearch;
    }

    public function __invoke(MultipleChoiceQuestion $question, Arg $args): ConnectionInterface
    {
        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $question
        ) {
            return $this->responseSearch->getOtherReponsesByQuestion($question, $limit, $cursor);
        });

        return $paginator->auto($args);
    }
}
