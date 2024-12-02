<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Anonymizer\UserAnonymizer;
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
use Capco\AppBundle\Mailer\SendInBlue\SendInBluePublisher;
use Capco\AppBundle\Provider\MediaProvider;
use Capco\AppBundle\Repository\AbstractResponseRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\HighlightedContentRepository;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\MediaResponseRepository;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Repository\ProposalEvaluationRepository;
use Capco\AppBundle\Repository\ReportingRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\AppBundle\Repository\ValueResponseRepository;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

abstract class BaseDeleteUserMutation extends BaseDeleteMutation
{
    protected array $originalEventListeners = [];

    public function __construct(
        EntityManagerInterface $em,
        MediaProvider $mediaProvider,
        protected TranslatorInterface $translator,
        protected RedisStorageHelper $redisStorageHelper,
        protected UserGroupRepository $groupRepository,
        protected UserManager $userManager,
        protected ProposalAuthorDataLoader $proposalAuthorDataLoader,
        protected CommentRepository $commentRepository,
        protected ProposalEvaluationRepository $proposalEvaluationRepository,
        protected AbstractResponseRepository $abstractResponseRepository,
        protected NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        protected MediaRepository $mediaRepository,
        protected MediaResponseRepository $mediaResponseRepository,
        protected ValueResponseRepository $valueResponseRepository,
        protected ReportingRepository $reportingRepository,
        protected EventRepository $eventRepository,
        protected HighlightedContentRepository $highlightedContentRepository,
        protected MailingListRepository $mailingListRepository,
        protected LoggerInterface $logger,
        protected UserAnonymizer $userAnonymizer,
        private readonly SendInBluePublisher $sendInBluePublisher
    ) {
        parent::__construct($em, $mediaProvider);
    }

    public function softDeleteContents(User $user): void
    {
        $contributions = $user->getContributions();
        $reports = $this->reportingRepository->findBy(['Reporter' => $user]);
        $events = $this->eventRepository->findBy(['author' => $user]);
        $highlightedContents = $this->highlightedContentRepository->findAll();

        foreach ($contributions as $contribution) {
            if (method_exists($contribution, 'setTitle')) {
                $contribution->setTitle($this->translator->trans('deleted-title'));
            }
            if (method_exists($contribution, 'setBody')) {
                $contribution->setBody($this->translator->trans('deleted-content-by-author'));
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
                $this->deleteResponsesContent($contribution, $this->translator->trans('deleted-content-by-author'));
                $contribution->setAddress(null);
                $contribution->setEstimation(null);
                $contribution->setCategory(null);
                $contribution->setTheme(null);
                $contribution->setDistrict(null);
            }
        }

        foreach ($reports as $report) {
            $report->setBody($this->translator->trans('deleted-content-by-author'));
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

        $this->em->flush();
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
                $contribution->setBody($this->translator->trans('deleted-content-by-author'));
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
        $this->userAnonymizer->anonymize($user);
        $this->sendInBluePublisher->pushToSendinblue('deleteUserFromSendInBlue', ['email' => $email]);
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
            null !== $contribution->getRelated()
            && $contribution instanceof AbstractVote
            && method_exists($contribution->getRelated(), 'getStep')
            && $contribution->getRelated()->getStep()
            && $contribution->getRelated()->getStep()->canContribute($user)
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
        $this->userAnonymizer->removeObjectMedia($object);
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
}
