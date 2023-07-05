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
    protected AbstractSSOConfigurationRepository $ssoConfigurationRepository;
    protected LoggerInterface $logger;

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
        $input = $args->getArrayCopy();
        $sso = $input['ssoType'] ?? null;
        $paginator = new Paginator(function (int $offset, int $limit) use ($sso) {
            try {
                return !$sso
                    ? $this->ssoConfigurationRepository
                        ->getPaginated($limit, $offset)
                        ->getIterator()
                        ->getArrayCopy()
                    : $this->ssoConfigurationRepository
                        ->findSsoByType($limit, $offset, $sso)
                        ->getIterator()
                        ->getArrayCopy()
                    ;
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new \RuntimeException('Find SSO configurations failed.');
            }
        });

        $connection = $paginator->auto($args, $totalCount);
        $connection->setTotalCount($totalCount);

        return $connection;
    }
}
