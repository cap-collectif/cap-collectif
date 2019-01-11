<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Elasticsearch\Indexer;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\DataLoader\ProposalForm\ProposalFormProposalsDataLoader;

class DeleteProposalMutation implements MutationInterface
{
    private $em;
    private $redisHelper;
    private $publisher;
    private $indexer;
    private $dataloader;
    private $globalIdResolver;
    private $logger;

    public function __construct(
        EntityManagerInterface $em,
        RedisStorageHelper $redisHelper,
        Publisher $publisher,
        Indexer $indexer,
        ProposalFormProposalsDataLoader $dataloader,
        GlobalIdResolver $globalIdResolver,
        LoggerInterface $logger
    ) {
        $this->em = $em;
        $this->redisHelper = $redisHelper;
        $this->publisher = $publisher;
        $this->indexer = $indexer;
        $this->dataloader = $dataloader;
        $this->globalIdResolver = $globalIdResolver;
        $this->logger = $logger;
    }

    public function __invoke(string $proposalId, User $user): array
    {
        $proposal = $this->globalIdResolver->resolve($proposalId, $user);
        if (!$proposal || !$proposal instanceof Proposal) {
            throw new UserError(sprintf('Unknown proposal with id "%s"', $proposalId));
        }

        $proposalForm = $proposal->getProposalForm();
        $step = $proposalForm->getStep();

        $author = $proposal->getAuthor();

        $this->em->remove($proposal); // softdeleted
        $this->em->flush();

        $this->redisHelper->recomputeUserCounters($author);

        $this->publisher->publish(
            'proposal.delete',
            new Message(
                json_encode([
                    'proposalId' => $proposalId,
                ])
            )
        );

        // Synchronous indexation
        $this->indexer->remove(\get_class($proposal), $proposal->getId());
        $this->indexer->finishBulk();

        $this->dataloader->invalidate($proposalForm);

        return ['proposal' => $proposal, 'viewer' => $user, 'step' => $step];
    }
}
