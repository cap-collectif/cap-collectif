<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Swarrot\Broker\Message;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Elasticsearch\Indexer;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;

class DeleteProposalMutation implements MutationInterface
{
    private $em;
    private $proposalRepo;
    private $redisHelper;
    private $publisher;
    private $indexer;
    private $dataLoader;

    public function __construct(
        EntityManagerInterface $em,
        ProposalRepository $proposalRepo,
        RedisStorageHelper $redisHelper,
        Publisher $publisher,
        Indexer $indexer,
        ProposalFormProposalsDataLoader $dataLoader
    ) {
        $this->em = $em;
        $this->proposalRepo = $proposalRepo;
        $this->redisHelper = $redisHelper;
        $this->publisher = $publisher;
        $this->indexer = $indexer;
        $this->dataLoader = $dataLoader;
    }

    public function __invoke(string $proposalId, User $user): array
    {
        $proposal = $this->proposalRepo->find($proposalId);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%s"', $proposalId));
        }

        $proposalForm = $proposal->getProposalForm();

        $author = $proposal->getAuthor();

        $this->em->remove($proposal); // softdeleted
        $this->em->flush();

        $this->redisHelper->recomputeUserCounters($author);

        $this->publisher->publish(
            'proposal.delete',
            new Message(
                json_encode([
                    'proposalId' => $proposal->getId(),
                ])
            )
        );

        // Synchronous indexation
        $this->indexer->remove(\get_class($proposal), $proposal->getId());
        $this->indexer->finishBulk();

        $this->dataLoader->invalidate($proposalForm);

        return ['proposal' => $proposal, 'viewer' => $user, 'step' => $proposal->getStep()];
    }
}
