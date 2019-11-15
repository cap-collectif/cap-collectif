<?php

namespace Capco\AppBundle\GraphQL\Resolver\ConsultationStep;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Search\OpinionSearch;
use Capco\AppBundle\Search\Search;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class ConsultationStepContributionsConnectionResolver implements ResolverInterface
{
    private $opinionSearch;
    private $opinionRepository;
    private $sourceRepository;
    private $argumentRepository;
    private $opinionVersionRepository;

    public function __construct(
        OpinionSearch $opinionSearch,
        OpinionRepository $opinionRepository,
        SourceRepository $sourceRepository,
        ArgumentRepository $argumentRepository,
        OpinionVersionRepository $opinionVersionRepository
    )
    {
        $this->opinionSearch = $opinionSearch;
        $this->opinionRepository = $opinionRepository;
        $this->sourceRepository = $sourceRepository;
        $this->argumentRepository = $argumentRepository;
        $this->opinionVersionRepository = $opinionVersionRepository;
    }

    public function __invoke(
        ConsultationStep $consultationStep,
        Argument $args,
        $viewer,
        RequestStack $request
    ): ConnectionInterface
    {
        $field = $args->offsetGet('orderBy')['field'];
        $direction = $args->offsetGet('orderBy')['direction'];
        $includeTrashed = $args->offsetGet('includeTrashed');
        $totalCount = $this->getConsultationStepContributionsTotalCount($consultationStep, $includeTrashed);
        $paginator = new ElasticsearchPaginator(function (?string $cursor, $limit) use (
            $includeTrashed,
            $direction,
            $field,
            $consultationStep,
            $viewer,
            $request
        ) {
            $order = OpinionSearch::findOrderFromFieldAndDirection($field, $direction);
            $filters = [
                'step.id' => $consultationStep->getId(),
                'trashed' => false,
                'published' => true
            ];
            $seed = Search::generateSeed($request, $viewer);

            if ($includeTrashed) {
                unset($filters['trashed']);
            }

            return $this->opinionSearch->getByCriteriaOrdered(
                $filters,
                $order,
                $limit,
                $cursor,
                $viewer,
                $seed
            );
        });
        $connection = $paginator->auto($args);
        $connection->setTotalCount($totalCount);

        return $connection;
    }

    private function getConsultationStepContributionsTotalCount(ConsultationStep $step, bool $includeTrashed = false): int
    {
        $totalCount = 0;

        $totalCount += $this->opinionRepository->countPublishedContributionsByStep(
            $step
        );

        $totalCount += $this->argumentRepository->countPublishedArgumentsByStep(
            $step
        );

        $totalCount += $this->opinionVersionRepository->countPublishedOpinionVersionByStep(
            $step
        );

        $totalCount += $this->sourceRepository->countPublishedSourcesByStep($step);


        if ($includeTrashed) {
            $totalCount += $this->opinionRepository->countTrashedContributionsByStep(
                $step
            );
            $totalCount += $this->argumentRepository->countTrashedArgumentsByStep(
                $step
            );
            $totalCount += $this->opinionVersionRepository->countTrashedOpinionVersionByStep(
                $step
            );
            $totalCount += $this->sourceRepository->countTrashedSourcesByStep($step);
        }

        return $totalCount;
    }
}
