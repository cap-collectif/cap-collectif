<?php

namespace Capco\AppBundle\Anonymizer;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalAuthorDataLoader;
use Capco\AppBundle\Repository\MailingListUserRepository;
use Capco\AppBundle\Repository\MediaRepository;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Gedmo\Sluggable\SluggableListener;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class UserAnonymizer
{
    final public const CANNOT_DELETE_USER_PROFILE_IMAGE = 'Cannot delete user profile image !';
    /** @var array<string, array<int, object>> */
    private array $sluggableListeners = [];

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserGroupRepository $groupRepository,
        private readonly NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        private readonly LoggerInterface $logger,
        private readonly ProposalAuthorDataLoader $proposalAuthorDataLoader,
        private readonly UserManager $userManager,
        private readonly MediaRepository $mediaRepository,
        private readonly MailingListUserRepository $mailingListUserRepository,
        private readonly TranslatorInterface $translator
    ) {
    }

    public function anonymize(User $user): void
    {
        $this->disableSluggableListeners();

        try {
            $newsletter = $this->newsletterSubscriptionRepository->findOneBy([
                'email' => $user->getEmail(),
            ]);
            $userGroups = $this->groupRepository->findBy(['user' => $user]);

            if ($newsletter) {
                $this->em->remove($newsletter);
            }

            if ($userGroups) {
                foreach ($userGroups as $userGroup) {
                    $this->em->remove($userGroup);
                }
            }

            $user->setEmail(null);
            $user->setEmailCanonical(null);
            $user->setUsername($this->translator->trans('deleted-user'));
            $user->setDeletedAccountAt(new \DateTime());
            $user->setPlainPassword(null);
            $user->clearLastLogin();
            // Set a unique, non-PII slug without triggering Gedmo sluggable (disabled above).
            $user->setSlug(sprintf('deleted-%s', $user->getId()));

            $user->setFacebookId(null);
            $user->setFacebookUrl(null);
            $user->setFacebookAccessToken(null);
            $user->setCasId(null);
            $user->setTwitterId(null);
            $user->setTwitterUrl(null);
            $user->setTwitterAccessToken(null);
            $user->setOpenId(null);
            $user->setOpenIdAccessToken(null);
            $user->setFranceConnectId(null);
            $user->setFranceConnectAccessToken(null);

            $user->setAddress(null);
            $user->setAddress2(null);
            $user->setZipCode(null);
            $user->setNeighborhood(null);
            $user->setPhone(null);
            $user->setCity(null);
            $user->setBiography(null);
            $user->setDateOfBirth(null);
            $user->setFirstname(null);
            $user->setLastname(null);
            $user->setWebsite(null);
            $user->setGender(null);
            $user->setLocale(null);
            $user->setLocked(true);
            $user->setOpenIdSessionsId([]);

            $user->setConsentExternalCommunication(false);
            $user->setConsentInternalCommunication(false);
            $user->setEmailConfirmationSentAt(null);

            if ($user->getMedia()) {
                try {
                    $this->removeObjectMedia($user);
                } catch (\Exception $e) {
                    $this->logger->error(__METHOD__ . ' : ' . $e->getMessage());

                    throw new Exception(self::CANNOT_DELETE_USER_PROFILE_IMAGE);
                }
            }

            $contributions = $user->getContributions();
            foreach ($contributions as $contribution) {
                if ($contribution instanceof Proposal) {
                    $this->proposalAuthorDataLoader->invalidate($contribution);
                }
            }

            foreach ($user->getMemberOfOrganizations() as $memberOfOrganization) {
                $this->em->remove($memberOfOrganization);
            }

            $this->removeFromMailingLists($user);

            $this->userManager->updateUser($user);
        } finally {
            $this->enableSluggableListeners();
        }
    }

    public function removeObjectMedia($object): void
    {
        /** @var Media $media */
        $media = $this->mediaRepository->find($object->getMedia()->getId());
        $this->removeMedia($media);
        $object->setMedia(null);
    }

    public function removeMedia(Media $media): void
    {
        $this->em->remove($media);
    }

    public function removeFromMailingLists(User $user): void
    {
        $mailingListUsers = $this->mailingListUserRepository->getMailingListUserByUser($user);
        foreach ($mailingListUsers as $mailingListUser) {
            $this->em->remove($mailingListUser);
        }
    }

    private function disableSluggableListeners(): void
    {
        $eventManager = $this->em->getEventManager();
        foreach ($eventManager->getListeners() as $eventName => $listeners) {
            foreach ($listeners as $listener) {
                if ($listener instanceof SluggableListener) {
                    $this->sluggableListeners[$eventName][] = $listener;
                    $eventManager->removeEventListener($eventName, $listener);
                }
            }
        }
    }

    private function enableSluggableListeners(): void
    {
        if (empty($this->sluggableListeners)) {
            return;
        }

        $eventManager = $this->em->getEventManager();
        foreach ($this->sluggableListeners as $eventName => $listeners) {
            foreach ($listeners as $listener) {
                $eventManager->addEventListener($eventName, $listener);
            }
        }

        $this->sluggableListeners = [];
    }
}
