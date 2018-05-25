<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\NewsletterSubscription;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\UserGroup;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Translation\TranslatorInterface;

class DeleteAccountMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    private $em;
    private $translator;

    public function __construct(EntityManagerInterface $em, TranslatorInterface $translator)
    {
        $this->em = $em;
        $this->translator = $translator;
    }

    public function __invoke(Request $request, Arg $input, User $user): array
    {
        $deleteType = $input['type'];
        $this->hardDeleteUserContributionsInActiveSteps($user);
        if ('HARD' === $deleteType && $user) {
            $this->hardDelete($user);
        }
        $this->anonymizeUser($user);

        $this->em->flush();

        return [
            'userId' => $user->getId(),
        ];
    }

    public function anonymizeUser(User $user): void
    {
        $usernameDeleted = $this->translator->trans('deleted-user', [], 'CapcoAppBundle');
        $newsletter = $this->em->getRepository(NewsletterSubscription::class)->findOneBy(['email' => $user->getEmail()]);
        $userGroups = $this->em->getRepository(UserGroup::class)->findBy(['user' => $user]);
        $userManager = $this->container->get('fos_user.user_manager');

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
        $user->setUsername($usernameDeleted);
        $user->setDeletedAccountAt(new \DateTime());
        $user->setPlainPassword(null);
        $user->clearLastLogin();

        $user->setFacebookId(null);
        $user->setFacebookUrl(null);
        $user->setFacebookData(null);
        $user->setFacebookName(null);
        $user->setFacebookAccessToken(null);

        $user->setTwitterId(null);
        $user->setTwitterUrl(null);
        $user->setTwitterData(null);
        $user->setTwitterName(null);
        $user->setTwitterAccessToken(null);

        $user->setGoogleId(null);
        $user->setGplusData(null);
        $user->setGplusName(null);
        $user->setGoogleAccessToken(null);
        $user->setGplusData(null);

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
        $user->setTimezone(null);
        $user->setLocked(true);

        if ($user->getMedia()) {
            $media = $this->em->getRepository('CapcoMediaBundle:Media')->find($user->getMedia()->getId());
            $this->removeMedia($media);
            $user->setMedia(null);
        }

        $userManager->updateUser($user);
    }

    public function hardDeleteUserContributionsInActiveSteps(User $user, bool $dryRun = false): int
    {
        $deletedBodyText = $this->translator->trans('deleted-content-by-author', [], 'CapcoAppBundle');
        $contributions = $user->getContributions();
        $toDeleteList = [];

        foreach ($contributions as $contribution) {
            if ($contribution instanceof AbstractVote) {
                if ($contribution instanceof CommentVote) {
                    $toDeleteList[] = $contribution;
                } else {
                    if (method_exists($contribution->getRelatedEntity(), 'getStep') && $contribution->getRelatedEntity()->getStep()->canContribute()) {
                        $toDeleteList[] = $contribution;
                    }
                }
            }

            if ($contribution instanceof Comment) {
                $hasChild = $this->em->getRepository('CapcoAppBundle:Comment')->findOneBy(['parent' => $contribution->getId()]);
                if ($hasChild) {
                    $contribution->setBody($deletedBodyText);
                } else {
                    $toDeleteList[] = $contribution;
                }
            }

            if (($contribution instanceof Proposal || $contribution instanceof Opinion || $contribution instanceof Source || $contribution instanceof Argument) && $contribution->getStep()->canContribute()) {
                $toDeleteList[] = $contribution;
            }

            if (!$dryRun) {
                if (method_exists($contribution, 'getMedia') && $contribution->getMedia()) {
                    $media = $this->em->getRepository('CapcoMediaBundle:Media')->find(
                        $contribution->getMedia()->getId()
                    );
                    $this->removeMedia($media);
                    $contribution->setMedia(null);
                }
            }
        }

        $count = \count($toDeleteList);
        if (!$dryRun) {
            foreach ($toDeleteList as $toDelete) {
                $this->em->remove($toDelete);
            }
        }

        $this->container->get('redis_storage.helper')->recomputeUserCounters($user);

        return $count;
    }

    public function hardDelete(User $user): void
    {
        $contributions = $user->getContributions();
        $deletedBodyText = $this->translator->trans('deleted-content-by-author', [], 'CapcoAppBundle');
        $deletedTitleText = $this->translator->trans('deleted-title', [], 'CapcoAppBundle');

        $reports = $this->em->getRepository(Reporting::class)->findBy(['Reporter' => $user]);
        $events = $this->em->getRepository(Event::class)->findBy(['Author' => $user]);

        foreach ($contributions as $contribution) {
            if (method_exists($contribution, 'setTitle')) {
                $contribution->setTitle($deletedTitleText);
            }
            if (method_exists($contribution, 'setBody')) {
                $contribution->setBody($deletedBodyText);
            }
            if (method_exists($contribution, 'setSummary')) {
                $contribution->setSummary(null);
            }
            if (method_exists($contribution, 'getMedia') && $contribution->getMedia()) {
                $media = $this->em->getRepository('CapcoMediaBundle:Media')->find($contribution->getMedia()->getId());
                $this->removeMedia($media);
                $contribution->setMedia(null);
            }
        }

        foreach ($reports as $report) {
            $report->setBody($deletedBodyText);
            $report->setTitle($deletedTitleText);
            $report->setSummary(null);
            $report->setMedia(null);
        }

        foreach ($events as $event) {
            $this->em->remove($event);
        }

        $this->container->get('redis_storage.helper')->recomputeUserCounters($user);
    }

    public function removeMedia(Media $media): void
    {
        $provider = $this->container->get($media->getProviderName());
        $provider->removeThumbnails($media);
        $this->em->remove($media);
    }
}
