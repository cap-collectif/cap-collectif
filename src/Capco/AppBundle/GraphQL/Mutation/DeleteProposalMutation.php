<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteProposalMutation implements MutationInterface
{
    public function __construct(private readonly EntityManagerInterface $em, private readonly RedisStorageHelper $redisHelper, private readonly Publisher $publisher, private readonly Indexer $indexer, private readonly ProposalFormProposalsDataLoader $dataloader, private readonly GlobalIdResolver $globalIdResolver)
    {
    }

    public function __invoke(string $proposalId, User $user): array
    {
        $proposal = $this->globalIdResolver->resolve($proposalId, $user);
        if (!$proposal || !$proposal instanceof Proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%s"', $proposalId));
        }

        $author = $proposal->getAuthor();
        $this->em->remove($proposal); // softdeleted
        $this->em->flush();

        $this->redisHelper->recomputeUserCounters($author);

        $this->publish($proposal);

        // Synchronous indexation
        $this->indexer->remove($proposal::class, $proposal->getId());
        $this->indexer->finishBulk();

        $proposalForm = $proposal->getProposalForm();
        $this->dataloader->invalidate($proposalForm);

        return ['proposal' => $proposal, 'viewer' => $user, 'step' => $proposalForm->getStep()];
    }

    private function publish(Proposal $proposal): void
    {
        $message = [
            'proposalId' => $proposal->getId(),
            'supervisorId' => null,
            'decisionMakerId' => null,
        ];
        if ($proposal->getSupervisor()) {
            $message['supervisorId'] = $proposal->getSupervisor()->getId();
        }
        if ($proposal->getDecisionMaker()) {
            $message['decisionMakerId'] = $proposal->getDecisionMaker()->getId();
        }

        $this->publisher->publish('proposal.delete', new Message(json_encode($message)));
    }
}
