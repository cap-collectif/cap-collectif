<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Search\OpinionSearch;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

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
    )
    {
        $this->opinionRepository = $opinionRepository;
        $this->sourceRepository = $sourceRepository;
        $this->argumentRepository = $argumentRepository;
        $this->opinionVersionRepository = $opinionVersionRepository;
        $this->opinionSearch = $opinionSearch;
    }

    public function __invoke(Consultation $consultation, Argument $args): ConnectionInterface
    {
        $includeTrashed = $args->offsetGet('includeTrashed');

        $paginator = new Paginator(function (int $offset, int $limit) use ($args, $includeTrashed, $consultation) {
            if (0 === $offset && 0 === $limit) {
                return [];
            }
            $field = $args->offsetGet('orderBy')['field'];
            $direction = $args->offsetGet('orderBy')['direction'];
            $order = OpinionSearch::findOrderFromFieldAndDirection($field, $direction);
            $filters = ['step.id' => $consultation->getStep()->getId(), 'trashed' => false];
            $includeTrashed = $args->offsetGet('includeTrashed');
            if ($includeTrashed) {
                unset($filters['trashed']);
            }

            $results = $this->opinionSearch->getByCriteriaOrdered(
                $filters,
                $order,
                $limit,
                $offset
            );

            return $results['opinions'];
        });

        return $paginator->auto(
            $args,
            $this->getConsultationContributionsTotalCount($consultation, $includeTrashed)
        );
    }

    private function getConsultationContributionsTotalCount(Consultation $consultation, bool $includeTrashed = false): int
    {
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
            $totalCount += $this->sourceRepository->countTrashedSourcesByConsultation($consultation);
        }

        return $totalCount;
    }
}
