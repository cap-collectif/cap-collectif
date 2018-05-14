<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\EventComment;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;
use Symfony\Component\Translation\TranslatorInterface;

class DeleteUserContributionsMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    private $em;
    private $translator;
    private $router;

    public function __construct(EntityManagerInterface $em, TranslatorInterface $translator, Router $router)
    {
        $this->em = $em;
        $this->translator = $translator;
        $this->router = $router;
    }

    public function __invoke(Argument $input, User $user): array
    {
        $removalType = $input['removal'];
        $contributions = $user->getContributions();

        $count['contributionsRemoved'] = 0;
        $count['contributionsContentDeleted'] = 0;

        if ('hard' === $removalType && $user) {
            $count = $this->hardDelete($user, $contributions, $count);
            $this->anonymizeUser($user);
        } elseif ('soft' === $removalType && $user) {
            $count = $this->deleteIfStepActive($user, $contributions, $count);
            $this->anonymizeUser($user);
        } elseif (!$user) {
            throw new \RuntimeException('User not find');
        } else {
            throw new \RuntimeException("This type of removing user account doesn't exist");
        }

        return [
            'userId' => $user->getId(),
            'username' => $user->getUsername(),
            'contributionsRemoved' => $count['contributionsRemoved'],
            'contributionsContentDeleted' => $count['contributionsContentDeleted'],
            'deleteUrl' => $this->router->generate('capco_delete_user', ['removalType' => $removalType], UrlGeneratorInterface::ABSOLUTE_URL),
        ];
    }

    public function anonymizeUser(User $user): void
    {
        $usernameDeleted = $this->translator->trans('deleted-user', [], 'CapcoAppBundle');

        $user->setUsername($usernameDeleted);
        $user->setEmail(time() . '@deleted.com');
        $user->setDeletedAccountAt(new \DateTime());
        $user->setPlainPassword('');

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
        $user->setGoogleUrl(null);
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

        if ($user->getMedia()) {
            $media = $this->em->getRepository('CapcoMediaBundle:Media')->find($user->getMedia()->getId());
            $this->removeMedia($media);
            $user->setMedia(null);
        }

        $this->em->flush();
    }

    public function deleteIfStepActive(User $user, array $contributions, array $count): array
    {
        $now = (new \DateTime())->format('Y-m-d H:i:s');

        foreach ($contributions as $contribution) {
            if ($contribution instanceof AbstractVote) {
                if (!$contribution instanceof CommentVote) {
                    if (method_exists($contribution->getRelatedEntity(), 'getStep') && $this->checkIfStepActive($contribution->getRelatedEntity()->getStep())) {
                        $this->em->remove($contribution);
                    }
                } else {
                    if ($contribution->getComment() instanceof ProposalComment) {
                        if (method_exists($contribution->getComment()->getRelatedObject()->getProposalForm(), 'getStep') && $this->checkIfStepActive($contribution->getComment()->getRelatedObject()->getProposalForm()->getStep())) {
                            $this->em->remove($contribution);
                        }
                    } elseif ($contribution->getComment() instanceof EventComment) {
                        if ($contribution->getComment()->getEvent()->getEndAt() > $now) {
                            $this->em->remove($contribution);
                        }
                    }
                }
            }

            if ($contribution instanceof Comment) {
                if ($contribution instanceof ProposalComment) {
                    if (method_exists($contribution->getRelatedObject()->getProposalForm(), 'getStep') && $this->checkIfStepActive($contribution->getRelatedObject()->getProposalForm()->getStep())) {
                        $this->em->remove($contribution);
                    }
                } elseif ($contribution instanceof EventComment) {
                    if ($contribution->getEvent()->getEndAt() > $now) {
                        $this->em->remove($contribution);
                    }
                }
            }

            if ($contribution instanceof Source || $contribution instanceof \Capco\AppBundle\Entity\Argument) {
                if (method_exists($contribution->getOpinion(), 'getStep') && $this->checkIfStepActive($contribution->getOpinion()->getStep())) {
                    $this->em->remove($contribution);
                }
            }

            if (method_exists($contribution, 'getMedia') && $contribution->getMedia()) {
                $media = $this->em->getRepository('CapcoMediaBundle:Media')->find($contribution->getMedia()->getId());
                $this->removeMedia($media);
                $contribution->setMedia(null);
            }
        }

        $this->container->get('redis_storage.helper')->recomputeUserCounters($user);

        return $count;
    }

    public function hardDelete(User $user, array $contributions, array $count): array
    {
        $deletedBodyText = $this->translator->trans('deleted-content-by-author', [], 'CapcoAppBundle');
        $deletedTitleText = $this->translator->trans('deleted-title', [], 'CapcoAppBundle');

        $reports = $this->em->getRepository(Reporting::class)->findBy(['Reporter' => $user]);
        $events = $this->em->getRepository(Event::class)->findBy(['Author' => $user]);

        $this->deleteIfStepActive($user, $contributions, $count);

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

            if (method_exists($contribution, 'setTitle') ||
                method_exists($contribution, 'setBody') ||
                method_exists($contribution, 'setSummary') ||
                method_exists($contribution, 'getMedia')
            ) {
                ++$count['contributionsContentDeleted'];
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

        $this->em->flush();

        return $count;
    }

    public function checkIfStepActive(AbstractStep $step)
    {
        return $step->isTimeless() || $step->getEndAt() > (new \DateTime())->format('Y-m-d H:i:s');
    }

    public function removeMedia(Media $media): void
    {
        if ($media) {
            $provider = $this->container->get($media->getProviderName());
            $provider->removeThumbnails($media);
            $this->em->remove($media);
        }
    }
}
