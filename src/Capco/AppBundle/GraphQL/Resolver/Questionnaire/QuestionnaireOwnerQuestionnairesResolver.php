<?php

namespace Capco\AppBundle\GraphQL\Resolver\Questionnaire;

use Capco\AppBundle\Enum\QuestionnaireOrderField;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Repository\QuestionnaireRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

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

        $paginator = new Paginator(function (?int $offset, ?int $limit) use (
            $affiliations,
            $query,
            $orderByField,
            $orderByDirection,
            $viewer,
            $availableOnly
        ) {
            return $this->questionnaireRepository->getAll(
                $offset,
                $limit,
                $affiliations,
                $viewer,
                $query,
                $orderByField,
                $orderByDirection,
                $availableOnly
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
            $availableOnly
        );

        return $paginator->auto($args, $totalCount);
    }
}
