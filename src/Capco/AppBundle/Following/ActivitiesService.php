<?php

namespace Capco\AppBundle\Following;

class ActivitiesService
{
    public function __construct()
    {
    }

    public function mergeFollowedActivities(
        array $followedActivitiesLeft,
        array $followedActivitiesRight
    ): array {
        $followedActivities = $followedActivitiesLeft;

        foreach ($followedActivitiesLeft as $userId => $followedActivity) {
            if (!isset($followedActivitiesRight[$userId])) {
                continue;
            }

            $projectsLeft = $followedActivity->getUserProjects();

            $projectsRight = $followedActivitiesRight[$userId]->getUserProjects();

            foreach ($projectsRight as $projectId => $project) {
                if (isset($projectsLeft[$projectId])) {
                    if (isset($project['opinions'])) {
                        foreach ($project['opinions'] as $opinionId => $opinion) {
                            $projectsLeft[$projectId]['opinions'][$opinionId] = $opinion;
                            $projectsLeft[$projectId]['countActivities'] += $opinion[
                                'countActivities'
                            ];
                        }
                    }

                    if (isset($project['proposals'])) {
                        foreach ($project['proposals'] as $proposalId => $proposal) {
                            $projectsLeft[$projectId]['proposals'][$proposalId] = $proposal;
                            $projectsLeft[$projectId]['countActivities'] += $proposal[
                                'countActivities'
                            ];
                        }
                    }
                } else {
                    $projectsLeft[$projectId] = $project;
                }

                $followedActivities[$userId]->setUserProjects($projectsLeft);
            }

            unset($followedActivitiesRight[$userId]);
        }

        $followedActivities = array_merge($followedActivities, $followedActivitiesRight);

        return $followedActivities;
    }
}
