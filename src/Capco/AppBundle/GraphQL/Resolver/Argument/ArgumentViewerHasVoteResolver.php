<?php

namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class ArgumentViewerHasVoteResolver implements ResolverInterface
{
    private $logger;
    private $argumentVoteRepository;

    public function __construct(
                              ArgumentVoteRepository $argumentVoteRepository,
                              LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->argumentVoteRepository = $argumentVoteRepository;
    }

    public function __invoke(Argument $argument, User $user): bool
    {
        try {
            return \count($this->argumentVoteRepository->getByArgumentAndUser($argument, $user)) > 0;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException($exception->getMessage());
        }
    }
}
