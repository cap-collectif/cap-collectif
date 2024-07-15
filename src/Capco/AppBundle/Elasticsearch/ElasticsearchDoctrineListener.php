<?php

namespace Capco\AppBundle\Elasticsearch;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalAnalyst;
use Capco\AppBundle\Entity\ProposalAssessment;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Entity\ProposalDecisionMaker;
use Capco\AppBundle\Entity\ProposalSupervisor;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\Model\Contribution;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Resolver\EntityChangeSetResolver;
use Doctrine\Common\EventSubscriber;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\Event\LifecycleEventArgs;
use Doctrine\ORM\Events;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;

/**
 *  Listen any persist, update or delete operations happening in Doctrine, in order to:
 * - Index any created or updated object
 * - Re-index related author / step / project, to update counters.
 * - De-index any deleted object.
 *
 * All indexations are added to a RabbitMQ queue, because doing all of this synchronously
 * would be very expensive.
 */
class ElasticsearchDoctrineListener implements EventSubscriber
{
    private const BULK_SIZE = 200;
    private LoggerInterface $logger;
    private ElasticsearchRabbitMQListener $elasticsearchRabbitMQListener;
    private AbstractResponseRepository $responseRepository;
    private ProposalRepository $proposalRepository;
    private ProposalSelectionVoteRepository $proposalSelectionVoteRepository;
    private ProposalCollectVoteRepository $proposalCollectVoteRepository;
    private EntityChangeSetResolver $changeSetResolver;
    private OpinionRepository $opinionRepository;

    public function __construct(
        ElasticsearchRabbitMQListener $elasticsearchRabbitMQListener,
        LoggerInterface $logger,
        AbstractResponseRepository $responseRepository,
        ProposalRepository $proposalRepository,
        ProposalSelectionVoteRepository $proposalSelectionVoteRepository,
        ProposalCollectVoteRepository $proposalCollectVoteRepository,
        OpinionRepository $opinionRepository,
        EntityChangeSetResolver $changeSetResolver
    ) {
        $this->logger = $logger;
        $this->elasticsearchRabbitMQListener = $elasticsearchRabbitMQListener;
        $this->responseRepository = $responseRepository;
        $this->proposalRepository = $proposalRepository;
        $this->proposalSelectionVoteRepository = $proposalSelectionVoteRepository;
        $this->proposalCollectVoteRepository = $proposalCollectVoteRepository;
        $this->changeSetResolver = $changeSetResolver;
        $this->opinionRepository = $opinionRepository;
    }

    public function getSubscribedEvents(): array
    {
        return [Events::postPersist, Events::postUpdate, Events::preRemove];
    }

    public function postPersist(LifecycleEventArgs $args): void
    {
        $this->process($args->getObject());
    }

    public function postUpdate(LifecycleEventArgs $args): void
    {
        $this->process($args->getObject());
    }

    public function preRemove(LifecycleEventArgs $args): void
    {
        $this->process($args->getObject());
    }

    public function handleEvent(LifecycleEventArgs $args): void
    {
        $this->process($args->getObject());
    }

    public function addToMessageStack(IndexableInterface $entity): void
    {
        $body = json_encode([
            'class' => ClassUtils::getClass($entity),
            'id' => $entity->getId(),
        ]);
        $this->logger->info(
            '[elastic_search_doctrine_listener] Adding new message to stack ' . $body
        );

        // We cannot dynamically call static methods with phpspec, so we hardcode the priority to 1.
        if (false !== strpos(\get_class($entity), 'Double')) {
            $priority = 1;
        } else {
            $priority = $entity::getElasticsearchPriority();
        }
        $this->elasticsearchRabbitMQListener->addToMessageStack(new Message($body), $priority);
    }

    public function process($entity, bool $indexAuthor = true, bool $skipProcess = false): void
    {
        if ($entity instanceof IndexableInterface) {
            $this->addToMessageStack($entity);
        }
        if (
            $indexAuthor
            && ($entity instanceof Authorable
                || ($entity instanceof Contribution && method_exists($entity, 'getAuthor')))
            && $entity->getAuthor()
        ) {
            $this->addToMessageStack($entity->getAuthor());
        }
        if (
            $entity instanceof ProposalAnalyst
            || $entity instanceof ProposalDecisionMaker
            || $entity instanceof ProposalSupervisor
            || $entity instanceof ProposalAssessment
            || $entity instanceof ProposalDecision
            || $entity instanceof ProposalAnalysis
        ) {
            $this->process($entity->getProposal(), false);
        }
        if ($entity instanceof Comment && $entity->getRelatedObject()) {
            $this->process($entity->getRelatedObject(), false, true);
        }
        if ($entity instanceof AbstractVote && $entity->getRelated()) {
            if ($entity->getRelated() instanceof Proposal) {
                $this->process($entity->getRelated(), false, true);
            } else {
                $this->process($entity->getRelated(), false);
            }
        }
        if ($entity instanceof Event && $entity->getProjects()->count() > 0) {
            foreach ($entity->getProjects() as $project) {
                $this->process($project, false);
            }
        }
        if (!$skipProcess && $entity instanceof Proposal) {
            if (($comments = $entity->getComments()) && $comments->count() > 0) {
                foreach ($comments as $comment) {
                    $this->process($comment, false);
                }
            }

            $offset = 0;

            do {
                $selectionVotes = $this->proposalSelectionVoteRepository
                    ->getVotesForProposal($entity, self::BULK_SIZE, $offset)
                ;
                /** @var AbstractVote $vote */
                foreach ($selectionVotes as $vote) {
                    $this->process($vote, false);
                }
                $offset += self::BULK_SIZE;
            } while (!empty($selectionVotes));

            $offset = 0;

            do {
                $collectVotes = $this->proposalCollectVoteRepository
                    ->getVotesForProposal($entity, self::BULK_SIZE, $offset)
                ;
                /** @var AbstractVote $vote */
                foreach ($collectVotes as $vote) {
                    $this->process($vote, false);
                }
                $offset += self::BULK_SIZE;
            } while (!empty($collectVotes));
        }

        if ($entity instanceof Reply) {
            $responses = $this->responseRepository->getByReply($entity);
            if (\count($responses) > 0) {
                foreach ($responses as $response) {
                    $this->process($response, false);
                }
            }
        }

        if ($entity instanceof Project) {
            $entityChangeSet = $this->changeSetResolver->getEntityChangeSet($entity);
            // When visibility changes on project, all sub-data recursively (proposals, opinions, ...)
            // must be reindexed to be accordingly visible/invisible in front office.
            if (
                \array_key_exists('visibility', $entityChangeSet)
                || \array_key_exists('projectDistrictPositioners', $entityChangeSet)
            ) {
                $offset = 0;
                do {
                    $proposals = $this->proposalRepository->getProposalsByProject($entity->getId(), self::BULK_SIZE, $offset);
                    /** @var Proposal $proposal */
                    foreach ($proposals as $proposal) {
                        $this->process($proposal, false);
                    }
                    $offset += self::BULK_SIZE;
                } while (!empty($proposals));

                $offset = 0;
                do {
                    $opinions = $this->opinionRepository->getOpinionsByProject($entity->getId(), self::BULK_SIZE, $offset);
                    /** @var Opinion $opinion */
                    foreach ($opinions as $opinion) {
                        $this->process($opinion, false);
                    }
                    $offset += self::BULK_SIZE;
                } while (!empty($opinions));
            }
        }

        if ($entity instanceof UserGroup) {
            $projects = $entity->getGroup()->getProjectsVisibleByTheGroup();
            foreach ($projects as $project) {
                $this->process($project, false);
            }
        }
    }
}
