<?php

namespace Capco\UserBundle\Controller;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Argument;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Repository\UserRepository;
use Symfony\Component\Routing\Annotation\Route;
use Capco\AppBundle\Repository\EventRepository;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\CommentRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\UserArchiveRepository;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Capco\AppBundle\Entity\UserNotificationsConfiguration;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Capco\AppBundle\GraphQL\Resolver\User\UserProposalsResolver;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Capco\AppBundle\Repository\UserNotificationsConfigurationRepository;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @Route("/profile")
 */
class ProfileController extends Controller
{
    private UserProposalsResolver $userProposalsResolver;
    private EventDispatcherInterface $eventDispatcher;
    private UserRepository $userRepository;
    private ReplyRepository $replyRepository;
    private SourceRepository $sourceRepository;
    private ArgumentRepository $argumentRepository;
    private EventRepository $eventRepository;
    private ProjectRepository $projectRepository;
    private CommentRepository $commentRepository;
    private OpinionVersionRepository $opinionVersionRepository;
    private UserNotificationsConfigurationRepository $userNotificationsConfigurationRepository;
    private UserArchiveRepository $userArchiveRepository;
    private string $fireWall;
    private string $projectDir;
    private TranslatorInterface $translator;
    private EntityManagerInterface $em;

    public function __construct(
        UserProposalsResolver $userProposalsResolver,
        EventDispatcherInterface $eventDispatcher,
        UserRepository $userRepository,
        ArgumentRepository $argumentRepository,
        SourceRepository $sourceRepository,
        ReplyRepository $replyRepository,
        EventRepository $eventRepository,
        ProjectRepository $projectRepository,
        CommentRepository $commentRepository,
        OpinionVersionRepository $opinionVersionRepository,
        UserNotificationsConfigurationRepository $userNotificationsConfigurationRepository,
        UserArchiveRepository $userArchiveRepository,
        TranslatorInterface $translator,
        EntityManagerInterface $em,
        string $fireWall,
        string $projectDir
    ) {
        $this->userProposalsResolver = $userProposalsResolver;
        $this->eventDispatcher = $eventDispatcher;
        $this->userRepository = $userRepository;
        $this->argumentRepository = $argumentRepository;
        $this->sourceRepository = $sourceRepository;
        $this->replyRepository = $replyRepository;
        $this->commentRepository = $commentRepository;
        $this->projectRepository = $projectRepository;
        $this->eventRepository = $eventRepository;
        $this->opinionVersionRepository = $opinionVersionRepository;
        $this->userNotificationsConfigurationRepository = $userNotificationsConfigurationRepository;
        $this->userArchiveRepository = $userArchiveRepository;
        $this->fireWall = $fireWall;
        $this->projectDir = $projectDir;
        $this->translator = $translator;
        $this->em = $em;
    }

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
        $userNotificationsConfiguration = $this->userNotificationsConfigurationRepository->findOneBy(
            ['unsubscribeToken' => $token]
        );
        if (!$userNotificationsConfiguration) {
            throw new NotFoundHttpException();
        }
        if (!$this->getUser()) {
            $this->loginWithToken($request, $userNotificationsConfiguration);
        }

        return $this->redirectToRoute('capco_profile_edit', ['#' => 'followings']);
    }

    /**
     * @Route("/notifications", name="capco_profile_notifications_edit_account", options={"i18n" = false})
     * @Template("@CapcoUser/Profile/edit_notifications.twig")
     * @Security("has_role('ROLE_USER')")
     */
    public function showNotificationsOptionsAction(Request $request)
    {
        return [];
    }

    /**
     * @Route("/download_archive", name="capco_profile_download_archive", options={"i18n" = false})
     * @Security("has_role('ROLE_USER')")
     */
    public function downloadArchiveAction(Request $request)
    {
        $archive = $this->userArchiveRepository->getLastForUser($this->getUser());

        if (!$archive) {
            throw new NotFoundHttpException('Archive not found');
        }

        $file = $this->projectDir . '/public/export/' . $archive->getPath();

        if (!file_exists($file)) {
            throw new NotFoundHttpException('Export not found');
        }

        return (new BinaryFileResponse($file))->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            'export.zip'
        );
    }

    /**
     * @Route("/download_archive/{token}", name="capco_profile_data_login", options={"i18n" = false})
     */
    public function loginAndShowDataAction(Request $request, string $token)
    {
        $userNotificationsConfiguration = $this->userNotificationsConfigurationRepository->findOneBy(
            ['unsubscribeToken' => $token]
        );
        if (!$userNotificationsConfiguration) {
            throw new NotFoundHttpException();
        }
        if (!$this->getUser()) {
            $this->loginWithToken($request, $userNotificationsConfiguration);
        }

        return $this->redirectToRoute('capco_profile_edit', ['#' => 'export']);
    }

    /**
     * @Route("/notifications/{token}", name="capco_profile_notifications_login", options={"i18n" = false})
     */
    public function loginAndShowNotificationsOptionsAction(Request $request, string $token)
    {
        $userNotificationsConfiguration = $this->userNotificationsConfigurationRepository->findOneBy(
            ['unsubscribeToken' => $token]
        );
        if (!$userNotificationsConfiguration) {
            throw new NotFoundHttpException();
        }
        if (!$this->getUser()) {
            $this->loginWithToken($request, $userNotificationsConfiguration);
        }

        return $this->redirectToRoute('capco_profile_notifications_edit_account');
    }

    /**
     * @Route("/notifications/disable/{token}", name="capco_profile_notifications_disable", options={"i18n" = false})
     * @Security("has_role('ROLE_USER')")
     */
    public function disableNotificationsAction(Request $request, string $token)
    {
        /** @var UserNotificationsConfiguration $userNotificationsConfiguration */
        $userNotificationsConfiguration = $this->userNotificationsConfigurationRepository->findOneBy(
            ['unsubscribeToken' => $token]
        );
        if (!$userNotificationsConfiguration) {
            throw new NotFoundHttpException();
        }
        if (!$this->getUser()) {
            $this->loginWithToken($request, $userNotificationsConfiguration);
        }
        $userNotificationsConfiguration->disableAllNotifications();
        $this->em->flush($userNotificationsConfiguration);
        $this->addFlash(
            'sonata_flash_success',
            $this->translator->trans('resetting.notifications.flash.success', [], 'CapcoAppBundle')
        );

        return $this->redirectToRoute('capco_profile_notifications_edit_account');
    }

    /**
     * @Route("/", name="capco_user_profile_show", defaults={"_feature_flags" = "profiles"})
     * @Route("/{slug}", name="capco_user_profile_show_all", defaults={"_feature_flags" = "profiles"})
     * @Template("@CapcoUser/Profile/show.html.twig")
     */
    public function showAction(?string $slug = null)
    {
        if (
            !$slug &&
            !$this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')
        ) {
            throw $this->createAccessDeniedException();
        }

        $user = $slug ? $this->userRepository->findOneBySlug($slug) : $this->getUser();

        if (!$user) {
            throw $this->createNotFoundException();
        }

        $arguments = $this->argumentRepository->getByUser($user);
        $replies = $this->replyRepository->getByAuthor($user);
        $sources = $this->sourceRepository->getByUser($user);
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'eventsCount' => $eventsCount,
            'arguments' => $arguments,
            'replies' => $replies,
            'sources' => $sources,
            'argumentsLabels' => Argument::$argumentTypesLabels,
        ];
    }

    /**
     * @Route("/{slug}/projects", name="capco_user_profile_show_projects", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserProjects.html.twig")
     */
    public function showProjectsAction(User $user)
    {
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/opinions", name="capco_user_profile_show_opinions", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserOpinions.html.twig")
     *
     * @return array
     */
    public function showOpinionsAction(User $user)
    {
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/versions", name="capco_user_profile_show_opinions_versions", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserOpinionVersions.html.twig")
     */
    public function showOpinionVersionsAction(User $user)
    {
        $versions = $this->opinionVersionRepository->getByUser($user, $this->getUser());

        return ['user' => $user, 'versions' => $versions];
    }

    /**
     * @Route("/{slug}/proposals", name="capco_user_profile_show_proposals", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserProposals.html.twig")
     */
    public function showProposalsAction(User $user)
    {
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/replies", name="capco_user_profile_show_replies", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserReplies.html.twig")
     */
    public function showRepliesAction(User $user)
    {
        $replies = $this->replyRepository->getByAuthor($user);
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'replies' => $replies,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/arguments", name="capco_user_profile_show_arguments", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserArguments.html.twig")
     */
    public function showArgumentsAction(User $user)
    {
        $arguments = $this->argumentRepository->getByUser($user);

        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'arguments' => $arguments,
            'argumentsLabels' => Argument::$argumentTypesLabels,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/sources", name="capco_user_profile_show_sources", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserSources.html.twig")
     */
    public function showSourcesAction(User $user)
    {
        $sources = $this->sourceRepository->getByUser($user);

        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'sources' => $sources,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/comments", name="capco_user_profile_show_comments", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserComments.html.twig")
     */
    public function showCommentsAction(User $user)
    {
        $comments = $this->commentRepository->getByUser($user);

        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'comments' => $comments,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/votes", name="capco_user_profile_show_votes", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserVotes.html.twig")
     */
    public function showVotesAction(User $user)
    {
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'eventsCount' => $eventsCount,
        ];
    }

    /**
     * @Route("/{slug}/events", name="capco_user_profile_show_events", defaults={"_feature_flags" = "profiles"})
     * @Template("CapcoUserBundle:Profile:showUserEvents.html.twig")
     */
    public function showEventsAction(User $user)
    {
        $eventsCount = $this->getEventsCount($user);

        return [
            'user' => $user,
            'eventsCount' => $eventsCount,
        ];
    }

    private function loginWithToken(
        Request $request,
        UserNotificationsConfiguration $userNotificationsConfiguration
    ) {
        $user = $userNotificationsConfiguration->getUser();
        $userToken = new UsernamePasswordToken($user, null, $this->fireWall, $user->getRoles());
        $this->get('security.token_storage')->setToken($userToken);
        $logInEvent = new InteractiveLoginEvent($request, $userToken);
        $this->eventDispatcher->dispatch('security.interactive_login', $logInEvent);
    }

    private function getProjectsCount(User $user, ?User $loggedUser): int
    {
        $projectsRaw = $this->projectRepository->getByUser($user, $loggedUser);

        return \count($projectsRaw);
    }

    private function getEventsCount(User $user): int
    {
        return $this->eventRepository->countAllByUser($user);
    }
}
