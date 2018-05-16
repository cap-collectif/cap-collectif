<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\UserBundle\Entity\User;
use JMS\Serializer\SerializationContext;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sonata\UserBundle\Controller\ProfileFOSUser1Controller as BaseController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

/**
 * @Route("/profile")
 */
class ProfileController extends BaseController
{
    /**
     * @Route("/edit-profile", name="capco_profile_edit", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:edit_profile.html.twig")
     * @Security("has_role('ROLE_USER')")
     */
    public function editProfileAction()
    {
        return [];
    }

    /**
     * @Route("/followings/{token}", name="capco_profile_followings_login")
     */
    public function loginAndShowEditFollowingsAction(Request $request, string $token)
    {
        $userNotificationsConfiguration = $this->get('capco.user_notifications_configuration.repository')->findOneBy(['unsubscribeToken' => $token]);
        if (!$userNotificationsConfiguration) {
            throw new NotFoundHttpException();
        }
        if (!$this->getUser()) {
            $this->loginWithToken($request, $userNotificationsConfiguration);
        }

        return $this->redirectToRoute('capco_profile_edit_followings');
    }

    /**
     * @Route("/notifications", name="capco_profile_notifications_edit_account")
     * @Template("@CapcoUser/Profile/edit_notifications.twig")
     * @Security("has_role('ROLE_USER')")
     */
    public function showNotificationsOptionsAction(Request $request)
    {
        return [];
    }

    /**
     * @Route("/notifications/{token}", name="capco_profile_notifications_login")
     */
    public function loginAndShowNotificationsOptionsAction(Request $request, string $token)
    {
        $userNotificationsConfiguration = $this->get('capco.user_notifications_configuration.repository')->findOneBy(['unsubscribeToken' => $token]);
        if (!$userNotificationsConfiguration) {
            throw new NotFoundHttpException();
        }
        if (!$this->getUser()) {
            $this->loginWithToken($request, $userNotificationsConfiguration);
        }

        return $this->redirectToRoute('capco_profile_notifications_edit_account');
    }

    /**
     * @Route("/notifications/disable/{token}", name="capco_profile_notifications_disable")
     * @Security("has_role('ROLE_USER')")
     *
     * @param Request $request
     */
    public function disableNotificationsAction(Request $request, string $token)
    {
        /** @var UserNotificationsConfiguration $userNotificationsConfiguration */
        $userNotificationsConfiguration = $this->get('capco.user_notifications_configuration.repository')->findOneBy(['unsubscribeToken' => $token]);
        if (!$userNotificationsConfiguration) {
            throw new NotFoundHttpException();
        }
        if (!$this->getUser()) {
            $this->loginWithToken($request, $userNotificationsConfiguration);
        }
        $userNotificationsConfiguration->disableAllNotifications();
        $this->get('doctrine.orm.default_entity_manager')->flush($userNotificationsConfiguration);
        $this->addFlash('sonata_flash_success', $this->get('translator')->trans('resetting.notifications.flash.success', [], 'CapcoAppBundle'));

        return $this->redirectToRoute('capco_profile_notifications_edit_account');
    }

    /**
     * @Route("/", name="capco_user_profile_show", defaults={"_feature_flags" = "profiles"})
     * @Route("/{slug}", name="capco_user_profile_show_all", defaults={"_feature_flags" = "profiles"})
     * @Template()
     * @Cache(smaxage="120", public=true)
     */
    public function showAction(string $slug = null)
    {
        if (!$slug && !$this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {
            throw $this->createAccessDeniedException();
        }
        $doctrine = $this->getDoctrine();

        $user = $slug
          ? $doctrine->getRepository('CapcoUserBundle:User')->findOneBySlug($slug)
          : $this->get('security.token_storage')->getToken()->getUser()
        ;

        if (!$user) {
            throw $this->createNotFoundException();
        }

        $serializer = $this->get('jms_serializer');

        $projectsRaw = $doctrine
            ->getRepository('CapcoAppBundle:Project')
            ->getByUser($user);

        $projectsProps = $serializer->serialize([
            'projects' => $projectsRaw,
        ], 'json', SerializationContext::create()->setGroups(['Projects', 'UserDetails', 'Steps', 'ThemeDetails', 'ProjectType']));
        $projectsCount = count($projectsRaw);

        $opinionTypesWithUserOpinions = $doctrine->getRepository('CapcoAppBundle:OpinionType')->getByUser($user);
        $versions = $doctrine->getRepository('CapcoAppBundle:OpinionVersion')->getByUser($user);
        $arguments = $doctrine->getRepository('CapcoAppBundle:Argument')->getByUser($user);

        $replies = $this
            ->getDoctrine()
            ->getManager()
            ->getRepository('CapcoAppBundle:Reply')
            ->findBy([
                'author' => $user,
                'private' => false,
            ]);

        $sources = $doctrine->getRepository('CapcoAppBundle:Source')->getByUser($user);
        $comments = $doctrine->getRepository('CapcoAppBundle:Comment')->getByUser($user);
        $votes = $doctrine->getRepository('CapcoAppBundle:AbstractVote')->getPublicVotesByUser($user);

        return array_merge([
            'user' => $user,
            'projectsProps' => $projectsProps,
            'projectsCount' => $projectsCount,
            'opinionTypesWithUserOpinions' => $opinionTypesWithUserOpinions,
            'versions' => $versions,
            'arguments' => $arguments,
            'replies' => $replies,
            'sources' => $sources,
            'comments' => $comments,
            'votes' => $votes,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        ], $this->getProposalsProps($user));
    }

    /**
     * @Route("/{slug}/projects", name="capco_user_profile_show_projects", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserProjects.html.twig")
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
        ], 'json', SerializationContext::create()->setGroups(['Projects', 'Steps', 'ThemeDetails']));
        $projectsCount = count($projectsRaw);

        return [
            'user' => $user,
            'projectsProps' => $projectsProps,
            'projectsCount' => $projectsCount,
        ];
    }

    /**
     * @Route("/{slug}/opinions", name="capco_user_profile_show_opinions", defaults={"_feature_flags" = "profiles"})
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
     * @Route("/{slug}/versions", name="capco_user_profile_show_opinions_versions", defaults={"_feature_flags" = "profiles"})
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
     * @Route("/{slug}/proposals", name="capco_user_profile_show_proposals", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserProposals.html.twig")
     */
    public function showProposalsAction(User $user)
    {
        return array_merge([
            'user' => $user,
        ], $this->getProposalsProps($user));
    }

    /**
     * @Route("/{slug}/replies", name="capco_user_profile_show_replies", defaults={"_feature_flags" = "profiles"})
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
     * @Route("/{slug}/arguments", name="capco_user_profile_show_arguments", defaults={"_feature_flags" = "profiles"})
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
     * @Route("/{slug}/sources", name="capco_user_profile_show_sources", defaults={"_feature_flags" = "profiles"})
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
     * @Route("/{slug}/comments", name="capco_user_profile_show_comments", defaults={"_feature_flags" = "profiles"})
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
     * @Route("/{slug}/votes", name="capco_user_profile_show_votes", defaults={"_feature_flags" = "profiles"})
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

    private function getProposalsProps(User $user)
    {
        $proposalsWithStep = $this
          ->getDoctrine()->getRepository('CapcoAppBundle:Proposal')
          ->getProposalsGroupedByCollectSteps($user, $this->getUser() !== $user)
      ;
        $proposalsCount = array_reduce($proposalsWithStep, function ($sum, $item) {
            $sum += count($item['proposals']);

            return $sum;
        });
        $proposalsPropsBySteps = [];
        foreach ($proposalsWithStep as $key => $value) {
            $proposalsPropsBySteps[$key] = json_decode($this->get('jms_serializer')->serialize($value, 'json', SerializationContext::create()->setGroups(['Steps', 'Proposals', 'PrivateProposals', 'ProposalResponses', 'UsersInfos', 'UserMedias'])), true);
        }

        return [
        'proposalsPropsBySteps' => $proposalsPropsBySteps,
        'proposalsCount' => $proposalsCount,
      ];
    }

    private function loginWithToken(Request $request, UserNotificationsConfiguration $userNotificationsConfiguration)
    {
        $user = $userNotificationsConfiguration->getUser();
        $userToken = new UsernamePasswordToken($user, null, $this->container->getParameter('fos_user.firewall_name'), $user->getRoles());
        $this->get('security.token_storage')->setToken($userToken);
        $logInEvent = new InteractiveLoginEvent($request, $userToken);
        $this->get('event_dispatcher')->dispatch('security.interactive_login', $logInEvent);
    }
}
