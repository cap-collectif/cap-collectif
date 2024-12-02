<?php

namespace Capco\AppBundle\Following;

use Capco\AppBundle\Entity\Follower;
use Capco\AppBundle\Entity\Interfaces\FollowerNotifiedOfInterface;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\GraphQL\DataLoader\Proposal\ProposalCurrentVotableStepDataLoader;
use Capco\AppBundle\Model\UserActivity;
use Capco\AppBundle\Repository\FollowerRepository;
use Capco\AppBundle\Repository\OfficialResponseRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProposalActivitiesResolver extends ActivitiesResolver
{
    final public const NOT_FOLLOWED = 0;
    final public const ACTIVITIES = ['comments', 'votes', 'lastStep', 'posts', 'officialResponses'];

    public function __construct(protected FollowerRepository $followerRepository, protected ProposalRepository $proposalRepository, private readonly PostRepository $postRepository, protected ProposalFormRepository $proposalFormRepository, protected ProjectRepository $projectRepository, private readonly OfficialResponseRepository $officialResponseRepository, protected LoggerInterface $logger, protected RouterInterface $router, private readonly ProposalCurrentVotableStepDataLoader $proposalCurrentVotableStepDataLoader)
    {
    }

    public function getFollowedByUserId(): array
    {
        $followers = $this->followerRepository->findAllWhereProposalDeleteAtIsNull();
        $followersWithActivities = [];

        /** @var Follower $follower */
        foreach ($followers as $follower) {
            try {
                $proposalId = $follower->getProposal()->getId();
                $user = $follower->getUser();
                $userId = $user->getId();
            } catch (\RuntimeException $e) {
                $this->logger->error(__METHOD__ . ' ' . $e->getMessage());

                continue;
            }
            if (!$this->isUserEmailValid($user)) {
                $this->logger->error(
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
                $userActivity = new UserActivity();
                $userActivity->setId($userId);
                $userActivity->setEmail($user->getEmailCanonical());
                $userActivity->setUsername($user->getUsername());
                $userActivity->setFirstname($user->getFirstname());
                $userActivity->setLastname($user->getLastname());
                $userActivity->setLocale($user->getLocale());
                $userActivity->addUserProposal($proposalId, $follower->getNotifiedOf());
                $userActivity->setUrlManagingFollowings($unfollowingPage);
                // @var UserActivity $followersWithActivities[$userId]
                $followersWithActivities[$userId] = $userActivity;

                continue;
            }
            $followersWithActivities[$userId]->addUserProposal(
                $proposalId,
                $follower->getNotifiedOf()
            );
        }

        return $followersWithActivities;
    }

    public function canDisplayProposalVotes(Proposal $proposal): bool
    {
        $currentVotableStep = $this->proposalCurrentVotableStepDataLoader->resolve($proposal);
        if (
            $currentVotableStep
            && ($currentVotableStep->isCollectStep() || $currentVotableStep->isSelectionStep())
        ) {
            return $currentVotableStep->canDisplayBallot();
        }

        return true;
    }

    public function getActivitiesByRelativeTime(string $relativeTime = 'yesterday'): array
    {
        $yesterdayMidnight = new \DateTime($relativeTime . ' midnight');
        $yesterdayLasTime = new \DateTime($relativeTime . ' 23:59');
        $twentyFourHoursInterval = new \DateInterval('PT24H');
        $proposalForms = $this->proposalFormRepository->findAll();
        $proposalActivities = [];

        /** @var ProposalForm $proposalForm */
        foreach ($proposalForms as $proposalForm) {
            $proposals = $proposalForm->getProposals();

            /** @var Proposal $proposal */
            foreach ($proposals as $proposal) {
                $currentProposal = [];
                $proposalId = $proposal->getId();
                $proposalCommentYesterdays = $this->proposalRepository->countProposalCommentsCreatedBetween(
                    $yesterdayMidnight,
                    $yesterdayLasTime,
                    $proposalId
                );
                $proposalVotesInYesterday = $this->canDisplayProposalVotes($proposal)
                    ? $this->proposalRepository->countProposalVotesCreatedBetween(
                        $yesterdayMidnight,
                        $yesterdayLasTime,
                        $proposalId
                    )
                    : [['sVotes' => 0, 'cVotes' => 0]];
                $proposalStepInYesterday = $this->proposalRepository->proposalStepChangedBetween(
                    $yesterdayMidnight,
                    $yesterdayLasTime,
                    $proposalId
                );
                $proposalBlogPostInYesterday = $this->postRepository->getProposalBlogPostPublishedBetween(
                    $yesterdayMidnight,
                    $yesterdayLasTime,
                    $proposalId
                );
                $currentProposal['posts'] = !empty($proposalBlogPostInYesterday)
                    ? $proposalBlogPostInYesterday
                    : false;
                $currentProposal[
                    'officialResponses'
                ] = $this->officialResponseRepository->countPublishedBetween(
                    $yesterdayMidnight,
                    $yesterdayLasTime,
                    $proposalId
                );

                $currentProposal['title'] = $proposal->getTitle();
                $currentProposal['link'] = $proposal->getProject()
                    ? $this->router->generate(
                        'app_project_show_proposal',
                        [
                            'projectSlug' => $proposal->getProject()->getSlug(),
                            'stepSlug' => $proposal->getStep()->getSlug(),
                            'proposalSlug' => $proposal->getSlug(),
                        ],
                        UrlGeneratorInterface::ABSOLUTE_URL
                    )
                    : $this->router->generate(
                        'app_homepage',
                        [],
                        UrlGeneratorInterface::ABSOLUTE_URL
                    );
                $currentProposal['isUpdated'] = $proposal->isUpdatedInLastInterval(
                    $yesterdayLasTime,
                    $twentyFourHoursInterval
                );
                $currentProposal['isDeleted'] = $proposal->isDeletedInLastInterval(
                    $yesterdayLasTime,
                    $twentyFourHoursInterval
                );
                $currentProposal['comments'] = (int) $proposalCommentYesterdays[0]['countComment'];
                $currentProposal['votes'] =
                    $proposalVotesInYesterday[0]['sVotes'] + $proposalVotesInYesterday[0]['cVotes'];
                $currentProposal['lastStep'] = !empty($proposalStepInYesterday)
                    ? $proposalStepInYesterday[0]
                    : false;
                $currentProposal['projectId'] = $proposal->getProject()
                    ? $proposal->getProject()->getId()
                    : '';

                $currentProposal['countActivities'] = $this->countActivities($currentProposal);
                if (0 === $currentProposal['countActivities']) {
                    unset($currentProposal);
                } else {
                    $proposalActivities[$proposalId] = $currentProposal;
                }
            }
        }

        unset($currentProposal, $proposals);

        return $proposalActivities;
    }

    public function getMatchingActivitiesByUserId(
        array $activitiesByUserId,
        array $proposalActivities
    ): array {
        /** @var UserActivity $userActivity * */
        foreach ($activitiesByUserId as $userId => $userActivity) {
            if (!$userActivity->hasProposal()) {
                unset($activitiesByUserId[$userId]);

                continue;
            }

            foreach ($userActivity->getUserProposals() as $proposalId => $notifiedOf) {
                if (isset($proposalActivities[$proposalId])) {
                    $proposal = $proposalActivities[$proposalId];
                    if (isset($proposal['countActivities']) && 0 === $proposal['countActivities']) {
                        continue;
                    }
                    $project = $this->projectRepository->find($proposal['projectId']);
                    if ($project) {
                        if (FollowerNotifiedOfInterface::MINIMAL === $notifiedOf) {
                            $proposal['comments'] = self::NOT_FOLLOWED;
                            $proposal['votes'] = self::NOT_FOLLOWED;
                        }
                        if (FollowerNotifiedOfInterface::ESSENTIAL === $notifiedOf) {
                            $proposal['votes'] = self::NOT_FOLLOWED;
                        }

                        $proposal['countActivities'] = $this->countActivities($proposal);
                        if (0 === $proposal['countActivities']) {
                            continue;
                        }
                        $currentProject = [];
                        if ($userActivity->getUserProject($proposal['projectId'])) {
                            $currentProject = $userActivity->getUserProject($proposal['projectId']);
                        }

                        $currentProject['proposals'][$proposalId] = $proposal;
                        $currentProject['projectTitle'] = $project->getTitle();

                        $userActivity->addUserProject($currentProject, $proposal['projectId']);
                    }
                }
            }

            foreach ($userActivity->getUserProjects() as $projectId => $project) {
                if (empty($project['proposals'])) {
                    $userActivity->removeUserProject($projectId);

                    continue;
                }
                foreach ($project['proposals'] as $proposalId => $proposal) {
                    if (!isset($project['countActivities'])) {
                        $project['countActivities'] = 0;
                    }
                    $project['countActivities'] += $proposal['countActivities'];
                    $userActivity->addUserProject($project, $projectId);
                }
            }
            $userActivity->setUserProposals([]);
            // check if user got a project and remove user without project
            if (!$userActivity->hasUserProject()) {
                unset($activitiesByUserId[$userId]);

                continue;
            }
            $activitiesByUserId[$userId] = $userActivity;
        }

        return $activitiesByUserId;
    }
}
