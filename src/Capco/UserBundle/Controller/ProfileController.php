<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Capco\UserBundle\Entity\User;
use Sonata\UserBundle\Controller\ProfileFOSUser1Controller as BaseController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;
use JMS\Serializer\SerializationContext;

/**
 * @Route("/profile")
 */
class ProfileController extends BaseController
{
    /**
     * @Route("/", name="capco_user_profile_show")
     * @Template()
     * @Security("has_role('ROLE_USER')")
     */
    public function showAction()
    {
        $doctrine = $this->getDoctrine();
        $serializer = $this->get('jms_serializer');
        $user = $this->get('security.token_storage')->getToken()->getUser();

        $projectsRaw = $doctrine
            ->getRepository('CapcoAppBundle:Project')
            ->getByUser($user)
        ;
        $projectsProps = $serializer->serialize([
            'projects' => $projectsRaw,
        ], 'json', SerializationContext::create()->setGroups(['Projects', 'Steps', 'Themes']));
        $projectsCount = count($projectsRaw);

        $opinionTypesWithUserOpinions = $doctrine->getRepository('CapcoAppBundle:OpinionType')->getByUser($user);
        $versions = $doctrine->getRepository('CapcoAppBundle:OpinionVersion')->getByUser($user);
        $arguments = $doctrine->getRepository('CapcoAppBundle:Argument')->getByUser($user);
        $ideas = $doctrine->getRepository('CapcoAppBundle:Idea')->getByUser($user);

        $proposalsRaw = $doctrine
            ->getRepository('CapcoAppBundle:Proposal')
            ->getByUser($user)
        ;
        $proposals = $serializer->serialize([
            'proposals' => $proposalsRaw,
        ], 'json', SerializationContext::create()->setGroups(['Proposals', 'ProposalResponses', 'UsersInfos', 'UserMedias']));
        $proposalsCount = count($proposalsRaw);

        $replies = $this
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Reply')
            ->findBy([
                'author' => $user,
                'private' => false,
            ]);

        $sources = $doctrine->getRepository('CapcoAppBundle:Source')->getByUser($user);
        $comments = $doctrine->getRepository('CapcoAppBundle:Comment')->getByUser($user);
        $votes = $doctrine->getRepository('CapcoAppBundle:AbstractVote')->getPublicVotesByUser($user);

        return [
            'user' => $user,
            'projectsProps' => $projectsProps,
            'projectsCount' => $projectsCount,
            'opinionTypesWithUserOpinions' => $opinionTypesWithUserOpinions,
            'versions' => $versions,
            'arguments' => $arguments,
            'ideas' => $ideas,
            'proposals' => $proposals,
            'proposalsCount' => $proposalsCount,
            'replies' => $replies,
            'sources' => $sources,
            'comments' => $comments,
            'votes' => $votes,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        ];
    }

    /**
     * @Route("/{slug}", name="capco_user_profile_show_all")
     * @Template("CapcoUserBundle:Profile:show.html.twig")
     */
    public function showUserAction(User $user)
    {
        $serializer = $this->get('jms_serializer');
        $doctrine = $this->getDoctrine();
        $projectsRaw = $doctrine
            ->getRepository('CapcoAppBundle:Project')
            ->getByUser($user)
        ;
        $projectsProps = $serializer->serialize([
            'projects' => $projectsRaw,
        ], 'json', SerializationContext::create()->setGroups(['Projects', 'Steps', 'Themes']));
        $projectsCount = count($projectsRaw);
        $opinionTypesWithUserOpinions = $doctrine->getRepository('CapcoAppBundle:OpinionType')->getByUser($user);
        $versions = $doctrine->getRepository('CapcoAppBundle:OpinionVersion')->getByUser($user);
        $arguments = $doctrine->getRepository('CapcoAppBundle:Argument')->getByUser($user);
        $ideas = $doctrine->getRepository('CapcoAppBundle:Idea')->getByUser($user);
        $proposalsRaw = $doctrine
            ->getRepository('CapcoAppBundle:Proposal')
            ->getByUser($user)
        ;
        $proposals = $serializer->serialize([
            'proposals' => $proposalsRaw,
        ], 'json', SerializationContext::create()->setGroups(['Proposals', 'ProposalResponses', 'UsersInfos', 'UserMedias']));
        $proposalsCount = count($proposalsRaw);
        $replies = $this
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Reply')
            ->findBy([
                'author' => $user,
                'private' => false,
            ]);
        $sources = $doctrine->getRepository('CapcoAppBundle:Source')->getByUser($user);
        $comments = $doctrine->getRepository('CapcoAppBundle:Comment')->getByUser($user);
        $votes = $doctrine->getRepository('CapcoAppBundle:AbstractVote')->getPublicVotesByUser($user);

        return [
            'user' => $user,
            'projectsProps' => $projectsProps,
            'projectsCount' => $projectsCount,
            'opinionTypesWithUserOpinions' => $opinionTypesWithUserOpinions,
            'versions' => $versions,
            'arguments' => $arguments,
            'ideas' => $ideas,
            'proposals' => $proposals,
            'proposalsCount' => $proposalsCount,
            'replies' => $replies,
            'sources' => $sources,
            'comments' => $comments,
            'votes' => $votes,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        ];
    }

    /**
     * @Route("/{slug}/projects", name="capco_user_profile_show_projects")
     * @Template("CapcoUserBundle:Profile:showUserProjects.html.twig")
     *
     * @param User $user
     *
     * @return array
     */
    public function showProjectsAction(User $user)
    {
        $serializer = $this->get('jms_serializer');
        $projectsRaw = $this
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Project')
            ->getByUser($user)
        ;
        $projectsProps = $serializer->serialize([
            'projects' => $projectsRaw,
        ], 'json', SerializationContext::create()->setGroups(['Projects', 'Steps', 'Themes']));
        $projectsCount = count($projectsRaw);

        return [
            'user' => $user,
            'projectsProps' => $projectsProps,
            'projectsCount' => $projectsCount,
        ];
    }

    /**
     * @Route("/{slug}/opinions", name="capco_user_profile_show_opinions")
     * @Template("CapcoUserBundle:Profile:showUserOpinions.html.twig")
     *
     * @param User $user
     *
     * @return array
     */
    public function showOpinionsAction(User $user)
    {
        $opinionTypesWithUserOpinions = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->getByUser($user);

        return [
            'user' => $user,
            'opinionTypesWithUserOpinions' => $opinionTypesWithUserOpinions,
        ];
    }

    /**
     * @Route("/{slug}/versions", name="capco_user_profile_show_opinions_versions")
     * @Template("CapcoUserBundle:Profile:showUserOpinionVersions.html.twig")
     */
    public function showOpinionVersionsAction(User $user)
    {
        $versions = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionVersion')->getByUser($user);

        return [
            'user' => $user,
            'versions' => $versions,
        ];
    }

    /**
     * @Route("/{slug}/proposals", name="capco_user_profile_show_proposals")
     * @Template("CapcoUserBundle:Profile:showUserProposals.html.twig")
     *
     * @param User $user
     *
     * @return array
     */
    public function showProposalsAction(User $user)
    {
        $serializer = $this->get('jms_serializer');
        $proposalsRaw = $this
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Proposal')
            ->getByUser($user)
        ;
        $proposals = $serializer->serialize([
            'proposals' => $proposalsRaw,
        ], 'json', SerializationContext::create()->setGroups(['Proposals', 'ProposalResponses', 'UsersInfos', 'UserMedias']));
        $proposalsCount = count($proposalsRaw);

        return [
            'user' => $user,
            'proposals' => $proposals,
            'proposalsCount' => $proposalsCount,
        ];
    }

    /**
     * @Route("/{slug}/replies", name="capco_user_profile_show_replies")
     * @Template("CapcoUserBundle:Profile:showUserReplies.html.twig")
     *
     * @param User $user
     *
     * @return array
     */
    public function showRepliesAction(User $user)
    {
        $replies = $this
            ->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:Reply')
            ->findBy([
                'author' => $user,
                'private' => false,
            ]);

        return [
            'user' => $user,
            'replies' => $replies,
        ];
    }

    /**
     * @Route("/{slug}/arguments", name="capco_user_profile_show_arguments")
     * @Template("CapcoUserBundle:Profile:showUserArguments.html.twig")
     */
    public function showArgumentsAction(User $user)
    {
        $arguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getByUser($user);

        return [
            'user' => $user,
            'arguments' => $arguments,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        ];
    }

    /**
     * @Route("/{slug}/ideas", name="capco_user_profile_show_ideas", defaults={"_feature_flags" = "ideas"})
     * @Template("CapcoUserBundle:Profile:showUserIdeas.html.twig")
     */
    public function showIdeasAction(User $user)
    {
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getByUser($user);

        return [
            'user' => $user,
            'ideas' => $ideas,
        ];
    }

    /**
     * @Route("/{slug}/sources", name="capco_user_profile_show_sources")
     * @Template("CapcoUserBundle:Profile:showUserSources.html.twig")
     */
    public function showSourcesAction(User $user)
    {
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getByUser($user);

        return [
            'user' => $user,
            'sources' => $sources,
        ];
    }

    /**
     * @Route("/{slug}/comments", name="capco_user_profile_show_comments")
     * @Template("CapcoUserBundle:Profile:showUserComments.html.twig")
     */
    public function showCommentsAction(User $user)
    {
        $comments = $this->getDoctrine()->getRepository('CapcoAppBundle:Comment')->getByUser($user);

        return [
            'user' => $user,
            'comments' => $comments,
        ];
    }

    /**
     * @Route("/{slug}/votes", name="capco_user_profile_show_votes")
     * @Template("CapcoUserBundle:Profile:showUserVotes.html.twig")
     */
    public function showVotesAction(User $user)
    {
        $votes = $this->getDoctrine()->getRepository('CapcoAppBundle:AbstractVote')->getPublicVotesByUser($user);

        return [
            'user' => $user,
            'votes' => $votes,
        ];
    }

    /**
     * Deprecated route, in order to harmonise real user profile stuff urls.
     *
     * @Route("/user/{slug}", name="capco_user_profile_show_all_old")
     */
    public function showUserOldAction(User $user)
    {
        return new RedirectResponse(
            $this->generateUrl('capco_user_profile_show_all', ['slug' => $user->getSlug()]),
            Response::HTTP_MOVED_PERMANENTLY
        );
    }
}
