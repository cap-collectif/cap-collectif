<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Questionnaire;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\GraphQL\Mutation\ProposalVoteAccountHandler;
use Capco\AppBundle\GraphQL\Mutation\ValidateContributionMutation;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\ViewerIsMeetingRequirementsResolver;
use Capco\AppBundle\Repository\ParticipantRepository;
use Capco\AppBundle\Repository\ProposalCollectVoteRepository;
use Capco\AppBundle\Repository\ProposalSelectionVoteRepository;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\AppBundle\Service\ProjectParticipantsTotalCountCacheHandler;
use Capco\AppBundle\Service\ReplyCounterIndexer;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use GraphQL\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class ValidateContributionMutationTest extends TestCase
{
    private GlobalIdResolver $globalIdResolver;
    private ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver;
    private ViewerIsMeetingRequirementsResolver $viewerIsMeetingRequirementsResolver;
    private UrlResolver $stepUrlResolver;
    private ParticipantHelper $participantHelper;
    private ReplyCounterIndexer $replyCounterIndexer;

    private ValidateContributionMutation $validateContributionMutation;

    private User $viewer;

    private Participant $participant;

    private Reply $reply;

    private Questionnaire $questionnaire;

    private QuestionnaireStep $questionnaireStep;
    private ProposalVoteAccountHandler $proposalVoteAccountHandler;

    private Indexer $indexer;

    private ProposalSelectionVoteRepository $proposalSelectionVoteRepository;

    private ProposalCollectVoteRepository $proposalCollectVoteRepository;

    private ProjectParticipantsTotalCountCacheHandler $projectParticipantsTotalCountCacheHandler;
    private ParticipantRepository $participantRepository;

    protected function setUp(): void
    {
        $em = $this->createMock(EntityManagerInterface::class);
        $this->globalIdResolver = $this->createMock(GlobalIdResolver::class);
        $this->participantIsMeetingRequirementsResolver = $this->createMock(ParticipantIsMeetingRequirementsResolver::class);
        $this->viewerIsMeetingRequirementsResolver = $this->createMock(ViewerIsMeetingRequirementsResolver::class);
        $this->stepUrlResolver = $this->createMock(UrlResolver::class);
        $this->participantHelper = $this->createMock(ParticipantHelper::class);
        $this->replyCounterIndexer = $this->createMock(ReplyCounterIndexer::class);
        $this->viewer = $this->createMock(User::class);
        $this->participant = $this->createMock(Participant::class);
        $this->reply = $this->createMock(Reply::class);
        $this->questionnaire = $this->createMock(Questionnaire::class);
        $this->questionnaireStep = $this->createMock(QuestionnaireStep::class);
        $this->proposalVoteAccountHandler = $this->createMock(ProposalVoteAccountHandler::class);
        $this->indexer = $this->createMock(Indexer::class);
        $this->proposalSelectionVoteRepository = $this->createMock(ProposalSelectionVoteRepository::class);
        $this->proposalCollectVoteRepository = $this->createMock(ProposalCollectVoteRepository::class);
        $this->projectParticipantsTotalCountCacheHandler = $this->createMock(ProjectParticipantsTotalCountCacheHandler::class);
        $this->participantRepository = $this->createMock(ParticipantRepository::class);

        $this->validateContributionMutation = new ValidateContributionMutation(
            $em,
            $this->globalIdResolver,
            $this->participantIsMeetingRequirementsResolver,
            $this->viewerIsMeetingRequirementsResolver,
            $this->stepUrlResolver,
            $this->participantHelper,
            $this->replyCounterIndexer,
            $this->proposalVoteAccountHandler,
            $this->indexer,
            $this->proposalSelectionVoteRepository,
            $this->proposalCollectVoteRepository,
            $this->projectParticipantsTotalCountCacheHandler,
            $this->participantRepository
        );
    }

    public function setUpViewer(): Argument
    {
        $contributionId = 'contributionId';
        $redirectUrl = 'redirectUrl';
        $args = new Argument(['input' => [
            'contributionId' => $contributionId,
        ]]);

        $this->globalIdResolver->method('resolve')->with($contributionId)->willreturn($this->reply);
        $this->reply->method('getQuestionnaire')->willReturn($this->questionnaire);
        $this->questionnaireStep->method('isOpen')->willReturn(true);
        $this->questionnaire->method('getStep')->willreturn($this->questionnaireStep);
        $this->stepUrlResolver->method('getStepUrl')->willReturn($redirectUrl);

        return $args;
    }

    public function testNoViewerOrTokenUserError(): void
    {
        $args = new Argument(['input' => [
            'token' => null,
        ]]);

        $this->expectException(UserError::class);
        $this->expectExceptionMessage('You must be logged in or send a participant token');
        $this->validateContributionMutation->__invoke($args);
    }

    public function testParticipantNotAuthorError(): void
    {
        [$args] = $this->setupParticipant();

        $this->reply->method('getParticipant')->willReturn(null);

        $this->expectException(UserError::class);
        $this->expectExceptionMessage('Given participant is not the author of the contribution');

        $this->validateContributionMutation->__invoke($args);
    }

    public function testInvalidRequirementsAsParticipant(): void
    {
        [$args] = $this->setupParticipant();

        $this->reply->method('getParticipant')->willReturn($this->participant);
        $this->validateContribution(true, false);

        $this->expectException(UserError::class);
        $this->expectExceptionMessage('Participant does not meet requirements');

        $this->validateContributionMutation->__invoke($args);
    }

    public function testValidRequirementsAsParticipant(): void
    {
        [$args] = $this->setupParticipant();

        $this->reply->method('getParticipant')->willReturn($this->participant);
        $this->validateContribution(true, true);

        $this->validateContributionMutation->__invoke($args);
    }

    public function testViewerNotAuthorError(): void
    {
        $args = $this->setUpViewer();

        $this->reply->method('getAuthor')->willReturn(null);

        $this->expectException(UserError::class);
        $this->expectExceptionMessage('Given viewer is not the author of the contribution');

        $this->validateContributionMutation->__invoke($args, $this->viewer);
    }

    public function testInvalidRequirementsAsViewer(): void
    {
        $args = $this->setUpViewer();

        $this->reply->method('getAuthor')->willReturn($this->viewer);
        $this->validateContribution(false, false);

        $this->expectException(UserError::class);
        $this->expectExceptionMessage('Viewer does not meet requirements');

        $this->validateContributionMutation->__invoke($args, $this->viewer);
    }

    public function testValidRequirementsAsViewer(): void
    {
        $args = $this->setUpViewer();

        $this->reply->method('getAuthor')->willReturn($this->viewer);
        $this->validateContribution(false, true);

        $this->validateContributionMutation->__invoke($args, $this->viewer);
    }

    /**
     * @return array{Argument, string}
     */
    private function setupParticipant(): array
    {
        $token = 'token';
        $contributionId = 'contributionId';
        $redirectUrl = 'redirectUrl';
        $args = new Argument(['input' => [
            'token' => $token,
            'contributionId' => $contributionId,
        ]]);

        $this->participantHelper->method('getParticipantByToken')->with($token)->willReturn($this->participant);
        $this->globalIdResolver->method('resolve')->with($contributionId)->willreturn($this->reply);
        $this->reply->method('getQuestionnaire')->willReturn($this->questionnaire);

        $this->questionnaireStep->method('isOpen')->willReturn(true);
        $this->questionnaire->method('getStep')->willreturn($this->questionnaireStep);
        $this->stepUrlResolver->method('getStepUrl')->willReturn($redirectUrl);

        return [$args, $redirectUrl];
    }

    private function validateContribution(bool $isParticipant, bool $isMeetingRequirement): void
    {
        $stepId = 'stepId';
        $this->questionnaireStep->method('getId')->willReturn($stepId);

        $resolver = $isParticipant ? $this->participantIsMeetingRequirementsResolver : $this->viewerIsMeetingRequirementsResolver;

        $args = new Argument(['stepId' => GlobalId::toGlobalId('AbstractStep', $stepId)]);

        $params = $isParticipant ? [$this->participant, $args] : [$args, $this->viewer];

        $resolver->expects($this->once())->method('__invoke')->with(...$params)->willReturn($isMeetingRequirement);

        if ($isMeetingRequirement) {
            $this->reply->expects($this->once())->method('setCompletedStatus');
            $this->reply->expects($this->once())->method('setPublishedAt');
            $this->replyCounterIndexer->expects($this->once())->method('syncIndex')->with($this->reply);
        }
    }
}
