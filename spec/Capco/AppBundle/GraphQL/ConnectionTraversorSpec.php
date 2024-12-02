<?php

namespace spec\Capco\AppBundle\GraphQL;

use Akamon\MockeryCallableMock\MockeryCallableMock;
use Capco\AppBundle\GraphQL\ConnectionTraversor;
use GraphQL\Executor\ExecutionResult;
use Overblog\GraphQLBundle\Request\Executor;
use PhpSpec\ObjectBehavior;
use Psr\Log\LoggerInterface;

class ConnectionTraversorSpec extends ObjectBehavior
{
    public function let(Executor $executor, LoggerInterface $logger): void
    {
        $this->beConstructedWith($executor, $logger);
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ConnectionTraversor::class);
    }

    public function it_stops_on_error(
        LoggerInterface $logger,
        MockeryCallableMock $onEdgeTraversed
    ): void {
        $initialData = [
            'errors' => [['some errors']],
            'data' => [
                'node' => [
                    'title' => 'Consultation step',
                    'contributionConnection' => [
                        'totalCount' => 11,
                        'pageInfo' => [
                            'startCursor' => 'cursor1',
                            'endCursor' => 'cursor4',
                            'hasNextPage' => true,
                        ],
                        'edges' => null,
                    ],
                ],
            ],
        ];

        $logger
            ->notice('The GraphQL request resulted in `null` edges.', [
                'path' => 'contributionConnection',
                'errors' => [['some errors']],
            ])
            ->shouldBeCalled()
        ;
        $this->traverse($initialData, 'contributionConnection', $onEdgeTraversed, null);
    }

    public function it_should_correctly_traverse_a_connection(
        Executor $executor,
        ExecutionResult $initialResult,
        ExecutionResult $middleResut,
        ExecutionResult $finalResult,
        MockeryCallableMock $onEdgeTraversed
    ): void {
        $initialData = [
            'data' => [
                'node' => [
                    'title' => 'Consultation step',
                    'contributionConnection' => [
                        'totalCount' => 11,
                        'pageInfo' => [
                            'startCursor' => 'cursor1',
                            'endCursor' => 'cursor4',
                            'hasNextPage' => true,
                        ],
                        'edges' => [
                            0 => [
                                'cursor' => 'cursor1',
                                'node' => [
                                    'id' => 'opinion1',
                                    'title' => 'la 1',
                                    'kind' => 'opinion',
                                ],
                            ],
                            1 => [
                                'cursor' => 'cursor2',
                                'node' => [
                                    'id' => 'opinion2',
                                    'title' => 'la 2',
                                    'kind' => 'opinion',
                                ],
                            ],
                            2 => [
                                'cursor' => 'cursor3',
                                'node' => [
                                    'id' => 'opinion3',
                                    'title' => 'la 3',
                                    'kind' => 'opinion',
                                ],
                            ],
                            3 => [
                                'cursor' => 'cursor4',
                                'node' => [
                                    'id' => 'opinion4',
                                    'title' => 'la 4',
                                    'kind' => 'opinion',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
        $middleData = [
            'data' => [
                'node' => [
                    'title' => 'Consultation step',
                    'contributionConnection' => [
                        'totalCount' => 11,
                        'pageInfo' => [
                            'startCursor' => 'cursor5',
                            'endCursor' => 'cursor8',
                            'hasNextPage' => true,
                        ],
                        'edges' => [
                            0 => [
                                'cursor' => 'cursor5',
                                'node' => [
                                    'id' => 'opinion5',
                                    'title' => 'la 5',
                                    'kind' => 'opinion',
                                ],
                            ],
                            1 => [
                                'cursor' => 'cursor6',
                                'node' => [
                                    'id' => 'opinion6',
                                    'title' => 'la 6',
                                    'kind' => 'opinion',
                                ],
                            ],
                            2 => [
                                'cursor' => 'cursor7',
                                'node' => [
                                    'id' => 'opinion7',
                                    'title' => 'la 7',
                                    'kind' => 'opinion',
                                ],
                            ],
                            3 => [
                                'cursor' => 'cursor8',
                                'node' => [
                                    'id' => 'opinion8',
                                    'title' => 'la 8',
                                    'kind' => 'opinion',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
        $finalData = [
            'data' => [
                'node' => [
                    'title' => 'Consultation step',
                    'contributionConnection' => [
                        'totalCount' => 11,
                        'pageInfo' => [
                            'startCursor' => 'cursor9',
                            'endCursor' => 'cursor11',
                            'hasNextPage' => false,
                        ],
                        'edges' => [
                            0 => [
                                'cursor' => 'cursor9',
                                'node' => [
                                    'id' => 'opinion9',
                                    'title' => 'la 9',
                                    'kind' => 'opinion',
                                ],
                            ],
                            1 => [
                                'cursor' => 'cursor10',
                                'node' => [
                                    'id' => 'opinion10',
                                    'title' => 'la 10',
                                    'kind' => 'opinion',
                                ],
                            ],
                            2 => [
                                'cursor' => 'cursor11',
                                'node' => [
                                    'id' => 'opinion11',
                                    'title' => 'la 11',
                                    'kind' => 'opinion',
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];

        $initialResult->toArray()->willReturn($initialData);
        $executor
            ->execute('internal', [
                'query' => $this->getContributionsGraphqlQuery(),
                'variables' => [],
            ])
            ->willReturn($initialResult)
        ;

        $middleResut->toArray()->willReturn($middleData);
        $executor
            ->execute('internal', [
                'query' => $this->getContributionsGraphqlQuery('cursor4'),
                'variables' => [],
            ])
            ->willReturn($middleResut)
        ;

        $finalResult->toArray()->willReturn($finalData);
        $executor
            ->execute('internal', [
                'query' => $this->getContributionsGraphqlQuery('cursor8'),
                'variables' => [],
            ])
            ->willReturn($finalResult)
        ;

        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor1',
            'node' => ['id' => 'opinion1', 'title' => 'la 1', 'kind' => 'opinion'],
        ]);
        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor2',
            'node' => ['id' => 'opinion2', 'title' => 'la 2', 'kind' => 'opinion'],
        ]);
        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor3',
            'node' => ['id' => 'opinion3', 'title' => 'la 3', 'kind' => 'opinion'],
        ]);
        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor4',
            'node' => ['id' => 'opinion4', 'title' => 'la 4', 'kind' => 'opinion'],
        ]);
        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor5',
            'node' => ['id' => 'opinion5', 'title' => 'la 5', 'kind' => 'opinion'],
        ]);
        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor6',
            'node' => ['id' => 'opinion6', 'title' => 'la 6', 'kind' => 'opinion'],
        ]);
        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor7',
            'node' => ['id' => 'opinion7', 'title' => 'la 7', 'kind' => 'opinion'],
        ]);
        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor8',
            'node' => ['id' => 'opinion8', 'title' => 'la 8', 'kind' => 'opinion'],
        ]);
        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor9',
            'node' => ['id' => 'opinion9', 'title' => 'la 9', 'kind' => 'opinion'],
        ]);

        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor9',
            'node' => ['id' => 'opinion10', 'title' => 'la 10', 'kind' => 'opinion'],
        ]);

        $onEdgeTraversed->shouldBeCalled()->withArguments([
            'cursor' => 'cursor9',
            'node' => ['id' => 'opinion11', 'title' => 'la 11', 'kind' => 'opinion'],
        ]);

        $this->traverse(
            $initialData,
            'contributionConnection',
            $onEdgeTraversed,
            fn ($pageInfos) => $this->getContributionsGraphqlQuery($pageInfos['endCursor'])
        );
    }

    private function getContributionsGraphqlQuery(
        string $afterCursor = '',
        int $contributionPerPage = 2
    ): string {
        if ('' !== $afterCursor) {
            $afterCursor = sprintf(', after: "%s"', $afterCursor);
        }

        return <<<EOF
            query {
              node(id: "cstep5" ) {
                ... on Consultation {
                  id
                  contributionConnection(orderBy: {field: PUBLISHED_AT, direction: DESC}, first: {$contributionPerPage}{$afterCursor}) {
                    totalCount
                    pageInfo {
                      startCursor
                      endCursor
                      hasNextPage
                    }
                    edges {
                      cursor
                      node {
                        id
                        ... on Opinion {
                          id
                          title
                          kind
                        }
                      }
                    }
                  }
                }
              }
            }
            EOF;
    }
}
