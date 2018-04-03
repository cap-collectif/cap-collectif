<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Repository\PostCommentRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class PostCommentsResolver
{
    private $logger;
    private $commentRepository;

    public function __construct(PostCommentRepository $repository, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->commentRepository = $repository;
    }

    public function __invoke(Post $post, Argument $args): Connection
    {
        try {
            $paginator = new Paginator(function (int $offset, int $limit) use ($post, $args) {
                $field = $args->offsetGet('orderBy')['field'];
                $direction = $args->offsetGet('orderBy')['direction'];

                return $this->commentRepository->getAllByPost($post, $limit, $field, $offset, $direction)->getIterator()->getArrayCopy();
            });

            $totalCount = $this->commentRepository->countAllCommentsAndAnswersByPost($post);

            return $paginator->auto($args, $totalCount);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException('Could not find proposals for selection step');
        }
    }
}
