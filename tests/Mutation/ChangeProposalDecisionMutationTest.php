<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalAnalysis;
use Capco\AppBundle\Entity\ProposalAssessment;
use Capco\AppBundle\Entity\ProposalDecision;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\ProposalStatementErrorCode;
use Capco\AppBundle\Enum\ProposalStatementState;
use Capco\AppBundle\GraphQL\Mutation\ChangeProposalDecisionMutation;
use Capco\AppBundle\GraphQL\Mutation\ProposalDecision\DecisionFlowSideEffectsService;
use Capco\AppBundle\GraphQL\Mutation\ProposalDecision\ImmediatelyEffectiveDecisionFlowStrategy;
use Capco\AppBundle\GraphQL\Mutation\ProposalDecision\StandardDecisionFlowStrategy;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\StatusRepository;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\MockObject\Stub;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 *
 * @coversNothing
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Exercises the public mutation with real domain objects; persistence and external services are stubbed.
 */
class ChangeProposalDecisionMutationTest extends TestCase
{
    private ProposalRepository&Stub $proposalRepository;
    private Stub&UserRepository $userRepository;
    private EntityManagerInterface&Stub $entityManager;
    private StatusRepository&Stub $statusRepository;
    private AuthorizationCheckerInterface&Stub $authorizationChecker;
    private Stub&TranslatorInterface $translator;
    private GlobalIdResolver&Stub $globalIdResolver;
    private LoggerInterface&Stub $logger;
    private Indexer&Stub $indexer;
    private EventDispatcherInterface&MockObject $eventDispatcher;
    private MockObject&Publisher $publisher;

    private ChangeProposalDecisionMutation $mutation;

    protected function setUp(): void
    {
        $this->proposalRepository = $this->createStub(ProposalRepository::class);
        $this->userRepository = $this->createStub(UserRepository::class);
        $this->entityManager = $this->createStub(EntityManagerInterface::class);
        $this->statusRepository = $this->createStub(StatusRepository::class);
        $this->authorizationChecker = $this->createStub(AuthorizationCheckerInterface::class);
        $this->translator = $this->createStub(TranslatorInterface::class);
        $this->globalIdResolver = $this->createStub(GlobalIdResolver::class);
        $this->logger = $this->createStub(LoggerInterface::class);
        $this->indexer = $this->createStub(Indexer::class);
        $this->eventDispatcher = $this->createMock(EventDispatcherInterface::class);
        $this->publisher = $this->createMock(Publisher::class);

        $decisionFlowSideEffectsService = new DecisionFlowSideEffectsService(
            $this->indexer,
            $this->publisher
        );

        $this->mutation = new ChangeProposalDecisionMutation(
            $this->proposalRepository,
            $this->userRepository,
            $this->entityManager,
            $this->statusRepository,
            $this->authorizationChecker,
            $this->translator,
            $this->globalIdResolver,
            new ImmediatelyEffectiveDecisionFlowStrategy(
                $this->entityManager,
                $this->indexer,
                $this->eventDispatcher,
                $decisionFlowSideEffectsService
            ),
            new StandardDecisionFlowStrategy(
                $this->entityManager,
                $this->logger,
                $decisionFlowSideEffectsService
            )
        );
    }

    public function testAllowsSavingADecisionDraftWithoutApprovalChoice(): void
    {
        $viewer = new User();
        $proposal = $this->createImmediatelyEffectiveProposal();
        $decision = $proposal->getDecision();
        $assessment = new ProposalAssessment($proposal);
        $analysis = (new ProposalAnalysis())->setProposal($proposal);
        $proposal->addAnalysis($analysis);

        $this->eventDispatcher->expects($this->never())->method('dispatch');
        $this->publisher->expects($this->never())->method('publish');

        $result = $this->mutation->__invoke($this->createArgument([
            'isApproved' => null,
            'isDone' => false,
        ]), $viewer);

        self::assertNull($result['errorCode']);
        self::assertSame($decision, $result['decision']);
        self::assertSame($proposal, $result['proposal']);
        self::assertNull($decision->isApproved());
        self::assertSame(ProposalStatementState::IN_PROGRESS, $decision->getState());
        self::assertSame(10, $decision->getEstimatedCost());
        self::assertSame($viewer, $decision->getUpdatedBy());
        self::assertSame('body', $decision->getOfficialResponse()->getBody());
        self::assertFalse($decision->getOfficialResponse()->isPublished());
        self::assertSame(ProposalStatementState::IN_PROGRESS, $assessment->getState());
        self::assertSame(ProposalStatementState::IN_PROGRESS, $analysis->getState());
    }

    public function testRequiresApprovalChoiceWhenFinalizingADecision(): void
    {
        $proposal = $this->createImmediatelyEffectiveProposal();
        $decision = $proposal->getDecision();
        $decision->setEstimatedCost(42);

        $this->eventDispatcher->expects($this->never())->method('dispatch');
        $this->publisher->expects($this->never())->method('publish');

        $result = $this->mutation->__invoke($this->createArgument([
            'isApproved' => null,
            'isDone' => true,
        ]), new User());

        self::assertNull($result['decision']);
        self::assertSame(ProposalStatementErrorCode::DECISION_REQUIRED, $result['errorCode']);
        self::assertSame(42, $decision->getEstimatedCost());
        self::assertNull($decision->isApproved());
        self::assertNull($decision->getOfficialResponse());
        self::assertSame(ProposalStatementState::IN_PROGRESS, $decision->getState());
    }

    /**
     * @param array<string, mixed> $overrides
     */
    private function createArgument(array $overrides = []): Argument
    {
        return new Argument(['input' => array_merge([
            'proposalId' => GlobalId::toGlobalId('Proposal', 'proposalId'),
            'body' => 'body',
            'authors' => [],
            'estimatedCost' => 10,
            'isApproved' => true,
            'refusedReason' => null,
            'isDone' => true,
        ], $overrides)]);
    }

    private function createImmediatelyEffectiveProposal(): Proposal
    {
        $proposal = (new Proposal())->setId('proposalId');
        $form = new ProposalForm();
        (new AnalysisConfiguration())->setProposalForm($form);
        $proposal->setProposalForm($form);
        $decision = new ProposalDecision($proposal);
        $decision->setUpdatedAt(new \DateTimeImmutable('2026-10-01 12:00:00'));
        $proposal->setDecision($decision);

        $this->proposalRepository->method('find')->willReturn($proposal);
        $this->authorizationChecker->method('isGranted')->willReturn(true);

        return $proposal;
    }
}
