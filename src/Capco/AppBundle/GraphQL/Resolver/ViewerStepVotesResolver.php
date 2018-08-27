<?php
namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\GraphQL\Resolver\User\ViewerProposalVotesResolver;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Psr\Log\LoggerInterface;

class ViewerStepVotesResolver implements ResolverInterface
{
    private $resolver;
    private $logger;

    public function __construct(ViewerProposalVotesResolver $resolver, LoggerInterface $logger)
    {
        $this->resolver = $resolver;
        $this->logger = $logger;
    }

    public function __invoke(AbstractStep $step, User $user, Argument $args): Connection
    {
        try {
            return $this->resolver->getConnectionForStepAndUser($step, $user, $args);
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
            throw new \RuntimeException($exception->getMessage());
        }
    }
}
