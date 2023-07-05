<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Error\BaseProposalError;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;

class UpdateProposalSocialNetworksMutation implements MutationInterface
{
    public const PROPOSAL_DOESNT_ALLOW_SOCIAL_NETWORKS = 'PROPOSAL_DOESNT_ALLOW_SOCIAL_NETWORKS';
    private EntityManagerInterface $em;
    private GlobalIdResolver $globalIdResolver;
    private LoggerInterface $logger;

    public function __construct(
        EntityManagerInterface $em,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->globalIdResolver = $globalIdResolver;
        $this->logger = $logger;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $proposal = $this->getProposal($input, $viewer);
            $this->updateProposalSocialNetworks($input, $proposal);

            return ['proposal' => $proposal, 'errorCode' => null];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }
    }

    private function getProposal(Arg $input, User $viewer): Proposal
    {
        $proposalId = $input->offsetGet('proposalId');
        $proposal = $this->globalIdResolver->resolve($proposalId, $viewer);
        if (!$proposal || !$proposal instanceof Proposal) {
            $this->logger->error('Unknown proposal with id: ' . $proposalId);

            throw new UserError(BaseProposalError::PROPOSAL_NOT_FOUND);
        }
        if (!$proposal->getProposalForm()->isUsingAnySocialNetworks()) {
            $this->logger->error(
                'Proposal form does not allow social networks on proposal with id: ' . $proposalId
            );

            throw new UserError(self::PROPOSAL_DOESNT_ALLOW_SOCIAL_NETWORKS);
        }

        if (!$proposal->isUserAuthor($viewer) && !$viewer->isAdmin()) {
            throw new UserError(BaseProposalError::ACCESS_DENIED);
        }

        return $proposal;
    }

    private function updateProposalSocialNetworks(Arg $input, Proposal $proposal): void
    {
        $values = $input->getArrayCopy();

        ProposalMutation::hydrateSocialNetworks($values, $proposal, $proposal->getProposalForm());
        $this->em->flush();
    }
}
