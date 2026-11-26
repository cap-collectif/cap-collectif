<?php

declare(strict_types=1);

namespace Capco\Tests\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Enum\ContributionCompletionStatus;
use Capco\Tests\Participant\Functional\ParticipantWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 *
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Exercises the GraphQL vote lifecycle with real persistence in a rolled-back transaction.
 */
final class ViewerPendingProposalVotesTest extends ParticipantWebTestCase
{
    /** @dataProvider voteSteps */
    public function testParticipantCanReadAndRefreshOnlyTheirOwnPendingVotes(string $stepType, string $stepFixture, string $proposalPrefix): void
    {
        $participant = (new Participant())->setToken(bin2hex(random_bytes(24)));
        $otherParticipant = (new Participant())->setToken(bin2hex(random_bytes(24)));
        $this->em->persist($participant);
        $this->em->persist($otherParticipant);
        $this->em->flush();

        $this->participationCookies($participant);
        $stepId = GlobalId::toGlobalId($stepType, $stepFixture);
        $variables = ['step' => $stepId];
        $voteByLetter = [];
        foreach (['A', 'B', 'C'] as $letter) {
            $proposalId = GlobalId::toGlobalId('Proposal', $proposalPrefix . $letter);
            $added = $this->graphql(
                <<<'GRAPHQL'
                    mutation ($input: AddProposalSmsVoteInput!) {
                      addProposalSmsVote(input: $input) {
                        errorCode
                        vote {
                          id
                          completionStatus
                          step { viewerPendingVotes { id proposal { id } } }
                        }
                      }
                    }
                    GRAPHQL,
                ['input' => ['stepId' => $stepId, 'proposalId' => $proposalId, 'token' => base64_encode($participant->getToken())]],
            )['addProposalSmsVote'];
            self::assertNull($added['errorCode']);
            $voteByLetter[$letter] = $added['vote'];
        }

        self::assertSame(ContributionCompletionStatus::COMPLETED, $voteByLetter['A']['completionStatus']);
        self::assertSame(ContributionCompletionStatus::COMPLETED, $voteByLetter['B']['completionStatus']);
        self::assertSame(ContributionCompletionStatus::MISSING_REQUIREMENTS, $voteByLetter['C']['completionStatus']);
        $pending = [['id' => $voteByLetter['C']['id'], 'proposal' => ['id' => GlobalId::toGlobalId('Proposal', $proposalPrefix . 'C')]]];
        self::assertSame($pending, $voteByLetter['C']['step']['viewerPendingVotes']);

        $stepQuery = <<<'GRAPHQL'
            query ($step: ID!) {
              node(id: $step) {
                ... on ProposalStep {
                  viewerPendingVotes { id proposal { id } }
                  viewerVotes { totalCount }
                }
              }
            }
            GRAPHQL;
        $this->participationCookies($otherParticipant);
        self::assertSame([], $this->graphql($stepQuery, $variables)['node']['viewerPendingVotes']);

        $this->participationCookies($participant);
        $step = $this->graphql($stepQuery, $variables)['node'];
        self::assertSame($pending, $step['viewerPendingVotes']);
        self::assertSame(2, $step['viewerVotes']['totalCount']);

        $removed = $this->graphql(
            <<<'GRAPHQL'
                mutation ($input: RemoveProposalSmsVoteInput!) {
                  removeProposalSmsVote(input: $input) {
                    errorCode
                    step { viewerPendingVotes { id } }
                  }
                }
                GRAPHQL,
            ['input' => [
                'stepId' => $stepId,
                'proposalId' => GlobalId::toGlobalId('Proposal', $proposalPrefix . 'A'),
                'token' => base64_encode($participant->getToken()),
            ]],
        )['removeProposalSmsVote'];
        self::assertNull($removed['errorCode']);
        self::assertSame([], $removed['step']['viewerPendingVotes']);
    }

    /** @return iterable<string, array{string, string, string}> */
    public static function voteSteps(): iterable
    {
        yield 'collect' => ['CollectStep', 'collectStepWorkflowCollectVote', 'proposalWorkflowCollectVote'];

        yield 'selection' => ['SelectionStep', 'selectionStepWorkflowVote1', 'proposalWorkflowVote'];
    }
}
