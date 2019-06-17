<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class SSOConfigurationQueryResolver implements ResolverInterface
{
    protected $ssoConfigurationRepository;
    protected $logger;

    public function __construct(
        AbstractSSOConfigurationRepository $ssoConfigurationRepository,
        LoggerInterface $logger
    ) {
        $this->ssoConfigurationRepository = $ssoConfigurationRepository;
        $this->logger = $logger;
    }

    public function __invoke(Arg $args): Connection
    {
        $totalCount = $this->ssoConfigurationRepository->count([]);
        $paginator = new Paginator(function (int $offset, int $limit) {
            try {
                return $this->ssoConfigurationRepository
                    ->getPaginated($limit, $offset)
                    ->getIterator()
                    ->getArrayCopy();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find SSO configurations failed.');
            }
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->totalCount = $totalCount;

        return $connection;
    }
}
