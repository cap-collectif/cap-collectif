<?php

namespace Capco\AppBundle\Anonymizer;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalAuthorDataLoader;
use Capco\AppBundle\Repository\MailingListRepository;
use Capco\AppBundle\Repository\NewsletterSubscriptionRepository;
use Capco\AppBundle\Repository\UserGroupRepository;
use Capco\MediaBundle\Entity\Media;
use Capco\MediaBundle\Repository\MediaRepository;
use Capco\UserBundle\Doctrine\UserManager;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Psr\Log\LoggerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class UserAnonymizer
{
    public const CANNOT_DELETE_USER_PROFILE_IMAGE = 'Cannot delete user profile image !';

    private EntityManagerInterface $em;
    private UserGroupRepository $groupRepository;
    private NewsletterSubscriptionRepository $newsletterSubscriptionRepository;
    private LoggerInterface $logger;
    private ProposalAuthorDataLoader $proposalAuthorDataLoader;
    private UserManager $userManager;
    private MediaRepository $mediaRepository;
    private MailingListRepository $mailingListRepository;
    private TranslatorInterface $translator;

    public function __construct(
        EntityManagerInterface $em,
        UserGroupRepository $groupRepository,
        NewsletterSubscriptionRepository $newsletterSubscriptionRepository,
        LoggerInterface $logger,
        ProposalAuthorDataLoader $proposalAuthorDataLoader,
        UserManager $userManager,
        MediaRepository $mediaRepository,
        MailingListRepository $mailingListRepository,
        TranslatorInterface $translator
    ) {
        $this->em = $em;
        $this->groupRepository = $groupRepository;
        $this->newsletterSubscriptionRepository = $newsletterSubscriptionRepository;
        $this->logger = $logger;
        $this->proposalAuthorDataLoader = $proposalAuthorDataLoader;
        $this->userManager = $userManager;
        $this->mediaRepository = $mediaRepository;
        $this->mailingListRepository = $mailingListRepository;
        $this->translator = $translator;
    }

    public function anonymize(User $user): void
    {
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
        foreach ($this->mailingListRepository->getMailingListByUser($user) as $mailingList) {
            $mailingList->getUsers()->removeElement($user);
        }
    }
}
