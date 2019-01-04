<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\Step\VotesCountDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class VoteCountStepResolver implements ResolverInterface
{
    private $votesCountDataLoader;
    private $logger;

    public function __construct(LoggerInterface $logger, VotesCountDataLoader $votesCountDataLoader)
    {
        $this->votesCountDataLoader = $votesCountDataLoader;
        $this->logger = $logger;
    }

    public function __invoke(AbstractStep $step): Promise
    {
        try {
            return $this->votesCountDataLoader->load([
                'step' => $step,
            ]);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}
