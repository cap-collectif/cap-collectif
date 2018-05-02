<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Proposal;
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
        $user = $this->em->getRepository(User::class)->find($input['userId']);

        $proposals = $this->em->getRepository(Proposal::class)->findBy(['user' => $user]);
        $comments = $this->em->getRepository(Comment::class)->findBy(['user' => $user]);

        if ('hard' === $removalType && $user) {
            $this->anonymizeUser($user);
            $this->deleteProposalsAndCommentsContent($user, $proposals, $comments);
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

        $user->setEmail('');
        $user->setUsername($usernameDeleted);
        $user->setDeletedAt(new \DateTime());

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

        $user->setAddress2(null);
        $user->setZipCode(null);
        $user->setNeighborhood(null);
        $user->setPhone(null);
        $user->setCity(null);
        $user->setBiography(null);
        $user->setFollowingProposals(null);
        $user->setDateOfBirth(null);
        $user->setFirstname(null);
        $user->setLastname(null);
        $user->setWebsite(null);
        $user->setGender(null);
        $user->setLocale(null);
        $user->setTimezone(null);
        $user->setTimezone(null);
        $user->setMedia(null);
    }

    public function deleteProposalsAndCommentsContent(User $user, array $proposals, array $comments)
    {
        $deletedBodyText = $this->translator->trans('deleted-content-by-author', [], 'CapcoAppBundle');
        $deletedTitleText = $this->translator->trans('deleted-title', [], 'CapcoAppBundle');

        foreach ($proposals as $proposal) {
            $proposal->setTitle($deletedTitleText);
            $proposal->setBody($deletedBodyText);
            $proposal->setSummary(null);
            $proposal->setMedia(null);
        }

        foreach ($comments as $comment) {
            $comment->setTitle($deletedTitleText);
            $comment->setBody($deletedBodyText);
            $comment->setSummary(null);
            $comment->setMedia(null);
        }
    }
}
