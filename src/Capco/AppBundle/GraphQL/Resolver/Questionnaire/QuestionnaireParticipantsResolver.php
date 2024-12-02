<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Search\ReplySearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionnaireParticipantsResolver implements QueryInterface
{
    public function __construct(private readonly ReplySearch $replySearch)
    {
    }

    public function __invoke(Questionnaire $questionnaire, Arg $args): ConnectionInterface
    {
        $totalCount = 0;
        if ($questionnaire->getStep()) {
            $totalCount = $this->replySearch->countQuestionnaireParticipants(
                $questionnaire->getStep()->getId()
            );
        }

        $paginator = new Paginator(fn () => []);

        return $paginator->auto($args, $totalCount);
    }
}
