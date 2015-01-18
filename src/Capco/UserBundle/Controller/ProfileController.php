<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
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
        $blocks = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->findByUser($user);
        $arguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getEnabledArgumentsByUser($user);
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getUser($user);
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getByUser($user);

        $countOpinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->countOpinionsByUser($user);
        $countArguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->countArgumentsByUser($user);
        $countIdeas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->countIdeasEnabledAndNotTrashedByUser($user);
        $countSources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->countSourcesByUser($user);

        return [
            'user'   => $user,
            'blocks' => $blocks,
            'arguments' => $arguments,
            'ideas' => $ideas,
            'sources' => $sources,
            'argumentsLabels' => Argument::$argumentTypesLabels,
            'countOpinions' => $countOpinions,
            'countArguments' => $countArguments,
            'countIdeas' => $countIdeas,
            'countSources' => $countSources,
        ];
    }

    /**
     * @Route("/user/{username}", name="capco_user_profile_show_all")
     * @param User $user
     * @Template("CapcoUserBundle:Profile:show.html.twig")
     * @return array
     */
    public function showUserAction(User $user)
    {
        $user = $this->container->get('fos_user.user_manager')->findUserByUsername($user);

        if ($user==null){
            throw $this->createNotFoundException('user.not_found');
        }

        $blocks = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->findByUser($user);
        $arguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getEnabledArgumentsByUser($user);
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getUser($user);
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getByUser($user);

        $countOpinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->countOpinionsByUser($user);
        $countArguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->countArgumentsByUser($user);
        $countIdeas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->countIdeasEnabledAndNotTrashedByUser($user);
        $countSources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->countSourcesByUser($user);

        return [
            'user' => $user,
            'blocks' => $blocks,
            'arguments' => $arguments,
            'ideas' => $ideas,
            'sources' => $sources,
            'argumentsLabels' => Argument::$argumentTypesLabels,
            'countOpinions' => $countOpinions,
            'countArguments' => $countArguments,
            'countIdeas' => $countIdeas,
            'countSources' => $countSources,
        ];
    }

    /**
     * @Route("/{username}/opinions", name="capco_user_profile_show_opinions")
     * @param User $user
     * @return array
     * @Template("CapcoUserBundle:Profile:showUserOpinions.html.twig")
     */
    public function showUserOpinionsAction(User $user)
    {
        $blocks = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionType')->findByUser($user);

        $countOpinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->countOpinionsByUser($user);
        $countArguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->countArgumentsByUser($user);
        $countIdeas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->countIdeasEnabledAndNotTrashedByUser($user);
        $countSources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->countSourcesByUser($user);

        return [
            'user' => $user,
            'blocks' => $blocks,
            'countOpinions' => $countOpinions,
            'countArguments' => $countArguments,
            'countIdeas' => $countIdeas,
            'countSources' => $countSources,
        ];
    }

    /**
     * @Route("/{username}/arguments", name="capco_user_profile_show_arguments")
     * @param User $user
     * @return array
     * @Template("CapcoUserBundle:Profile:showUserArguments.html.twig")
     */
    public function showArgumentsAction(User $user)
    {
        $arguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->getEnabledArgumentsByUser($user);

        $countOpinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->countOpinionsByUser($user);
        $countArguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->countArgumentsByUser($user);
        $countIdeas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->countIdeasEnabledAndNotTrashedByUser($user);
        $countSources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->countSourcesByUser($user);

        return array(
            'user' => $user,
            'arguments' => $arguments,
            'countOpinions' => $countOpinions,
            'countArguments' => $countArguments,
            'countIdeas' => $countIdeas,
            'countSources' => $countSources,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        );
    }

    /**
     * @Route("/{username}/ideas", name="capco_user_profile_show_ideas")
     * @param User $user
     * @return array
     * @Template("CapcoUserBundle:Profile:showUserIdeas.html.twig")
     */
    public function showIdeasAction(User $user)
    {
        $ideas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->getUser($user);

        $countOpinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->countOpinionsByUser($user);
        $countArguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->countArgumentsByUser($user);
        $countIdeas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->countIdeasEnabledAndNotTrashedByUser($user);
        $countSources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->countSourcesByUser($user);

        return array(
            'user' => $user,
            'ideas' => $ideas,
            'countOpinions' => $countOpinions,
            'countArguments' => $countArguments,
            'countIdeas' => $countIdeas,
            'countSources' => $countSources,
        );
    }

    /**
     * @Route("/{username}/sources", name="capco_user_profile_show_sources")
     * @param User $user
     * @return array
     * @Template("CapcoUserBundle:Profile:showUserSources.html.twig")
     */
    public function showSourcesAction(User $user)
    {
        $sources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->getByUser($user);

        $countOpinions = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->countOpinionsByUser($user);
        $countArguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->countArgumentsByUser($user);
        $countIdeas = $this->getDoctrine()->getRepository('CapcoAppBundle:Idea')->countIdeasEnabledAndNotTrashedByUser($user);
        $countSources = $this->getDoctrine()->getRepository('CapcoAppBundle:Source')->countSourcesByUser($user);

        return array(
            'user' => $user,
            'sources' => $sources,
            'countOpinions' => $countOpinions,
            'countArguments' => $countArguments,
            'countIdeas' => $countIdeas,
            'countSources' => $countSources,
        );
    }

}
