<?php

namespace Capco\UserBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Capco\AppBundle\Repository\AbstractVoteRepository;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\OpinionTypeRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

/**
 * @Route("/profile")
 */
class ProfileController extends Controller
{
    /**
     * @Route("/edit-profile", name="capco_profile_edit")
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
        $userNotificationsConfiguration = $this->get(
            'capco.user_notifications_configuration.repository'
        )->findOneBy(['unsubscribeToken' => $token]);
        if (!$userNotificationsConfiguration) {
            throw new NotFoundHttpException();
        }
        if (!$this->getUser()) {
            $this->loginWithToken($request, $userNotificationsConfiguration);
        }

        return $this->redirectToRoute('capco_profile_edit', ['#' => 'followings']);
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
     * @Route("/download_archive", name="capco_profile_download_archive")
     * @Security("has_role('ROLE_USER')")
     */
    public function downloadArchiveAction(Request $request)
    {
        $archive = $this->get(UserArchiveRepository::class)->getLastForUser($this->getUser());

        if (!$archive) {
            throw new NotFoundHttpException('Archive not found');
        }

        $file = $this->get('kernel')->getRootDir() . '/../web/export/' . $archive->getPath();

        if (!file_exists($file)) {
            throw new NotFoundHttpException('Export not found');
        }

        return (new BinaryFileResponse($file))->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            'export.zip'
        );
    }

    /**
     * @Route("/download_archive/{token}", name="capco_profile_data_login")
     */
    public function loginAndShowDataAction(Request $request, string $token)
    {
        $userNotificationsConfiguration = $this->get(
            'capco.user_notifications_configuration.repository'
        )->findOneBy(['unsubscribeToken' => $token]);
        if (!$userNotificationsConfiguration) {
            throw new NotFoundHttpException();
        }
        if (!$this->getUser()) {
            $this->loginWithToken($request, $userNotificationsConfiguration);
        }

        return $this->redirectToRoute('capco_profile_edit', ['#' => 'export']);
    }

    /**
     * @Route("/notifications/{token}", name="capco_profile_notifications_login")
     */
    public function loginAndShowNotificationsOptionsAction(Request $request, string $token)
    {
        $userNotificationsConfiguration = $this->get(
            'capco.user_notifications_configuration.repository'
        )->findOneBy(['unsubscribeToken' => $token]);
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
        $userNotificationsConfiguration = $this->get(
            'capco.user_notifications_configuration.repository'
        )->findOneBy(['unsubscribeToken' => $token]);
        if (!$userNotificationsConfiguration) {
            throw new NotFoundHttpException();
        }
        if (!$this->getUser()) {
            $this->loginWithToken($request, $userNotificationsConfiguration);
        }
        $userNotificationsConfiguration->disableAllNotifications();
        $this->get('doctrine.orm.default_entity_manager')->flush($userNotificationsConfiguration);
        $this->addFlash(
            'sonata_flash_success',
            $this->get('translator')->trans(
                'resetting.notifications.flash.success',
                [],
                'CapcoAppBundle'
            )
        );

        return $this->redirectToRoute('capco_profile_notifications_edit_account');
    }

    /**
     * @Route("/", name="capco_user_profile_show", defaults={"_feature_flags" = "profiles"})
     * @Route("/{slug}", name="capco_user_profile_show_all", defaults={"_feature_flags" = "profiles"})
     * @Template()
     */
    public function showAction(string $slug = null)
    {
        if (
            !$slug &&
            !$this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
        ) {
            throw $this->createAccessDeniedException();
        }

        $user = $slug
            ? $this->get(UserRepository::class)->findOneBySlug($slug)
            : $this->get('security.token_storage')
                ->getToken()
                ->getUser();

        if (!$user) {
            throw $this->createNotFoundException();
        }

        $serializer = $this->get('serializer');

        $projectsRaw = $this->get(ProjectRepository::class)->getByUser($user, $this->getUser());

        $projectsProps = $serializer->serialize(['projects' => $projectsRaw], 'json', [
            'groups' => ['Projects', 'UserDetails', 'Steps', 'ThemeDetails', 'ProjectType'],
        ]);
        $projectsCount = \count($projectsRaw);

        $opinionTypesWithUserOpinions = $this->get(OpinionTypeRepository::class)->getByUser($user);
        $versions = $this->get(OpinionVersionRepository::class)->getByUser($user);
        $arguments = $this->get(ArgumentRepository::class)->getByUser($user);

        $replies = $this->get(ReplyRepository::class)->findBy([
            'author' => $user,
            'private' => false,
            'draft' => false,
        ]);

        $sources = $this->get(SourceRepository::class)->getByUser($user);
        $comments = $this->get(CommentRepository::class)->getByUser($user);
        $votes = $this->get(AbstractVoteRepository::class)->getPublicVotesByUser($user);
        $eventsCount = $this->getEventsCount($user);

        return array_merge(
            [
                'user' => $user,
                'projectsProps' => $projectsProps,
                'projectsCount' => $projectsCount,
                'eventsCount' => $eventsCount,
                'opinionTypesWithUserOpinions' => $opinionTypesWithUserOpinions,
                'versions' => $versions,
                'arguments' => $arguments,
                'replies' => $replies,
                'sources' => $sources,
                'comments' => $comments,
                'votes' => $votes,
                'argumentsLabels' => Argument::$argumentTypesLabels,
            ],
            $this->getProposalsProps($user)
        );
    }

    /**
     * @Route("/{slug}/projects", name="capco_user_profile_show_projects", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserProjects.html.twig")
     */
    public function showProjectsAction(User $user)
    {
        $serializer = $this->get('serializer');
        $projectsRaw = $this->get(ProjectRepository::class)->getByUser($user, $this->getUser());

        $projectsProps = $serializer->serialize(['projects' => $projectsRaw], 'json', [
            'groups' => ['Projects', 'Steps', 'ThemeDetails'],
        ]);
        $projectsCount = \count($projectsRaw);
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'projectsProps' => $projectsProps,
            'projectsCount' => $projectsCount,
            'eventsCount' => $eventsCount,
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
        $opinionTypesWithUserOpinions = $this->get(OpinionTypeRepository::class)->getByUser($user);

        $projectsCount = $this->getProjectsCount($user, $this->getUser());
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'opinionTypesWithUserOpinions' => $opinionTypesWithUserOpinions,
            'projectsCount' => $projectsCount,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/versions", name="capco_user_profile_show_opinions_versions", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserOpinionVersions.html.twig")
     */
    public function showOpinionVersionsAction(User $user)
    {
        $versions = $this->get(OpinionVersionRepository::class)->getByUser($user);

        return ['user' => $user, 'versions' => $versions];
    }

    /**
     * @Route("/{slug}/proposals", name="capco_user_profile_show_proposals", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserProposals.html.twig")
     */
    public function showProposalsAction(User $user)
    {
        $projectsCount = $this->getProjectsCount($user, $this->getUser());
        $eventsCount = $this->getEventsCount($user);

        return array_merge(
            [
                'user' => $user,
                'projectsCount' => $projectsCount,
                'eventsCount' => $eventsCount,
            ],
            $this->getProposalsProps($user)
        );
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
        $replies = $this->get(ReplyRepository::class)->findBy([
            'author' => $user,
            'private' => false,
        ]);
        $projectsCount = $this->getProjectsCount($user, $this->getUser());
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'replies' => $replies,
            'projectsCount' => $projectsCount,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/arguments", name="capco_user_profile_show_arguments", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserArguments.html.twig")
     */
    public function showArgumentsAction(User $user)
    {
        $arguments = $this->get(ArgumentRepository::class)->getByUser($user);

        $projectsCount = $this->getProjectsCount($user, $this->getUser());
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'arguments' => $arguments,
            'argumentsLabels' => Argument::$argumentTypesLabels,
            'projectsCount' => $projectsCount,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/sources", name="capco_user_profile_show_sources", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserSources.html.twig")
     */
    public function showSourcesAction(User $user)
    {
        $sources = $this->get(SourceRepository::class)->getByUser($user);

        $projectsCount = $this->getProjectsCount($user, $this->getUser());
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'sources' => $sources,
            'projectsCount' => $projectsCount,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/comments", name="capco_user_profile_show_comments", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserComments.html.twig")
     */
    public function showCommentsAction(User $user)
    {
        $comments = $this->get(CommentRepository::class)->getByUser($user);

        $projectsCount = $this->getProjectsCount($user, $this->getUser());
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'comments' => $comments,
            'projectsCount' => $projectsCount,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/votes", name="capco_user_profile_show_votes", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserVotes.html.twig")
     */
    public function showVotesAction(User $user)
    {
        $votes = $this->get(AbstractVoteRepository::class)->getPublicVotesByUser($user);

        $projectsCount = $this->getProjectsCount($user, $this->getUser());
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'votes' => $votes,
            'projectsCount' => $projectsCount,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/events", name="capco_user_profile_show_events", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserEvents.html.twig")
     */
    public function showEventsAction(User $user)
    {
        $projectsCount = $this->getProjectsCount($user, $this->getUser());
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'projectsCount' => $projectsCount,
            'eventsCount' => $eventsCount,
        ];
    }

    private function getProposalsProps(User $user)
    {
        $proposalsWithStep = $this->get(
            ProposalRepository::class
        )->getProposalsGroupedByCollectSteps($user, $this->getUser() !== $user);
        $proposalsCount = array_reduce($proposalsWithStep, function ($sum, $item) {
            $sum += \count($item['proposals']);

            return $sum;
        });
        $proposalsPropsBySteps = [];
        foreach ($proposalsWithStep as $key => $value) {
            $proposalsPropsBySteps[$key] = json_decode(
                $this->get('serializer')->serialize($value, 'json', [
                    'groups' => [
                        'Steps',
                        'Proposals',
                        'PrivateProposals',
                        'ProposalResponses',
                        'UsersInfos',
                        'UserMedias',
                    ],
                ]),
                true
            );
        }

        return [
            'proposalsPropsBySteps' => $proposalsPropsBySteps,
            'proposalsCount' => $proposalsCount,
        ];
    }

    private function loginWithToken(
        Request $request,
        UserNotificationsConfiguration $userNotificationsConfiguration
    ) {
        $user = $userNotificationsConfiguration->getUser();
        $userToken = new UsernamePasswordToken(
            $user,
            null,
            $this->container->getParameter('fos_user.firewall_name'),
            $user->getRoles()
        );
        $this->get('security.token_storage')->setToken($userToken);
        $logInEvent = new InteractiveLoginEvent($request, $userToken);
        $this->get('event_dispatcher')->dispatch('security.interactive_login', $logInEvent);
    }

    private function getProjectsCount(User $user, ?User $loggedUser): int
    {
        $projectsRaw = $this->get(ProjectRepository::class)->getByUser($user, $loggedUser);

        return \count($projectsRaw);
    }

    private function getEventsCount(User $user): int
    {
        return $this->get(EventRepository::class)->countAllByUser($user);
    }
}
