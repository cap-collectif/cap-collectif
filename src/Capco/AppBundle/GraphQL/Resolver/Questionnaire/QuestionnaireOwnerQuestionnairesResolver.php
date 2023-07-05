<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Enum\QuestionnaireOrderField;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class QuestionnaireOwnerQuestionnairesResolver implements ResolverInterface
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

    public function __invoke(Argument $args, User $viewer): ConnectionInterface
    {
        $query = $args->offsetGet('query');
        $orderByField = QuestionnaireOrderField::SORT_FIELD[$args->offsetGet('orderBy')['field']];
        $orderByDirection = $args->offsetGet('orderBy')['direction'];
        $affiliations = $args->offsetGet('affiliations') ?? [];
        $availableOnly = $args->offsetGet('availableOnly') ?? null;
        $types = $args->offsetGet('types') ?? null;

        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $affiliations,
            $query,
            $orderByField,
            $orderByDirection,
            $viewer,
            $availableOnly,
            $types
        ) {
            return $this->questionnaireRepository->getAll(
                $offset,
                $limit,
                $affiliations,
                $viewer,
                $query,
                $orderByField,
                $orderByDirection,
                $availableOnly,
                $types
            );
        });

        $totalCount = $this->questionnaireRepository->getAllCount(
            null,
            null,
            $affiliations,
            $viewer,
            $query,
            $orderByField,
            $orderByDirection,
            $availableOnly,
            $types
        );

        return $paginator->auto($args, $totalCount);
    }
}
