<?php

namespace Capco\Tests\Processor\Proposal;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalRevision;
use Capco\AppBundle\Notifier\AnalysisNotifier;
use Capco\AppBundle\Notifier\ProposalNewsNotifier;
use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Notifier\ProposalRevisionNotifier;
use Capco\AppBundle\Processor\Proposal\ProposalAnalyseProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalAssignationProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalCreateProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalDeleteProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalNewsCreateProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalNewsDeleteProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalNewsUpdateProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalRevisionProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalRevisionReviseProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalRevokeProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalUpdateProcessor;
use Capco\AppBundle\Processor\Proposal\ProposalUpdateStatusProcessor;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProposalAnalysisRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\ProposalRevisionRepository;
use Capco\Tests\Command\MailerSnapshotCommandTestCase;
use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\FilterCollection;
use Psr\Log\LoggerInterface;
use Swarrot\Broker\Message;
use Symfony\Component\HttpKernel\KernelInterface;

/**
 * @internal
 * @coversNothing
 */
class ProposalProcessorTest extends MailerSnapshotCommandTestCase
{
    protected const EMAIL_SNAPSHOT_DIRECTORY = __DIR__ . '/__snapshots__';

    /** @dataProvider createScenarios */
    public function testProposalCreateProcessorDelegatesToNotifier(string $proposalId): void
    {
        $proposal = $this->createStub(Proposal::class);
        $repository = $this->createMock(ProposalRepository::class);
        $repository->expects(self::once())->method('find')->with($proposalId)->willReturn($proposal);
        $notifier = $this->createMock(ProposalNotifier::class);
        $notifier->expects(self::once())->method('onCreate')->with($proposal);

        self::assertTrue(
            (new ProposalCreateProcessor($repository, $notifier, $this->logger()))->process(
                $this->message(['proposalId' => $proposalId]),
                []
            )
        );
    }

    /** @return iterable<string, array{string}> */
    public static function createScenarios(): iterable
    {
        yield 'published proposal notification' => ['proposal1'];
        yield 'proposal without acknowledgement configuration' => ['proposal22'];
        yield 'published draft notification' => ['proposal103'];
        yield 'published draft with acknowledgement configuration' => ['proposal104'];
        yield 'proposal participation acknowledgement' => ['proposal1'];
        yield 'configured proposal notification recipient' => ['proposalProjectWithOwner'];
    }

    /** @dataProvider updateScenarios */
    public function testProposalUpdateProcessorDelegatesToNotifier(string $proposalId): void
    {
        $proposal = $this->createStub(Proposal::class);
        $proposal->method('getUpdatedAt')->willReturn(new \DateTimeImmutable('2012-12-12 12:12:12'));
        $repository = $this->createMock(ProposalRepository::class);
        $repository->expects(self::once())->method('find')->with($proposalId)->willReturn($proposal);
        $notifier = $this->createMock(ProposalNotifier::class);
        $notifier->expects(self::once())->method('onUpdate')->with(
            $proposal,
            self::isInstanceOf(\DateTimeInterface::class)
        );

        self::assertTrue(
            (new ProposalUpdateProcessor($repository, $notifier, $this->logger()))->process(
                $this->message(['proposalId' => $proposalId]),
                []
            )
        );
    }

    /** @return iterable<string, array{string}> */
    public static function updateScenarios(): iterable
    {
        yield 'admin and author notifications' => ['proposal10'];
        yield 'update without acknowledgement configuration' => ['proposal22'];
        yield 'assigned analyst notifications' => ['proposal110'];
    }

    /**
     * @dataProvider deleteScenarios
     *
     * @param array<string, string> $payload
     */
    public function testProposalDeleteProcessorDelegatesToNotifier(
        string $proposalId,
        array $payload,
        ?string $decisionMakerId
    ): void {
        $proposal = $this->createStub(Proposal::class);
        $decisionMaker = null;
        $repository = $this->createMock(ProposalRepository::class);
        $repository->expects(self::once())->method('find')->with($proposalId)->willReturn($proposal);
        $users = $this->createMock(UserRepository::class);
        if (null !== $decisionMakerId) {
            $decisionMaker = $this->createStub(User::class);
            $users->expects(self::once())->method('find')->with($decisionMakerId)->willReturn($decisionMaker);
        }
        $notifier = $this->createMock(ProposalNotifier::class);
        $notifier->expects(self::once())->method('onDelete')->with($proposal, null, $decisionMaker);
        $filters = $this->createMock(FilterCollection::class);
        $filters->method('isEnabled')->willReturn(true);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('getFilters')->willReturn($filters);

        self::assertTrue(
            (new ProposalDeleteProcessor(
                $entityManager,
                $repository,
                $users,
                $notifier,
                $this->logger()
            ))->process($this->message($payload), [])
        );
    }

    /** @return iterable<string, array{string, array<string, string>, ?string}> */
    public static function deleteScenarios(): iterable
    {
        yield 'admin notification' => ['proposal12', ['proposalId' => 'proposal12'], null];
        yield 'decision maker notification' => [
            'deletedProposal1',
            ['proposalId' => 'deletedProposal1', 'decisionMakerId' => 'userDecisionMaker'],
            'userDecisionMaker',
        ];
    }

    /** @dataProvider statusScenarios */
    public function testProposalStatusUpdateProcessorDelegatesToNotifier(string $proposalId): void
    {
        $proposal = $this->createStub(Proposal::class);
        $repository = $this->createMock(ProposalRepository::class);
        $repository->expects(self::once())->method('find')->with($proposalId)->willReturn($proposal);
        $notifier = $this->createMock(ProposalNotifier::class);
        $notifier->expects(self::once())->method('onUpdateStatus')->with(
            $proposal,
            self::callback(static fn (\DateTime $date): bool => '12-12-2012 12:12:12' === $date->format('d-m-Y H:i:s'))
        );

        self::assertTrue(
            (new ProposalUpdateStatusProcessor($repository, $notifier, $this->logger()))->process(
                $this->message(['proposalId' => $proposalId, 'date' => '12-12-2012 12:12:12']),
                []
            )
        );
    }

    /** @return iterable<string, array{string}> */
    public static function statusScenarios(): iterable
    {
        yield 'French author' => ['proposal2'];
        yield 'English author' => ['proposal108'];
    }

    /**
     * @dataProvider assignmentScenarios
     *
     * @param list<string> $proposalIds
     */
    public function testProposalAssignmentProcessorsDelegateToNotifier(
        string $processorClass,
        array $proposalIds,
        string $role = ''
    ): void {
        $assigned = $this->createStub(User::class);
        $proposals = array_map(fn (): Proposal => $this->createStub(Proposal::class), $proposalIds);
        $proposalRepository = $this->createMock(ProposalRepository::class);
        $proposalRepository->expects(self::once())->method('findByProposalIds')->with($proposalIds)->willReturn($proposals);
        $userRepository = $this->createMock(UserRepository::class);
        $userRepository->expects(self::once())->method('find')->with('userMickael')->willReturn($assigned);
        $notifier = $this->createMock(AnalysisNotifier::class);

        if (ProposalAssignationProcessor::class === $processorClass) {
            $notifier->expects(self::once())->method('onAssignation')->with($assigned, $proposals, $role);
            $processor = new ProposalAssignationProcessor(
                $proposalRepository,
                $userRepository,
                $notifier,
                $this->logger()
            );
            $payload = ['assigned' => 'userMickael', 'role' => $role, 'proposals' => $proposalIds];
        } else {
            $notifier->expects(self::once())->method('onRevoke')->with($assigned, $proposals);
            $processor = new ProposalRevokeProcessor(
                $proposalRepository,
                $userRepository,
                $notifier,
                $this->logger()
            );
            $payload = ['assigned' => 'userMickael', 'proposals' => $proposalIds];
        }

        self::assertTrue($processor->process($this->message($payload), []));
    }

    /** @return iterable<string, array{string, list<string>, string}> */
    public static function assignmentScenarios(): iterable
    {
        yield 'analyst assignment' => [ProposalAssignationProcessor::class, ['proposal110'], 'admin.global.evaluers'];
        yield 'supervisor assignment' => [ProposalAssignationProcessor::class, ['proposal110', 'proposal111'], 'tag.filter.opinion'];
        yield 'decision maker assignment' => [ProposalAssignationProcessor::class, ['proposal110'], 'tag.filter.decision'];
        yield 'assignment revocation' => [ProposalRevokeProcessor::class, ['proposal110', 'proposal111'], ''];
    }

    /** @dataProvider analysisScenarios */
    public function testProposalAnalysisProcessorDelegatesToNotifier(string $type, string $method): void
    {
        $proposal = $this->createStub(Proposal::class);
        $proposalRepository = $this->createMock(ProposalRepository::class);
        $proposalRepository->expects(self::once())->method('find')->with('proposalIdf3')->willReturn($proposal);
        $notifier = $this->createMock(ProposalNotifier::class);
        $notifier->expects(self::once())->method($method)->with(
            $proposal,
            self::isInstanceOf(\DateTime::class)
        );
        $processor = new ProposalAnalyseProcessor(
            $proposalRepository,
            $this->createStub(ProposalAnalysisRepository::class),
            $notifier,
            $this->logger()
        );

        self::assertTrue($processor->process($this->message([
            'type' => $type,
            'proposalId' => 'proposalIdf3',
            'date' => '12-12-2012 12:12:12',
        ]), []));
    }

    /** @return iterable<string, array{string, string}> */
    public static function analysisScenarios(): iterable
    {
        yield 'assessment publication' => [ProposalAnalyseProcessor::TYPE_ASSESSMENT, 'onAssessmentPublication'];
        yield 'decision publication' => [ProposalAnalyseProcessor::TYPE_DECISION, 'onDecisionPublication'];
    }

    /**
     * @dataProvider revisionScenarios
     *
     * @param array<string, string> $payload
     */
    public function testProposalRevisionProcessorsDelegateToNotifier(
        string $processorClass,
        array $payload
    ): void {
        $proposal = $this->createStub(Proposal::class);
        $proposalRepository = $this->createMock(ProposalRepository::class);
        $proposalRepository->expects(self::once())->method('find')->with('proposalIdf1')->willReturn($proposal);
        $revision = $this->createStub(ProposalRevision::class);
        $revisionRepository = $this->createMock(ProposalRevisionRepository::class);
        $notifier = $this->createMock(ProposalRevisionNotifier::class);

        if (ProposalRevisionProcessor::class === $processorClass) {
            $revisionRepository->expects(self::once())->method('find')->with('proposalRevision2')->willReturn($revision);
            $notifier->expects(self::once())->method('onCreate')->with($revision, $proposal);
            $processor = new ProposalRevisionProcessor($proposalRepository, $revisionRepository, $notifier, $this->logger());
        } else {
            $revisionRepository->expects(self::once())->method('findBy')->with(
                self::callback(static fn (array $criteria): bool => 'proposalIdf1' === $criteria['proposal'])
            )->willReturn([$revision]);
            $notifier->expects(self::once())->method('onUpdate')->with([$revision], $proposal, 'now');
            $processor = new ProposalRevisionReviseProcessor(
                $proposalRepository,
                $revisionRepository,
                $notifier,
                $this->kernel(),
                $this->logger()
            );
        }

        self::assertTrue($processor->process($this->message($payload), []));
    }

    /** @return iterable<string, array{string, array<string, string>}> */
    public static function revisionScenarios(): iterable
    {
        yield 'revision requested' => [
            ProposalRevisionProcessor::class,
            ['proposalRevisionId' => 'proposalRevision2', 'proposalId' => 'proposalIdf1'],
        ];
        yield 'revision completed' => [
            ProposalRevisionReviseProcessor::class,
            ['proposalRevisionId' => 'proposalRevision2', 'proposalId' => 'proposalIdf1', 'date' => 'now'],
        ];
    }

    /**
     * @dataProvider newsScenarios
     *
     * @param array<string, string> $payload
     */
    public function testProposalNewsProcessorsDelegateToNotifier(
        string $processorClass,
        array $payload
    ): void {
        $notifier = $this->createMock(ProposalNewsNotifier::class);
        $postRepository = $this->createStub(PostRepository::class);
        $logger = $this->logger();

        if (ProposalNewsCreateProcessor::class === $processorClass) {
            $post = $this->createStub(Post::class);
            $postRepository->method('find')->with('post18')->willReturn($post);
            $notifier->expects(self::once())->method('onCreate')->with($post);
            $processor = new ProposalNewsCreateProcessor($logger, $postRepository, $notifier);
        } elseif (ProposalNewsUpdateProcessor::class === $processorClass) {
            $post = $this->createStub(Post::class);
            $postRepository->method('find')->with('post18')->willReturn($post);
            $notifier->expects(self::once())->method('onUpdate')->with($post);
            $processor = new ProposalNewsUpdateProcessor($logger, $postRepository, $notifier);
        } else {
            $notifier->expects(self::once())->method('onDelete')->with([
                'postId' => 'post18',
                'proposalName' => 'Il fait beau dehors',
                'projectName' => 'Le projet de la pluie et du beau temps',
                'postAuthor' => 'Senku',
            ]);
            $processor = new ProposalNewsDeleteProcessor($logger, $postRepository, $notifier);
        }

        self::assertTrue($processor->process($this->message($payload), []));
    }

    /** @return iterable<string, array{string, array<string, string>}> */
    public static function newsScenarios(): iterable
    {
        yield 'news created' => [ProposalNewsCreateProcessor::class, ['proposalNewsId' => 'post18']];
        yield 'news updated' => [ProposalNewsUpdateProcessor::class, ['proposalNewsId' => 'post18']];
        yield 'news deleted' => [
            ProposalNewsDeleteProcessor::class,
            [
                'proposalNewsId' => 'post18',
                'proposalName' => 'Il fait beau dehors',
                'projectName' => 'Le projet de la pluie et du beau temps',
                'postAuthor' => 'Senku',
            ],
        ];
    }

    public function testCreateDraftWithoutAcknowledgementMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $this->processor(ProposalCreateProcessor::class)->process($this->message([
            'proposalId' => 'proposal103',
        ]), []);

        $this->assertSnapshot(
            $emails->getMessageWithSubject('notification.proposal.create.subject'),
            'notifyProposal_publishedDraft.html'
        );
    }

    public function testCreateDraftWithAcknowledgementMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $this->processor(ProposalCreateProcessor::class)->process($this->message([
            'proposalId' => 'proposal104',
        ]), []);

        $this->assertSnapshot(
            $emails->getMessageWithSubject('notification.proposal.create.subject'),
            'notifyProposal_publishedAllowedAknowledgeDraft.html'
        );
    }

    /**
     * @dataProvider statusSnapshotScenarios
     */
    public function testStatusChangeMatchesSnapshot(string $proposalId, string $recipient, string $snapshot): void
    {
        $emails = $this->captureEmails();
        $this->processor(ProposalUpdateStatusProcessor::class)->process($this->message([
            'proposalId' => $proposalId,
            'date' => '12-12-2012 12:12:12',
        ]), []);

        $this->assertSnapshot($emails->getMessageForRecipient($recipient), $snapshot);
    }

    /** @return iterable<string, array{string, string, string}> */
    public static function statusSnapshotScenarios(): iterable
    {
        yield 'French author' => ['proposal2', 'user@test.com', 'notifyProposal_AuthorStatusChange.html'];
        yield 'English author' => ['proposal108', 'john.smith@england.uk', 'notifyProposal_AuthorStatusChangeEnglish.html'];
    }

    /**
     * @dataProvider assignmentSnapshotScenarios
     *
     * @param class-string $processorClass
     * @param list<string> $proposalIds
     */
    public function testAssignmentMatchesSnapshot(
        string $processorClass,
        array $proposalIds,
        string $role,
        string $snapshot
    ): void {
        $emails = $this->captureEmails();
        $payload = [
            'assigned' => 'userMickael',
            'proposals' => $proposalIds,
        ];
        if (ProposalAssignationProcessor::class === $processorClass) {
            $payload['role'] = $role;
        }

        $this->processor($processorClass)->process($this->message($payload), []);

        $this->assertSnapshot($emails->getMessageForRecipient('mickael@cap-collectif.com'), $snapshot);
    }

    /** @return iterable<string, array{string, list<string>, string, string}> */
    public static function assignmentSnapshotScenarios(): iterable
    {
        yield 'analyst' => [ProposalAssignationProcessor::class, ['proposal110'], 'admin.global.evaluers', 'notifyAnalyst_NewAnalyst.html'];
        yield 'supervisor' => [ProposalAssignationProcessor::class, ['proposal110', 'proposal111'], 'tag.filter.opinion', 'notifyAnalyst_NewSupervisor.html'];
        yield 'decision maker' => [ProposalAssignationProcessor::class, ['proposal110'], 'tag.filter.decision', 'notifyAnalyst_NewDecisionMaker.html'];
        yield 'revocation' => [ProposalRevokeProcessor::class, ['proposal110', 'proposal111'], '', 'notifyAnalyst_RevokeAnalyst.html'];
    }

    public function testUpdatedProposalMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $this->processor(ProposalUpdateProcessor::class)->process($this->message([
            'proposalId' => 'proposal110',
            'date' => '12-12-2012 12:12:12',
        ]), []);

        $this->assertSnapshot(
            $emails->getMessageForRecipient('analyst2@cap-collectif.com'),
            'notifyAnalyst_updateProposal'
        );
    }

    public function testDeletedProposalMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $this->processor(ProposalDeleteProcessor::class)->process($this->message([
            'proposalId' => 'deletedProposal1',
            'decisionMakerId' => 'userDecisionMaker',
        ]), []);

        $this->assertSnapshot(
            $emails->getMessageForRecipient('decisionmaker@cap-collectif.com'),
            'notifyAnalyst_deleteProposal'
        );
    }

    public function testRevisionRequestMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $this->processor(ProposalRevisionProcessor::class)->process($this->message([
            'proposalRevisionId' => 'proposalRevision2',
            'proposalId' => 'proposalIdf1',
        ]), []);

        $this->assertSnapshot(
            $emails->getMessageForRecipient('pierre@cap-collectif.com'),
            'notifyProposalRevision.html'
        );
    }

    public function testAcknowledgementMatchesSnapshot(): void
    {
        $emails = $this->captureEmails();
        $this->processor(ProposalCreateProcessor::class)->process($this->message([
            'proposalId' => 'proposal1',
        ]), []);

        $this->assertSnapshot(
            $emails->getMessageForRecipient('msantostefano@cap-collectif.com'),
            'aknowledgeProposal.html'
        );
    }

    /**
     * @param class-string $class
     */
    private function processor(string $class): object
    {
        $processor = self::getContainer()->get($class);
        self::assertIsObject($processor);

        return $processor;
    }

    private function assertSnapshot(\Swift_Mime_SimpleMessage $message, string $snapshot): void
    {
        if ('1' === getenv('UPDATE_EMAIL_SNAPSHOTS')) {
            $this->updateEmailSnapshot($message, $snapshot);
        }

        $this->assertEmailMatchesSnapshot($message, $snapshot);
    }

    /** @param array<string, mixed> $payload */
    private function message(array $payload): Message
    {
        return new Message(json_encode($payload, \JSON_THROW_ON_ERROR));
    }

    private function logger(): LoggerInterface
    {
        return $this->createStub(LoggerInterface::class);
    }

    private function kernel(): KernelInterface
    {
        $kernel = $this->createStub(KernelInterface::class);
        $kernel->method('getEnvironment')->willReturn('test');

        return $kernel;
    }
}
