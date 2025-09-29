<?php

namespace Capco\AppBundle\GraphQL\Resolver\Reportable;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Debate\DebateArgument;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Repository\ReportingRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ReportableReportingResolver implements QueryInterface
{
    public function __construct(
        private readonly ReportingRepository $repository,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(Contribution $contribution, Argument $arguments): Connection
    {
        $contributionType = false;
        $countFor = '';
        $getBy = '';
        // contains $getBy $countFor and can contains $contributionType
        extract($this->getTypeOfContribution($contribution), \EXTR_OVERWRITE);

        try {
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $contribution,
                $arguments,
                $getBy,
                $contributionType
            ) {
                $field = $arguments->offsetGet('orderBy')['field'];
                $direction = $arguments->offsetGet('orderBy')['direction'];

                if ($contributionType) {
                    return $this->repository
                        ->getByContributionType(
                            $contribution,
                            $contributionType,
                            $offset,
                            $limit,
                            $field,
                            $direction
                        )
                        ->getIterator()
                        ->getArrayCopy()
                    ;
                }

                return $this->repository
                    ->{$getBy}($contribution, $offset, $limit, $field, $direction)
                    ->getIterator()
                    ->getArrayCopy()
                ;
            });

            if ($contributionType) {
                $totalCount = $this->repository->countForContributionType(
                    $contribution,
                    $contributionType
                );
            } else {
                $totalCount = $this->repository->{$countFor}($contribution);
            }
            $this->logger->debug($totalCount);

            return $paginator->auto($arguments, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find entity for selection step');
        }
    }

    private function getTypeOfContribution(Contribution $contribution): array
    {
        if ($contribution instanceof Comment) {
            return ['getBy' => 'getByComment', 'countFor' => 'countForComment'];
        }
        if ($contribution instanceof Proposal) {
            return ['getBy' => 'getByProposal', 'countFor' => 'countForProposal'];
        }
        if ($contribution instanceof OpinionVersion) {
            return ['getBy' => 'getByOpinionVersion', 'countFor' => 'countForOpinionVersion'];
        }
        if ($contribution instanceof Opinion) {
            return ['getBy' => 'getByOpinion', 'countFor' => 'countForOpinion'];
        }
        if ($contribution instanceof DebateArgument) {
            return ['getBy' => 'getByDebateArgument', 'countFor' => 'countForDebateArgument'];
        }

        $contributionClass = explode('\\', $contribution::class);
        $contributionType = end($contributionClass);

        return [
            'getBy' => 'getByContribution',
            'countFor' => 'countForContribution',
            'contributionType' => $contributionType,
        ];
    }
}
