<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Steps\ProposalStepInterface;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalContributorVoteResolver implements QueryInterface
{
    public function __construct(private readonly ProposalSelectionVoteRepository $proposalSelectionVoteRepository, private readonly GlobalIdResolver $globalIdResolver, private readonly EntityManagerInterface $em, private readonly ProposalCollectVoteRepository $proposalCollectVoteRepository)
    {
    }

    public function __invoke(Proposal $proposal, Arg $args, ?User $viewer = null): ?AbstractVote
    {
        $base64Token = $args->offsetGet('token');
        $stepId = $args->offsetGet('step');

        $step = $this->globalIdResolver->resolve($stepId, $viewer);
        $token = base64_decode((string) $base64Token);

        if ($this->em->getFilters()->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME)) {
            $this->em->getFilters()->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        if (!$step instanceof ProposalStepInterface) {
            throw new \Exception('Step must implements ProposalStepInterface');
        }

        if ($step instanceof SelectionStep) {
            return $this->proposalSelectionVoteRepository->findOneByProposalTokenAndStep($proposal, $token, $step);
        }

        return $this->proposalCollectVoteRepository->findOneByProposalTokenAndStep($proposal, $token, $step);
    }
}
