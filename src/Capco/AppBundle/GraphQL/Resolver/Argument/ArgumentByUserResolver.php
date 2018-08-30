<?php
namespace Capco\AppBundle\GraphQL\Resolver\Argument;

use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ArgumentByUserResolver implements ResolverInterface
{
    private $argumentRepository;
    private $logger;

    public function __construct(ArgumentRepository $argumentRepository, LoggerInterface $logger)
    {
        $this->argumentRepository = $argumentRepository;
        $this->logger = $logger;
    }

    public function __invoke(User $user, Arg $args): Connection
    {
        $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
            try {
                $arguments = $this->argumentRepository->getByUser($user, $offset, $limit)
                    ->getIterator()
                    ->getArrayCopy();
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
                throw new \RuntimeException('get by user failed');
            }

            return $arguments;
        });

        $totalCount = $this->argumentRepository->countByUser($user);

        return $paginator->auto($args, $totalCount);
    }
}
