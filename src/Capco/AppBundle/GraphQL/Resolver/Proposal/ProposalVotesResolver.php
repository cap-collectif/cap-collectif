<?php
namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesDataLoader;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalVotesCountByStepDataLoader;
use Capco\AppBundle\Repository\AbstractStepRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use GraphQL\Executor\Promise\PromiseAdapter;
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
        $includeExpired =
            true === $args->offsetGet('includeExpired') &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        if ($args->offsetExists('stepId')) {
            try {
                $step = $this->abstractStepRepository->find($args->offsetGet('stepId'));
                if (!$step) {
                    // Maybe throw an exception
                    return $this->resolveAllVotes($proposal, $args, $includeExpired);
                }
                return $this->proposalVotesDataLoader->load(
                    compact('proposal', 'step', 'args', 'includeExpired')
                );
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());
                throw new \RuntimeException($exception->getMessage());
            }
        }

        return $this->resolveAllVotes($proposal, $args, $includeExpired);
    }

    public function resolveAllVotes(
        Proposal $proposal,
        Argument $args,
        bool $includeExpired = false
    ) {
        return $this->proposalVotesDataLoader->load(compact('proposal', 'args', 'includeExpired'));
    }
}
