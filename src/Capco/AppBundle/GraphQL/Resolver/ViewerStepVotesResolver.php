<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Psr\Log\LoggerInterface;
use Overblog\PromiseAdapter\PromiseAdapterInterface;

class ViewerStepVotesResolver implements ResolverInterface
{
    private $dataLoader;
    private $logger;
    private $promiseAdapter;

    public function __construct(
        ViewerProposalVotesDataLoader $dataLoader,
        LoggerInterface $logger,
        PromiseAdapterInterface $promiseAdapter
    ) {
        $this->dataLoader = $dataLoader;
        $this->logger = $logger;
        $this->promiseAdapter = $promiseAdapter;
    }

    public function __invoke(AbstractStep $step, User $user, Argument $args): Connection
    {
        try {
            $args->offsetSet('stepId', $step->getId());

            $promise = $this->dataLoader->load(compact('user', 'args'));
            $connection = null;
            $promise->then(function ($value) use (&$connection) {
                return $connection = $value;
            });

            $this->promiseAdapter->await($promise);

            if (!$connection) {
                $connection = ConnectionBuilder::connectionFromArray([], $args);
                $connection->totalCount = 0;

                return $connection;
            }

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}
