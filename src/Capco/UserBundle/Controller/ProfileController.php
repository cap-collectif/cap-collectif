<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Capco\UserBundle\Entity\User;
use Sonata\UserBundle\Controller\ProfileFOSUser1Controller as BaseController;

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
        if (!$this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {
            throw $this->createAccessDeniedException();
        }

        $user = $this->get('security.token_storage')->getToken()->getUser();
        $blocks = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->getByUser($user);
        $arguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getByUser($user);
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getByUser($user);
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getByUser($user);
        $comments = $this->getDoctrine()->getRepository('CapcoAppBundle:AbstractComment')->getByUser($user);

        return [
            'user'   => $user,
            'blocks' => $blocks,
            'arguments' => $arguments,
            'ideas' => $ideas,
            'sources' => $sources,
            'comments' => $comments,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        ];
    }

    /**
     * @Route("/user/{slug}", name="capco_user_profile_show_all")
     *
     * @param User $user
     * @Template("CapcoUserBundle:Profile:show.html.twig")
     *
     * @return array
     */
    public function showUserAction(User $user)
    {
        $blocks = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->getByUser($user);
        $arguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getByUser($user);
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getByUser($user);
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getByUser($user);
        $comments = $this->getDoctrine()->getRepository('CapcoAppBundle:AbstractComment')->getByUser($user);

        return [
            'user' => $user,
            'blocks' => $blocks,
            'arguments' => $arguments,
            'ideas' => $ideas,
            'sources' => $sources,
            'comments' => $comments,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        ];
    }

    /**
     * @Route("/{slug}/opinions", name="capco_user_profile_show_opinions")
     *
     * @param User $user
     *
     * @return array
     * @Template("CapcoUserBundle:Profile:showUserOpinions.html.twig")
     */
    public function showOpinionsAction(User $user)
    {
        $blocks = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->getByUser($user);

        return [
            'user' => $user,
            'blocks' => $blocks,
        ];
    }

    /**
     * @Route("/{slug}/arguments", name="capco_user_profile_show_arguments")
     *
     * @param User $user
     *
     * @return array
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
     * @Route("/{slug}/ideas", name="capco_user_profile_show_ideas")
     *
     * @param User $user
     *
     * @return array
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
     *
     * @param User $user
     *
     * @return array
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
     *
     * @param User $user
     *
     * @return array
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
}
