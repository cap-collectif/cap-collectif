<?php

namespace Capco\AppBundle\GraphQL\Resolver\QuestionChoice;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\Search\ResponseSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class OtherQuestionChoiceResponseResolver implements QueryInterface
{
    public function __construct(
        private readonly ResponseSearch $responseSearch,
        private readonly QuestionnaireResultsAccessResolver $resultsAccess
    ) {
    }

    public function __invoke(MultipleChoiceQuestion $question, Arg $args, ?User $viewer = null, ?\ArrayObject $context = null): ConnectionInterface
    {
        if (!$this->resultsAccess->canViewQuestionResults($question, $context)) {
            return ConnectionBuilder::empty();
        }

        $paginator = new ElasticsearchPaginator(
            fn (?string $cursor, int $limit) => $this->responseSearch->getOtherReponsesByQuestion($question, $limit, $cursor)
        );

        return $paginator->auto($args);
    }
}
