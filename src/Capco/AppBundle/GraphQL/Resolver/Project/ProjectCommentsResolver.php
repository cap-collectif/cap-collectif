<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProjectCommentsResolver implements QueryInterface
{
    public function __construct(
        private readonly ProposalCommentRepository $proposalCommentRepository,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(Project $project, Argument $args): Connection
    {
        $totalCount = 0;
        $onlyTrashed = $args->offsetGet('onlyTrashed');
        $orderBy = $args->offsetGet('orderBy');

        try {
            $paginator = new Paginator(function (?int $offset, ?int $limit) use (
                $project,
                $onlyTrashed,
                $orderBy
            ) {
                if (0 === $offset && 0 === $limit) {
                    return [];
                }

                return $this->proposalCommentRepository
                    ->getByProject(
                        $project,
                        $offset,
                        $limit,
                        $onlyTrashed,
                        $orderBy['field'],
                        $orderBy['direction']
                    )
                    ->getIterator()
                    ->getArrayCopy()
                ;
            });

            $totalCount = $this->proposalCommentRepository->countByProject($project, $onlyTrashed);

            return $paginator->auto($args, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find comments');
        }
    }
}
