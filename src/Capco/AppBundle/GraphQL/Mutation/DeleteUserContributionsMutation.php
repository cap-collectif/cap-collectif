<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Symfony\Component\Translation\TranslatorInterface;

class DeleteUserContributionsMutation implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    private $em;
    private $translator;

    public function __construct(EntityManagerInterface $em, TranslatorInterface $translator)
    {
        $this->em = $em;
        $this->translator = $translator;
    }

    public function __invoke(Argument $input): array
    {
        $removalType = $input['removal'];
        $user = $this->em->getRepository(User::class)->find(['id' => $input['userId']]);
        $contributions = $user->getContributions();

        if ('hard' === $removalType && $user) {
            $this->anonymizeUser($user);
            $this->deleteProposalsAndCommentsContent($user, $contributions);
        } elseif ('soft' === $removalType && $user) {
            $this->anonymizeUser($user);
        } elseif (!$user) {
            throw new \RuntimeException('User not find');
        } else {
            throw new \RuntimeException("this type of remove user account don't exist");
        }

        return  ['userId' => $user->getId()];
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
        $user->setMedia(null);

        $this->em->flush();
    }

    public function deleteProposalsAndCommentsContent(User $user, array $contributions)
    {
        $deletedBodyText = $this->translator->trans('deleted-content-by-author', [], 'CapcoAppBundle');
        $deletedTitleText = $this->translator->trans('deleted-title', [], 'CapcoAppBundle');

        $reports = $this->em->getRepository(Reporting::class)->findBy(['Reporter' => $user]);
        $events = $this->em->getRepository(Event::class)->findBy(['Author' => $user]);
        $projects = $this->em->getRepository(Project::class)->findBy(['Author' => $user]);
        //$blogPosts = $this->em->getRepository(Post::class)->findBy(['Authors' => $user]);

        foreach ($contributions as $contribution) {
            if ($contribution instanceof Comment
            || $contribution instanceof Source
            || $contribution instanceof AbstractVote
            || $contribution instanceof \Capco\AppBundle\Entity\Argument) {
                if (method_exists($contribution, 'getStep') && $contribution->getStep()->getEndAt() > new \DateTime()) {
                    $this->em->remove($contribution);
                }
            }

            if (method_exists($contribution, 'setTitle')) {
                $contribution->setTitle($deletedTitleText);
            }
            if (method_exists($contribution, 'setBody')) {
                $contribution->setBody($deletedBodyText);
            }
            if (method_exists($contribution, 'setSummary')) {
                $contribution->setSummary(null);
            }
            if (method_exists($contribution, 'setMedia')) {
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

        foreach ($projects as $project) {
            $project->setTitle($deletedTitleText);
        }

        /*foreach ($blogPosts as $blogPost) {
            $this->em->remove($blogPost);
        }*/

        $this->em->flush();
    }
}
