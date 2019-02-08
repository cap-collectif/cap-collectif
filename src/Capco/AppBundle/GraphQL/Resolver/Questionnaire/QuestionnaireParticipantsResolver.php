<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Entity\Questionnaire;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class QuestionnaireParticipantsResolver implements ResolverInterface
{
    public function __invoke(Questionnaire $questionnaire, Arg $args): Connection
    {
        $totalCount = 0;
        if ($questionnaire->getStep()) {
            $totalCount = $questionnaire->getStep()->getRepliesCount();
        }

        $paginator = new Paginator(function () {
            return [];
        });

        return $paginator->auto($args, $totalCount);
    }
}
