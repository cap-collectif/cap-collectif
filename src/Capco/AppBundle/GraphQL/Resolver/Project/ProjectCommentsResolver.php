<?php

namespace Capco\AppBundle\GraphQL\Resolver\Project;

use Capco\AppBundle\Entity\Project;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;
use Capco\AppBundle\Repository\ProposalCommentRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;

class ProjectCommentsResolver implements ResolverInterface
{
    private $logger;
    private $proposalCommentRepository;
    private $proposalRepository;

    public function __construct(
        ProposalCommentRepository $proposalCommentRepository,
        ProposalRepository $proposalRepository,
        LoggerInterface $logger
    ) {
        $this->logger = $logger;
        $this->proposalCommentRepository = $proposalCommentRepository;
        $this->proposalRepository = $proposalRepository;
    }

    public function __invoke(Project $project, Argument $args): Connection
    {
        $totalCount = 0;
        $onlyTrashed = $args->offsetGet('onlyTrashed');

        try {
            $paginator = new Paginator(function (?int $offset, ?int $limit) use (
                $project,
                $onlyTrashed
            ) {
                return $this->proposalCommentRepository
                    ->getByProject($project, $offset, $limit, $onlyTrashed)
                    ->getIterator()
                    ->getArrayCopy();
            });

            $totalCount = $this->proposalCommentRepository->countByProject($project, $onlyTrashed);

            return $paginator->auto($args, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find comments');
        }
    }
}
