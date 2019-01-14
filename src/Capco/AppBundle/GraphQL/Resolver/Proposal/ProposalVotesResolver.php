<?php
namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class ProposalVotesResolver implements ResolverInterface
{
    private $logger;
    private $abstractStepRepository;
    private $proposalVotesDataLoader;

    public function __construct(
        LoggerInterface $logger,
        ProposalVotesDataLoader $proposalVotesDataLoader,
        AbstractStepRepository $abstractStepRepository
    ) {
        $this->logger = $logger;
        $this->proposalVotesDataLoader = $proposalVotesDataLoader;
        $this->abstractStepRepository = $abstractStepRepository;
    }

    public function __invoke(Proposal $proposal, Argument $args, \ArrayObject $context)
    {
        $includeUnpublished =
            true === $args->offsetGet('includeUnpublished') &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        if ($args->offsetExists('stepId')) {
            try {
                $step = $this->abstractStepRepository->find($args->offsetGet('stepId'));

                return $this->proposalVotesDataLoader->load(
                    compact('proposal', 'step', 'args', 'includeUnpublished')
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
                throw new \RuntimeException($exception->getMessage());
            }
        }

        return $this->proposalVotesDataLoader->load(
            compact('proposal', 'args', 'includeUnpublished')
        );
    }
}
