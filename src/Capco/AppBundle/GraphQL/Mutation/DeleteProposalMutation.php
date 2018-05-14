<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteProposalMutation
{
    private $em;
    private $proposalRepo;
    private $redisHelper;
    private $publisher;
    private $indexer;

    public function __construct(
      EntityManagerInterface $em,
      ProposalRepository $proposalRepo,
      RedisStorageHelper $redisHelper,
      Publisher $publisher,
      Indexer $indexer
    ) {
        $this->em = $em;
        $this->proposalRepo = $proposalRepo;
        $this->redisHelper = $redisHelper;
        $this->publisher = $publisher;
        $this->indexer = $indexer;
    }

    public function __invoke(string $proposalId, User $user)
    {
        $proposal = $this->proposalRepo->find($proposalId);
        if (!$proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%s"', $proposalId));
        }

        $author = $proposal->getAuthor();

        $this->em->remove($proposal); // softdeleted
        $this->em->flush();

        $this->redisHelper->recomputeUserCounters($author);

        $this->publisher->publish('proposal.delete', new Message(
          json_encode([
              'proposalId' => $proposal->getId(),
          ])
      ));

        // Synchronous indexation
        $this->indexer->index(get_class($proposal), $proposal->getId());
        $this->indexer->finishBulk();

        return ['proposal' => $proposal, 'viewer' => $user, 'step' => $proposal->getStep()];
    }
}
