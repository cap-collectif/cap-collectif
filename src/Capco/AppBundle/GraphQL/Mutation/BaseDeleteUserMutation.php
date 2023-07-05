<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Anonymizer\AnonymizeUser;
use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\HighlightedEvent;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\EventListener\SoftDeleteEventListener;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalAuthorDataLoader;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\HighlightedContentRepository;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Repository\MediaResponseRepository;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Repository\ProposalEvaluationRepository;
use Capco\AppBundle\Repository\ReportingRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\MediaBundle\Provider\MediaProvider;
use Capco\MediaBundle\Repository\MediaRepository;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Contracts\Translation\TranslatorInterface;

abstract class BaseDeleteUserMutation extends BaseDeleteMutation
{
    protected TranslatorInterface $translator;
    protected array $originalEventListeners = [];
    protected RedisStorageHelper $redisStorageHelper;
    protected UserGroupRepository $groupRepository;
    protected UserManager $userManager;
    protected ProposalAuthorDataLoader $proposalAuthorDataLoader;
    protected CommentRepository $commentRepository;
    protected ProposalEvaluationRepository $proposalEvaluationRepository;
    protected AbstractResponseRepository $abstractResponseRepository;
    protected NewsletterSubscriptionRepository $newsletterSubscriptionRepository;
    protected MediaRepository $mediaRepository;
    protected MediaResponseRepository $mediaResponseRepository;
    protected ValueResponseRepository $valueResponseRepository;
    protected ReportingRepository $reportingRepository;
    protected EventRepository $eventRepository;
    protected HighlightedContentRepository $highlightedContentRepository;
    protected MailingListRepository $mailingListRepository;
    protected LoggerInterface $logger;
    protected AnonymizeUser $anonymizeUser;
    private Publisher $publisher;

    public function __construct(
        EntityManagerInterface $em,
        MediaProvider $mediaProvider,
        TranslatorInterface $translator,
        RedisStorageHelper $redisStorageHelper,
        UserGroupRepository $groupRepository,
        UserManager $userManager,
        ProposalAuthorDataLoader $proposalAuthorDataLoader,
        CommentRepository $commentRepository,
        ProposalEvaluationRepository $proposalEvaluationRepository,
        AbstractResponseRepository $abstractResponseRepository,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        MediaRepository $mediaRepository,
        MediaResponseRepository $mediaResponseRepository,
        ValueResponseRepository $valueResponseRepository,
        ReportingRepository $reportingRepository,
        EventRepository $eventRepository,
        HighlightedContentRepository $highlightedContentRepository,
        MailingListRepository $mailingListRepository,
        LoggerInterface $logger,
        AnonymizeUser $anonymizeUser,
        Publisher $publisher
    ) {
        parent::__construct($em, $mediaProvider);
        $this->translator = $translator;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->groupRepository = $groupRepository;
        $this->userManager = $userManager;
        $this->proposalAuthorDataLoader = $proposalAuthorDataLoader;
        $this->commentRepository = $commentRepository;
        $this->proposalEvaluationRepository = $proposalEvaluationRepository;
        $this->abstractResponseRepository = $abstractResponseRepository;
        $this->newsletterSubscriptionRepository = $newsletterSubscriptionRepository;
        $this->mediaRepository = $mediaRepository;
        $this->mediaResponseRepository = $mediaResponseRepository;
        $this->valueResponseRepository = $valueResponseRepository;
        $this->reportingRepository = $reportingRepository;
        $this->eventRepository = $eventRepository;
        $this->highlightedContentRepository = $highlightedContentRepository;
        $this->mailingListRepository = $mailingListRepository;
        $this->logger = $logger;
        $this->anonymizeUser = $anonymizeUser;
        $this->publisher = $publisher;
    }

    public function softDelete(User $user): void
    {
        $contributions = $user->getContributions();
        $reports = $this->reportingRepository->findBy(['Reporter' => $user]);
        $events = $this->eventRepository->findBy(['author' => $user]);
        $highlightedContents = $this->highlightedContentRepository->findAll();

        foreach ($contributions as $contribution) {
            if (method_exists($contribution, 'setTitle')) {
                $contribution->setTitle('deleted-title');
            }
            if (method_exists($contribution, 'setBody')) {
                $contribution->setBody('deleted-content-by-author');
            }
            if (method_exists($contribution, 'setSummary')) {
                $contribution->setSummary(null);
            }
            if (method_exists($contribution, 'getMedia') && $contribution->getMedia()) {
                try {
                    $this->removeObjectMedia($contribution);
                } catch (\Exception $e) {
                    $this->logger->error(__METHOD__ . ' : ' . $e->getMessage());
                }
            }
            if ($contribution instanceof Proposal) {
                $this->deleteResponsesContent($contribution, 'deleted-content-by-author');
                $contribution->setAddress(null);
                $contribution->setEstimation(null);
                $contribution->setCategory(null);
                $contribution->setTheme(null);
                $contribution->setDistrict(null);
            }
        }

        foreach ($reports as $report) {
            $report->setBody('deleted-content-by-author');
        }

        foreach ($events as $event) {
            foreach ($highlightedContents as $content) {
                if (
                    $content instanceof HighlightedEvent
                    && $content->getEvent()->getId() === $event->getId()
                ) {
                    $this->em->remove($content);
                }
            }
            $this->em->remove($event);
        }

        $this->redisStorageHelper->recomputeUserCounters($user);
    }

    public function hardDeleteUserContributionsInActiveSteps(User $user): void
    {
        // Disable the built-in softdelete
        $filters = $this->em->getFilters();
        if ($filters->isEnabled('softdeleted')) {
            $filters->disable('softdeleted');
        }
        $this->disableListeners();

        $contributions = $user->getContributions();
        $toDeleteList = [];
        foreach ($contributions as $contribution) {
            if ($this->shallContributionBeDeleted($user, $contribution)) {
                $toDeleteList[] = $contribution;
                $this->deleteResponsesAndEvaluationsFromProposal($user, $contribution);
            } elseif ($this->shallContributionBeHidden($contribution)) {
                $contribution->setBody('deleted-content-by-author');
            }

            if (method_exists($contribution, 'getMedia') && $contribution->getMedia()) {
                try {
                    $this->removeObjectMedia($contribution);
                } catch (\Exception $e) {
                    $this->logger->error(__METHOD__ . ' : ' . $e->getMessage());
                }
            }
        }

        foreach ($toDeleteList as $toDelete) {
            $this->em->remove($toDelete);
        }

        $this->em->flush();
        $this->enableListeners();
        $this->redisStorageHelper->recomputeUserCounters($user);
    }

    public function countContributionsToDelete(User $user): int
    {
        $count = 0;
        foreach ($user->getContributions() as $contribution) {
            if ($this->shallContributionBeDeleted($user, $contribution)) {
                ++$count;
            }
        }

        return $count;
    }

    public function anonymizeUser(User $user): void
    {
        $email = $user->getEmail();
        $this->anonymizeUser->anonymize($user);

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::SENDINBLUE,
            new Message(
                json_encode([
                    'method' => 'deleteUserFromSendinblue',
                    'args' => ['email' => $email],
                ])
            )
        );
    }

    private function deleteResponsesAndEvaluationsFromProposal(User $user, $proposal): void
    {
        if (
            ($proposal instanceof Proposal
                || $proposal instanceof Opinion
                || $proposal instanceof Source
                || $proposal instanceof Argument)
            && $proposal->getStep()
            && $proposal->getStep()->canContribute($user)
        ) {
            foreach (
                $this->proposalEvaluationRepository->findBy(['proposal' => $proposal->getId()])
                as $evaluation
            ) {
                $this->em->remove($evaluation);
            }

            foreach (
                $this->abstractResponseRepository->findBy(['proposal' => $proposal->getId()])
                as $response
            ) {
                $this->em->remove($response);
            }
        }
    }

    private function shallContributionBeDeleted(User $user, $contribution): bool
    {
        if (
            $contribution instanceof AbstractVote
            && method_exists($contribution->getRelated(), 'getStep')
            && $contribution->getRelated()
            && $contribution->getRelated()->getStep()
            && $contribution
                ->getRelated()
                ->getStep()
                ->canContribute($user)
        ) {
            return true;
        }
        if ($contribution instanceof Comment) {
            if (!$this->commentRepository->findOneBy(['parent' => $contribution->getId()])) {
                return true;
            }
        } elseif (
            ($contribution instanceof Proposal
                || $contribution instanceof Opinion
                || $contribution instanceof Source
                || $contribution instanceof Argument)
            && $contribution->getStep()
            && $contribution->getStep()->canContribute($user)
        ) {
            return true;
        }

        return false;
    }

    private function shallContributionBeHidden($contribution): bool
    {
        return $contribution instanceof Comment
            && $this->commentRepository->findOneBy(['parent' => $contribution->getId()]);
    }

    private function enableListeners(): void
    {
        foreach ($this->originalEventListeners as $eventName => $listener) {
            $this->em->getEventManager()->addEventListener($eventName, $listener);
        }
    }

    private function removeObjectMedia($object): void
    {
        $this->anonymizeUser->removeObjectMedia($object);
    }

    private function deleteResponsesContent(Proposal $proposal, string $deletedBodyText): void
    {
        $valueResponses = $this->valueResponseRepository->findBy(['proposal' => $proposal]);
        $mediaResponses = $this->mediaResponseRepository->findBy(['proposal' => $proposal]);
        /** @var Reply $reply */
        foreach ($valueResponses as $reply) {
            $reply->setValue($deletedBodyText);
        }
        foreach ($mediaResponses as $response) {
            $response->getMedias()->clear();
        }
        foreach ($mediaResponses as $response) {
            $medias = $response->getMedias();
            foreach ($medias as $media) {
                $this->removeMedia($media);
            }
        }
    }

    private function disableListeners(): void
    {
        foreach ($this->em->getEventManager()->getListeners() as $eventName => $listeners) {
            foreach ($listeners as $listener) {
                if ($listener instanceof SoftDeleteEventListener) {
                    // store the event listener, that gets removed
                    $this->originalEventListeners[$eventName] = $listener;

                    // remove the SoftDeletableSubscriber event listener
                    $this->em->getEventManager()->removeEventListener($eventName, $listener);
                }
            }
        }
    }

    private function removeFromMailingLists(User $user): void
    {
        $this->anonymizeUser->removeFromMailingLists($user);

        $this->publisher->publish(
            CapcoAppBundleMessagesTypes::SENDINBLUE,
            new Message(
                json_encode([
                    'method' => 'deleteUserFromSendinblue',
                    'args' => ['user' => $user],
                ])
            )
        );
    }
}
