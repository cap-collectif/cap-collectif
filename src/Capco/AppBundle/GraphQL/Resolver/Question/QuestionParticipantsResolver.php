<?php

namespace Capco\AppBundle\GraphQL\Resolver\Question;

use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Search\ResponseSearch;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionParticipantsResolver implements QueryInterface
{
    public function __construct(private readonly ResponseSearch $responseSearch)
    {
    }

    public function __invoke(AbstractQuestion $question, Arg $args): ConnectionInterface
    {
        $totalCount = $this->responseSearch->countParticipantsByQuestion(
            $question,
            $args->offsetGet('withNotConfirmedUser')
        );

        $paginator = new Paginator(fn () => []);

        return $paginator->auto($args, $totalCount);
    }
}
