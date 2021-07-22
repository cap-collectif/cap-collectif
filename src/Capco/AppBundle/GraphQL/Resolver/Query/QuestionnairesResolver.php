<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Enum\QuestionnaireOrderField;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class QuestionnairesResolver implements ResolverInterface
{
    private LoggerInterface $logger;
    private QuestionnaireRepository $questionnaireRepository;

    public function __construct(
        QuestionnaireRepository $questionnaireRepository,
        LoggerInterface $logger
    ) {
        $this->questionnaireRepository = $questionnaireRepository;
        $this->logger = $logger;
    }

    public function __invoke(?Argument $args = null, User $viewer): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
            ]);
        }

        $query = $args->offsetGet('query');
        $orderByField = QuestionnaireOrderField::SORT_FIELD[$args->offsetGet('orderBy')['field']];
        $orderByDirection = $args->offsetGet('orderBy')['direction'];
        $affiliations = $args->offsetGet('affiliations') ?? [];

        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $affiliations,
            $query,
            $orderByField,
            $orderByDirection,
            $viewer
        ) {
            return $this->questionnaireRepository->getAll(
                $offset,
                $limit,
                $affiliations,
                $viewer,
                $query,
                $orderByField,
                $orderByDirection
            );
        });

        //        $totalCount = count($questionnaires);
        // TODO => TO REMOVE WHEN SWITCHING TO ES
        $totalCount = 10;

        return $paginator->auto($args, $totalCount);
    }
}
