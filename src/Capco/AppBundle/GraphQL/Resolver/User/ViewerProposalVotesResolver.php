<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\GraphQL\DataLoader\User\ViewerProposalVotesDataLoader;
use GraphQL\Executor\Promise\Promise;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Overblog\PromiseAdapter\PromiseAdapterInterface;
use Psr\Log\LoggerInterface;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ViewerProposalVotesResolver implements ResolverInterface
{
    private $logger;
    private $viewerProposalVotesDataLoader;
    private $promiseAdapter;

    public function __construct(
        LoggerInterface $logger,
        ViewerProposalVotesDataLoader $viewerProposalVotesDataLoader,
        PromiseAdapterInterface $promiseAdapter
    ) {
        $this->logger = $logger;
        $this->viewerProposalVotesDataLoader = $viewerProposalVotesDataLoader;
        $this->promiseAdapter = $promiseAdapter;
    }

    public function __invoke(User $user, Argument $args): Connection
    {
        /** @var Promise $promise */
        $promise = $this->viewerProposalVotesDataLoader->load(compact('user', 'args'));
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
    }
}
