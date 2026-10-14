<?php

namespace Capco\Tests\GraphQL\Mutation;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\VocalContribution;
use Capco\AppBundle\GraphQL\Mutation\AddVocalContributionMutation;
use Capco\AppBundle\GraphQL\Resolver\Participant\ParticipantIsMeetingRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Requirement\ViewerIsMeetingRequirementsResolver;
use Capco\AppBundle\Repository\CollectStepRepository;
use Capco\AppBundle\Repository\VocalContributionRepository;
use Capco\AppBundle\Service\ParticipantHelper;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class AddVocalContributionMutationTest extends TestCase
{
    public function testAttachesVocalToAuthenticatedUser(): void
    {
        $vocal = $this->vocal();
        $repository = $this->createMock(VocalContributionRepository::class);
        $repository->expects(self::once())->method('find')->with('vocal-id')->willReturn($vocal);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('flush');
        $mutation = $this->mutation($repository, $entityManager);
        $user = new User();

        $result = $mutation(new Argument(['input' => ['vocalId' => GlobalId::toGlobalId('VocalContribution', 'vocal-id')]]), $user);

        self::assertSame(GlobalId::toGlobalId('VocalContribution', 'vocal-id'), $result['contributionId']);
        self::assertFalse($result['shouldTriggerParticipationWorkflow']);
        self::assertTrue($result['shouldTriggerConsentInternalCommunication']);
        self::assertSame('COMPLETED', $result['completionStatus']);
        self::assertSame($user, $vocal->getUser());
        self::assertNull($vocal->getParticipant());
    }

    public function testAttachesVocalToAnonymousParticipant(): void
    {
        $vocal = $this->vocal();
        $participant = (new Participant())->setToken('token');
        $repository = $this->createMock(VocalContributionRepository::class);
        $repository->method('find')->willReturn($vocal);
        $helper = $this->createMock(ParticipantHelper::class);
        $helper->expects(self::once())->method('getParticipantByToken')->with('token')->willReturn($participant);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('flush');
        $requirementsResolver = $this->createStub(ParticipantIsMeetingRequirementsResolver::class);
        $requirementsResolver->method('__invoke')->willReturn(false);
        $mutation = $this->mutation($repository, $entityManager, $helper, $requirementsResolver);

        $result = $mutation(new Argument(['input' => [
            'vocalId' => GlobalId::toGlobalId('VocalContribution', 'vocal-id'),
            'participantToken' => 'token',
        ]]));

        self::assertSame($participant, $vocal->getParticipant());
        self::assertTrue($result['shouldTriggerParticipationWorkflow']);
        self::assertSame('MISSING_REQUIREMENTS', $result['completionStatus']);
        self::assertTrue($result['shouldTriggerConsentInternalCommunication']);
        self::assertSame('token', $result['participantToken']);
    }

    public function testRejectsAlreadySubmittedVocal(): void
    {
        $vocal = $this->vocal()->setCompletedStatus();
        $repository = $this->createMock(VocalContributionRepository::class);
        $repository->method('find')->willReturn($vocal);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::never())->method('flush');
        $mutation = $this->mutation($repository, $entityManager);

        $this->expectException(UserError::class);
        $mutation(new Argument(['input' => ['vocalId' => GlobalId::toGlobalId('VocalContribution', 'vocal-id')]]), new User());
    }

    public function testRejectsAnonymousAccessWithoutParticipantToken(): void
    {
        $participant = new Participant();
        $vocal = $this->vocal()->setParticipant($participant);
        $repository = $this->createMock(VocalContributionRepository::class);
        $repository->method('find')->willReturn($vocal);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::never())->method('flush');
        $mutation = $this->mutation($repository, $entityManager);

        $this->expectException(UserError::class);
        $mutation(new Argument(['input' => ['vocalId' => GlobalId::toGlobalId('VocalContribution', 'vocal-id')]]));
    }

    public function testReturnsParticipantTokenForNewAnonymousParticipant(): void
    {
        $vocal = $this->vocal();
        $participant = (new Participant())->setToken('participant-token');
        $repository = $this->createMock(VocalContributionRepository::class);
        $repository->method('find')->willReturn($vocal);
        $helper = $this->createMock(ParticipantHelper::class);
        $helper->expects(self::once())->method('getOrCreateParticipant')->willReturn($participant);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('flush');
        $mutation = $this->mutation($repository, $entityManager, $helper);

        $result = $mutation(new Argument(['input' => ['vocalId' => GlobalId::toGlobalId('VocalContribution', 'vocal-id')]]));

        self::assertSame('participant-token', $result['participantToken']);
    }

    public function testTransfersAnonymousVocalToAuthenticatedUserWithParticipantToken(): void
    {
        $participant = (new Participant())->setToken('participant-token');
        $vocal = $this->vocal()->setParticipant($participant);
        $repository = $this->createMock(VocalContributionRepository::class);
        $repository->method('find')->willReturn($vocal);
        $helper = $this->createMock(ParticipantHelper::class);
        $helper->expects(self::once())->method('getParticipantByToken')->with('participant-token')->willReturn($participant);
        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->expects(self::once())->method('flush');
        $mutation = $this->mutation($repository, $entityManager, $helper);
        $user = new User();

        $mutation(new Argument(['input' => [
            'vocalId' => GlobalId::toGlobalId('VocalContribution', 'vocal-id'),
            'participantToken' => 'participant-token',
        ]]), $user);

        self::assertSame($user, $vocal->getUser());
        self::assertNull($vocal->getParticipant());
    }

    private function mutation(
        VocalContributionRepository $repository,
        EntityManagerInterface $entityManager,
        ?ParticipantHelper $participantHelper = null,
        ?ParticipantIsMeetingRequirementsResolver $participantIsMeetingRequirementsResolver = null
    ): AddVocalContributionMutation {
        $stepRepository = $this->createStub(CollectStepRepository::class);
        $stepRepository->method('findVocalContributionStep')->willReturn($this->step());
        $participantIsMeetingRequirementsResolver ??= $this->createStub(ParticipantIsMeetingRequirementsResolver::class);
        $participantIsMeetingRequirementsResolver->method('__invoke')->willReturn(true);
        $viewerIsMeetingRequirementsResolver = $this->createStub(ViewerIsMeetingRequirementsResolver::class);
        $viewerIsMeetingRequirementsResolver->method('__invoke')->willReturn(true);

        return new AddVocalContributionMutation(
            $repository,
            $participantHelper ?? $this->createStub(ParticipantHelper::class),
            $entityManager,
            $stepRepository,
            $participantIsMeetingRequirementsResolver,
            $viewerIsMeetingRequirementsResolver
        );
    }

    private function step(): CollectStep
    {
        $step = new CollectStep();
        $step->setId('step-id');

        return $step;
    }

    private function vocal(): VocalContribution
    {
        return (new VocalContribution())
            ->setId('vocal-id')
            ->setMedia((new Media())->setContext(Media::VOCAL_CONTRIBUTION_CONTEXT))
        ;
    }
}
