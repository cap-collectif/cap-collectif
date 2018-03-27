<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Repository\CommentVoteRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class CommentVotesResolver
{
    private $logger;
    private $repository;

    public function __construct(CommentVoteRepository $repository, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->repository = $repository;
    }

    public function __invoke(Comment $comment, Argument $args)
    {
        try {
            $paginator = new Paginator(function (int $offset, int $limit) use ($comment, $args) {
                $field = $args->offsetGet('orderBy')['field'];
                $direction = $args->offsetGet('orderBy')['direction'];

                return $this->repository->getAllByComment($comment, $offset, $limit, $field, $direction)->getIterator()->getArrayCopy();
            });

            $totalCount = $this->repository->countAllByComment($comment);

            return $paginator->auto($args, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Could not find proposals for selection step');
        }
    }
}
