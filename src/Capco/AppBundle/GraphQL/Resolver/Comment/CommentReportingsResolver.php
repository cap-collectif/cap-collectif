<?php

namespace Capco\AppBundle\GraphQL\Resolver\Comment;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Repository\ReportingRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class CommentReportingsResolver
{
    private $repository;
    private $logger;

    public function __construct(ReportingRepository $repository, LoggerInterface $logger)
    {
        $this->repository = $repository;
        $this->logger = $logger;
    }

    public function __invoke(Comment $comment, Argument $arguments): Connection
    {
        try {
            $paginator = new Paginator(function (int $offset, int $limit) use ($comment, $arguments) {
                $field = $arguments->offsetGet('orderBy')['field'];
                $direction = $arguments->offsetGet('orderBy')['direction'];

                return $this->repository->getByComment($comment, $offset, $limit, $field, $direction)->getIterator()->getArrayCopy();
            });

            $totalCount = $this->repository->countForComment($comment);

            return $paginator->auto($arguments, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Could not find proposals for selection step');
        }
    }
}
