<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginatedResult;
use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Search\OpinionSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ConsultationContributionsResolver implements ResolverInterface
{
    private $opinionRepository;
    private $sourceRepository;
    private $argumentRepository;
    private $opinionVersionRepository;
    private $opinionSearch;

    public function __construct(
        OpinionSearch $opinionSearch,
        OpinionRepository $opinionRepository,
        SourceRepository $sourceRepository,
        ArgumentRepository $argumentRepository,
        OpinionVersionRepository $opinionVersionRepository
    ) {
        $this->opinionRepository = $opinionRepository;
        $this->sourceRepository = $sourceRepository;
        $this->argumentRepository = $argumentRepository;
        $this->opinionVersionRepository = $opinionVersionRepository;
        $this->opinionSearch = $opinionSearch;
    }

    public function __invoke(
        Consultation $consultation,
        Argument $args,
        $viewer
    ): ConnectionInterface {
        $includeTrashed = $args->offsetGet('includeTrashed');
        $totalCount = $this->getConsultationContributionsTotalCount($consultation, $includeTrashed);

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $totalCount,
            $args,
            $consultation,
            $viewer,
            $includeTrashed
        ) {
            if (null === $cursor && 0 === $limit) {
                return new ElasticsearchPaginatedResult([], [], $totalCount);
            }
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $order = OpinionSearch::findOrderFromFieldAndDirection($field, $direction);
            $filters = ['step.id' => $consultation->getStep()->getId(), 'trashed' => false];
            if ($includeTrashed) {
                unset($filters['trashed']);
            }

            return $this->opinionSearch->getByCriteriaOrdered(
                $filters,
                $order,
                $limit,
                $cursor,
                $viewer
            );
        });

        $connection = $paginator->auto($args);
        $connection->setTotalCount($totalCount);

        return $connection;
    }

    private function getConsultationContributionsTotalCount(
        Consultation $consultation,
        bool $includeTrashed = false
    ): int {
        $totalCount = 0;

        $totalCount += $this->opinionRepository->countPublishedContributionsByConsultation(
            $consultation
        );

        $totalCount += $this->argumentRepository->countPublishedArgumentsByConsultation(
            $consultation
        );

        $totalCount += $this->opinionVersionRepository->countPublishedOpinionVersionByConsultation(
            $consultation
        );

        $totalCount += $this->sourceRepository->countPublishedSourcesByConsultation($consultation);

        if ($includeTrashed) {
            $totalCount += $this->opinionRepository->countTrashedContributionsByConsultation(
                $consultation
            );
            $totalCount += $this->argumentRepository->countTrashedArgumentsByConsultation(
                $consultation
            );
            $totalCount += $this->opinionVersionRepository->countTrashedOpinionVersionByConsultation(
                $consultation
            );
            $totalCount += $this->sourceRepository->countTrashedSourcesByConsultation(
                $consultation
            );
        }

        return $totalCount;
    }
}
