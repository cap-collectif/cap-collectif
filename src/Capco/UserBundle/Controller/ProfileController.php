<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Capco\UserBundle\Entity\User;
use Sonata\UserBundle\Controller\ProfileFOSUser1Controller as BaseController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

/**
 * @Route("/profile")
 */
class ProfileController extends BaseController
{
    /**
     * @Route("/", name="capco_user_profile_show")
     * @Template()
     */
    public function showAction()
    {
        if (!$this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_REMEMBERED')) {
            throw $this->createAccessDeniedException();
        }

        $doctrine = $this->getDoctrine();
        $user = $this->get('security.token_storage')->getToken()->getUser();
        $opinionTypesWithUserOpinions = $doctrine->getRepository('CapcoAppBundle:OpinionType')->getByUser($user);
        $versions = $doctrine->getRepository('CapcoAppBundle:OpinionVersion')->getByUser($user);
        $arguments = $doctrine->getRepository('CapcoAppBundle:Argument')->getByUser($user);
        $ideas = $doctrine->getRepository('CapcoAppBundle:Idea')->getByUser($user);
        $sources = $doctrine->getRepository('CapcoAppBundle:Source')->getByUser($user);
        $comments = $doctrine->getRepository('CapcoAppBundle:AbstractComment')->getByUser($user);
        $votes = $doctrine->getRepository('CapcoAppBundle:AbstractVote')->getByUser($user);

        return [
            'user' => $user,
            'opinionTypesWithUserOpinions' => $opinionTypesWithUserOpinions,
            'versions' => $versions,
            'arguments' => $arguments,
            'ideas' => $ideas,
            'sources' => $sources,
            'comments' => $comments,
            'votes' => $votes,
            'argumentsLabels' => Argument::$argumentTypesLabels,
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

    /**
     * @Route("/{slug}", name="capco_user_profile_show_all")
     * @Template("CapcoUserBundle:Profile:show.html.twig")
     */
    public function showUserAction(User $user)
    {
        $doctrine = $this->getDoctrine();
        $opinionTypesWithUserOpinions = $doctrine->getRepository('CapcoAppBundle:OpinionType')->getByUser($user);
        $versions = $doctrine->getRepository('CapcoAppBundle:OpinionVersion')->getByUser($user);
        $arguments = $doctrine->getRepository('CapcoAppBundle:Argument')->getByUser($user);
        $ideas = $doctrine->getRepository('CapcoAppBundle:Idea')->getByUser($user);
        $sources = $doctrine->getRepository('CapcoAppBundle:Source')->getByUser($user);
        $comments = $doctrine->getRepository('CapcoAppBundle:AbstractComment')->getByUser($user);
        $votes = $doctrine->getRepository('CapcoAppBundle:AbstractVote')->getByUser($user);

        return [
            'user' => $user,
            'opinionTypesWithUserOpinions' => $opinionTypesWithUserOpinions,
            'versions' => $versions,
            'arguments' => $arguments,
            'ideas' => $ideas,
            'sources' => $sources,
            'comments' => $comments,
            'votes' => $votes,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        ];
    }

    /**
     * @Route("/{slug}/opinions", name="capco_user_profile_show_opinions")
     * @Template("CapcoUserBundle:Profile:showUserOpinions.html.twig")
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
     * @Route("/{slug}/arguments", name="capco_user_profile_show_arguments")
     * @Template("CapcoUserBundle:Profile:showUserArguments.html.twig")
     */
    public function showArgumentsAction(User $user)
    {
        $arguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getByUser($user);

        return array(
            'user' => $user,
            'arguments' => $arguments,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        );
    }

    /**
     * @Route("/{slug}/ideas", name="capco_user_profile_show_ideas", defaults={"_feature_flags" = "ideas"})
     * @Template("CapcoUserBundle:Profile:showUserIdeas.html.twig")
     */
    public function showIdeasAction(User $user)
    {
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getByUser($user);

        return array(
            'user' => $user,
            'ideas' => $ideas,
        );
    }

    /**
     * @Route("/{slug}/sources", name="capco_user_profile_show_sources")
     * @Template("CapcoUserBundle:Profile:showUserSources.html.twig")
     */
    public function showSourcesAction(User $user)
    {
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getByUser($user);

        return array(
            'user' => $user,
            'sources' => $sources,
        );
    }

    /**
     * @Route("/{slug}/comments", name="capco_user_profile_show_comments")
     * @Template("CapcoUserBundle:Profile:showUserComments.html.twig")
     */
    public function showCommentsAction(User $user)
    {
        $comments = $this->getDoctrine()->getRepository('CapcoAppBundle:AbstractComment')->getByUser($user);

        return array(
            'user' => $user,
            'comments' => $comments,
        );
    }

    /**
     * @Route("/{slug}/votes", name="capco_user_profile_show_votes")
     * @Template("CapcoUserBundle:Profile:showUserVotes.html.twig")
     */
    public function showVotesAction(User $user)
    {
        $votes = $this->getDoctrine()->getRepository('CapcoAppBundle:AbstractVote')->getByUser($user);

        return array(
            'user' => $user,
            'votes' => $votes,
        );
    }
}
