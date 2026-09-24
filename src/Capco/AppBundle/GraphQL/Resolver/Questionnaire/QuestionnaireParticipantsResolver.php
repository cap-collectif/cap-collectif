<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Search\ReplySearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionnaireParticipantsResolver implements QueryInterface
{
    public function __construct(
        private readonly ReplySearch $replySearch
    ) {
    }

    public function __invoke(Questionnaire $questionnaire, Arg $args, ?User $viewer = null): ConnectionInterface
    {
        $totalCount = $questionnaire->getStep()
            ? $this->replySearch->countQuestionnaireParticipants($questionnaire->getStep()->getId())
            : 0;

        $paginator = new Paginator(fn () => []);

        return $paginator->auto($args, $totalCount);
    }
}
