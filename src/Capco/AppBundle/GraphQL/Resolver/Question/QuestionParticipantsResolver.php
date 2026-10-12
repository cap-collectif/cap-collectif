<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Questionnaire\QuestionnaireResultsAccessResolver;
use Capco\AppBundle\Search\ResponseSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionParticipantsResolver implements QueryInterface
{
    public function __construct(
        private readonly ResponseSearch $responseSearch,
        private readonly QuestionnaireResultsAccessResolver $resultsAccess
    ) {
    }

    public function __invoke(AbstractQuestion $question, Arg $args, ?User $viewer = null, ?\ArrayObject $context = null): ConnectionInterface
    {
        if (!$this->resultsAccess->canViewQuestionResults($question, $context)) {
            return ConnectionBuilder::empty();
        }

        $totalCount = $this->responseSearch->countParticipantsByQuestion(
            $question,
            $args->offsetGet('withNotConfirmedUser')
        );

        $paginator = new Paginator(fn () => []);

        return $paginator->auto($args, $totalCount);
    }
}
