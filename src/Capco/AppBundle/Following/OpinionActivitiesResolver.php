<?php
namespace Capco\AppBundle\Following;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\GraphQL\Resolver\Opinion\OpinionUrlResolver;
use Capco\AppBundle\Model\UserActivity;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ArgumentRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;
use Capco\AppBundle\Following\ActivitiesResolver;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Capco\AppBundle\Resolver\UrlArrayResolver;

class OpinionActivitiesResolver extends ActivitiesResolver
{
    public const NOT_FOLLOWED = 0;
    public const ACTIVITIES = [
        'isUpdated',
        'isTrashed',
        'argumentFor',
        'argumentAgainst',
        'voteOk',
        'voteNok',
        'voteMitige',
    ];

    protected $followerRepository;
    protected $projectRepository;
    protected $logger;
    protected $router;
    protected $opinionRepository;
    protected $opinionVoteRepository;
    protected $argumentRepository;
    protected $urlArrayResolver;
    protected $opinionUrlResolver;

    public function __construct(
        FollowerRepository $followerRepository,
        ProjectRepository $projectRepository,
        LoggerInterface $logger,
        Router $router,
        OpinionRepository $opinionRepository,
        OpinionVoteRepository $opinionVoteRepository,
        ArgumentRepository $argumentRepository,
        UrlArrayResolver $urlArrayResolver,
        OpinionUrlResolver $opinionUrlResolver
    ) {
        $this->followerRepository = $followerRepository;
        $this->projectRepository = $projectRepository;
        $this->logger = $logger;
        $this->router = $router;
        $this->opinionRepository = $opinionRepository;
        $this->opinionVoteRepository = $opinionVoteRepository;
        $this->argumentRepository = $argumentRepository;
        $this->urlArrayResolver = $urlArrayResolver;
        $this->opinionUrlResolver = $opinionUrlResolver;
    }

    public function getFollowedByUserId(): array
    {
        $followers = $this->followerRepository->findAllWithOpinion();
        $followersWithActivities = [];

        /**
         * @var Follower $follower
         */
        foreach ($followers as $follower) {
            try {
                $opinionId = $follower->getOpinion()->getId();
                $user = $follower->getUser();
                $userId = $user->getId();
            } catch (\RuntimeException $e) {
                $this->logger->error(__METHOD__ . ' ' . $e->getMessage());
                continue;
            }

            // Check if the email is valid.
            if (!$this->isUserEmailValid($user)) {
                $this->logger->warning(
                    sprintf(
                        '%s doesn\'t have a valid email %s',
                        $user->getUsername(),
                        $user->getEmailCanonical()
                    )
                );
                continue;
            }

            if (!isset($followersWithActivities[$userId])) {
                $unfollowingPage = $this->router->generate(
                    'capco_profile_followings_login',
                    ['token' => $user->getNotificationsConfiguration()->getUnsubscribeToken()],
                    UrlGeneratorInterface::ABSOLUTE_URL
                );

                // Create a new Activity for the User.
                $userActivity = new UserActivity();
                $userActivity->setId($userId);
                $userActivity->setEmail($user->getEmailCanonical());
                $userActivity->setUsername($user->getUsername());
                $userActivity->setFirstname($user->getFirstname());
                $userActivity->setLastname($user->getLastname());
                $userActivity->addUserOpinion($opinionId, $follower->getNotifiedOf());
                $userActivity->setUrlManagingFollowings($unfollowingPage);

                // Add the activity to the user.
                $followersWithActivities[$userId] = $userActivity;
            } else {
                $followersWithActivities[$userId]->addUserOpinion(
                    $opinionId,
                    $follower->getNotifiedOf()
                );
            }
        }

        return $followersWithActivities;
    }

    public function getActivitiesByRelativeTime(string $relativeTime = 'yesterday'): array
    {
        $yesterdayMidnight = new \DateTime($relativeTime . ' midnight');
        $yesterdayLasTime = (new \DateTime($relativeTime . ' 23:59'));
        $twentyFourHoursInterval = new \DateInterval('PT24H');

        $opinionActivities = [];

        $opinions = $this->opinionRepository->findBy([
            'published' => 1,
        ]);

        /**
         * @var \Capco\AppBundle\Entity\Opinion $opinion
         */
        foreach ($opinions as $opinion) {
            $currentOpinion = [];
            $opinionId = $opinion->getId();

            $opinionForArgumentsYesterday = $this->argumentRepository->countForPublishedBetweenByOpinion(
                $yesterdayMidnight,
                $yesterdayLasTime,
                $opinionId
            );

            $opinionAgainstArgumentsYesterday = $this->argumentRepository->countAgainstPublishedBetweenByOpinion(
                $yesterdayMidnight,
                $yesterdayLasTime,
                $opinionId
            );

            $opinionOkVotesYesterday = $this->opinionVoteRepository->countOkVotePublishedBetweenByOpinion(
                $yesterdayMidnight,
                $yesterdayLasTime,
                $opinionId
            );

            $opinionNOkVotesYesterday = $this->opinionVoteRepository->countNOkVotePublishedBetweenByOpinion(
                $yesterdayMidnight,
                $yesterdayLasTime,
                $opinionId
            );

            $opinionMitigeVotesYesterday = $this->opinionVoteRepository->countMitigeVotePublishedBetweenByOpinion(
                $yesterdayMidnight,
                $yesterdayLasTime,
                $opinionId
            );

            $currentOpinion['title'] = $opinion->getTitle();
            $currentOpinion['link'] = $this->opinionUrlResolver->__invoke($opinion);
            $currentOpinion['argumentFor'] = $opinionForArgumentsYesterday;
            $currentOpinion['argumentAgainst'] = $opinionAgainstArgumentsYesterday;
            $currentOpinion['voteOk'] = $opinionOkVotesYesterday;
            $currentOpinion['voteNok'] = $opinionNOkVotesYesterday;
            $currentOpinion['voteMitige'] = $opinionMitigeVotesYesterday;

            $currentOpinion['isUpdated'] = $opinion->isUpdatedInLastInterval(
                $yesterdayLasTime,
                $twentyFourHoursInterval
            );

            $currentOpinion['isTrashed'] = $opinion->isTrashedInLastInterval(
                $yesterdayLasTime,
                $twentyFourHoursInterval
            );

            $currentOpinion['projectId'] = $opinion->getProject()->getId();

            $currentOpinion['countActivities'] = $this->countActivities($currentOpinion);

            // If there is 0 activity, don't add it to array.
            if ($currentOpinion['countActivities'] === 0) {
                unset($currentOpinion);
            } else {
                $opinionActivities[$opinionId] = $currentOpinion;
            }
        }
        unset($currentOpinion);

        return $opinionActivities;
    }

    public function getMatchingActivitiesByUserId(
        array $activitiesByUserId,
        array $opinionActivities
    ): array {
        /**
         * @var UserActivity $userActivity
         */
        foreach ($activitiesByUserId as $userId => $userActivity) {
            if (!$userActivity->hasOpinion()) {
                unset($activitiesByUserId[$userId]);
                continue;
            }

            foreach ($userActivity->getUserOpinions() as $opinionId => $notifiedOf) {
                if (!isset($opinionActivities[$opinionId])) {
                    continue;
                }

                $opinion = $opinionActivities[$opinionId];

                if (isset($opinion['countActivities']) && $opinion['countActivities'] === 0) {
                    continue;
                }

                $project = $this->projectRepository->find($opinion['projectId']);

                if (!$project) {
                    continue;
                }

                if (FollowerNotifiedOfInterface::MINIMAL === $notifiedOf) {
                    $opinion['argumentFor'] = self::NOT_FOLLOWED;
                    $opinion['argumentAgainst'] = self::NOT_FOLLOWED;
                }

                if (
                    in_array($notifiedOf, [
                        FollowerNotifiedOfInterface::ESSENTIAL,
                        FollowerNotifiedOfInterface::MINIMAL,
                    ])
                ) {
                    $opinion['voteOk'] = self::NOT_FOLLOWED;
                    $opinion['voteNok'] = self::NOT_FOLLOWED;
                    $opinion['voteMitige'] = self::NOT_FOLLOWED;
                }

                $opinion['countActivities'] = $this->countActivities($opinion);
                if ($opinion['countActivities'] === 0) {
                    continue;
                }

                $currentProject = [];
                if ($userActivity->getUserProject($opinion['projectId'])) {
                    $currentProject = $userActivity->getUserProject($opinion['projectId']);
                }

                $currentProject['opinions'][$opinionId] = $opinion;
                $currentProject['projectTitle'] = $project->getTitle();

                $userActivity->addUserProject($currentProject, $opinion['projectId']);
            }

            foreach ($userActivity->getUserProjects() as $projectId => $project) {
                if (empty($project['opinions'])) {
                    $userActivity->removeUserProject($projectId);
                    continue;
                }

                foreach ($project['opinions'] as $opinionId => $opinion) {
                    if (!isset($project['countActivities'])) {
                        $project['countActivities'] = 0;
                    }
                    $project['countActivities'] += $opinion['countActivities'];
                    $userActivity->addUserProject($project, $projectId);
                }
            }

            $userActivity->setUserOpinions([]);

            /**
             * Check if user got a project and remove user without project.
             */
            if (!$userActivity->hasUserProject()) {
                unset($activitiesByUserId[$userId]);
                continue;
            }
            $activitiesByUserId[$userId] = $userActivity;
        }

        return $activitiesByUserId;
    }
}
