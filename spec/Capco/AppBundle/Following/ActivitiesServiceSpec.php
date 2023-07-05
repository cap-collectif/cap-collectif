<?php

namespace spec\Capco\AppBundle\Following;

use Capco\AppBundle\Following\ActivitiesService;
use Capco\AppBundle\Model\UserActivity;
use Monolog\Logger;
use PhpSpec\ObjectBehavior;
use Symfony\Component\Routing\Router;

class ActivitiesServiceSpec extends ObjectBehavior
{
    public function let(Logger $logger, Router $router)
    {
        $this->beConstructedWith($logger, $router);
    }

    public function it_is_initializable()
    {
        $this->shouldHaveType(ActivitiesService::class);
    }

    public function it_should_merge_activities_array(
        UserActivity $user1Activity,
        UserActivity $user2Activity
    ) {
        $followedActivitiesLeft = [
            'user1' => $user1Activity,
        ];

        $followedActivitiesRight = [
            'user2' => $user2Activity,
        ];

        $debug = $this->mergeFollowedActivities($followedActivitiesLeft, $followedActivitiesRight);
        $debug->shouldBe([
            'user1' => $user1Activity,
            'user2' => $user2Activity,
        ]);
    }

    public function it_should_merge_activities_proposals_and_opinions(
        UserActivity $user1Activity,
        UserActivity $user2Activity
    ) {
        $user1Activity->getUserProjects()->willReturn([
            'project1' => [
                'proposals' => [
                    'proposal1' => [
                        'title' => 'proposal 1',
                        'projectId' => 'project1',
                        'countActivities' => 3,
                    ],
                ],
                'projectTitle' => 'project 1',
                'countActivities' => 3,
            ],
        ]);

        $user1Activity
            ->setUserProjects([
                'project1' => [
                    'proposals' => [
                        'proposal1' => [
                            'title' => 'proposal 1',
                            'projectId' => 'project1',
                            'countActivities' => 3,
                        ],
                    ],
                    'opinions' => [
                        'opinions1' => [
                            'title' => 'opinions 1',
                            'projectId' => 'project1',
                            'countActivities' => 3,
                        ],
                    ],
                    'projectTitle' => 'project 1',
                    'countActivities' => 6,
                ],
            ])
            ->shouldBeCalled()
        ;

        $user2Activity->getUserProjects()->willReturn([
            'project1' => [
                'opinions' => [
                    'opinions1' => [
                        'title' => 'opinions 1',
                        'projectId' => 'project1',
                        'countActivities' => 3,
                    ],
                ],
                'projectTitle' => 'project 1',
                'countActivities' => 3,
            ],
        ]);

        $followedActivitiesLeft = [
            'user1' => $user1Activity,
        ];

        $followedActivitiesRight = [
            'user1' => $user2Activity,
        ];

        $this->mergeFollowedActivities($followedActivitiesLeft, $followedActivitiesRight)->shouldBe(
            [
                'user1' => $user1Activity,
            ]
        );
    }

    public function it_should_merge_activities_proposals(
        UserActivity $user1Activity,
        UserActivity $user2Activity
    ) {
        $user1Activity->getUserProjects()->willReturn([
            'project1' => [
                'proposals' => [
                    'proposal1' => [
                        'title' => 'proposal 1',
                        'projectId' => 'project1',
                        'countActivities' => 3,
                    ],
                ],
                'projectTitle' => 'project 1',
                'countActivities' => 3,
            ],
        ]);

        $user1Activity
            ->setUserProjects([
                'project1' => [
                    'proposals' => [
                        'proposal1' => [
                            'title' => 'proposal 1',
                            'projectId' => 'project1',
                            'countActivities' => 3,
                        ],
                        'proposal2' => [
                            'title' => 'proposal 2',
                            'projectId' => 'project2',
                            'countActivities' => 3,
                        ],
                    ],
                    'projectTitle' => 'project 1',
                    'countActivities' => 6,
                ],
            ])
            ->shouldBeCalled()
        ;

        $user2Activity->getUserProjects()->willReturn([
            'project1' => [
                'proposals' => [
                    'proposal2' => [
                        'title' => 'proposal 2',
                        'projectId' => 'project2',
                        'countActivities' => 3,
                    ],
                ],
                'projectTitle' => 'project 1',
                'countActivities' => 3,
            ],
        ]);

        $followedActivitiesLeft = [
            'user1' => $user1Activity,
        ];

        $followedActivitiesRight = [
            'user1' => $user2Activity,
        ];

        $this->mergeFollowedActivities($followedActivitiesLeft, $followedActivitiesRight)->shouldBe(
            [
                'user1' => $user1Activity,
            ]
        );
    }
}
