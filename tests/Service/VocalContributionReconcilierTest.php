<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\VocalContribution;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\Repository\VocalContributionRepository;
use Capco\AppBundle\Service\ParticipationWorkflow\VocalContributionReconcilier;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Query\FilterCollection;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Vocal reconciliation preserves the contribution data while transferring ownership.
 */
final class VocalContributionReconcilierTest extends TestCase
{
    public function testReconcilesAllStatusesToAUser(): void
    {
        $source = new Participant();
        $target = new User();
        $missingRequirements = new VocalContribution();
        $completed = (new VocalContribution())->setCompletedStatus();
        $repository = $this->repository($source, [$missingRequirements, $completed]);
        $entityManager = $this->entityManager();

        (new VocalContributionReconcilier($entityManager, $repository))->reconcile($source, $target);

        self::assertSame($target, $missingRequirements->getUser());
        self::assertSame($target, $completed->getUser());
        self::assertNull($missingRequirements->getParticipant());
        self::assertNull($completed->getParticipant());
        self::assertSame('MISSING_REQUIREMENTS', $missingRequirements->getCompletionStatus());
        self::assertSame('COMPLETED', $completed->getCompletionStatus());
    }

    public function testReconcilesAllStatusesToAnotherParticipant(): void
    {
        $source = new Participant();
        $target = new Participant();
        $missingRequirements = new VocalContribution();
        $completed = (new VocalContribution())->setCompletedStatus();
        $repository = $this->repository($source, [$missingRequirements, $completed]);
        $entityManager = $this->entityManager();

        (new VocalContributionReconcilier($entityManager, $repository))->reconcile($source, $target);

        self::assertSame($target, $missingRequirements->getParticipant());
        self::assertSame($target, $completed->getParticipant());
        self::assertNull($missingRequirements->getUser());
        self::assertNull($completed->getUser());
        self::assertSame('MISSING_REQUIREMENTS', $missingRequirements->getCompletionStatus());
        self::assertSame('COMPLETED', $completed->getCompletionStatus());
    }

    /**
     * @param list<VocalContribution> $contributions
     */
    private function repository(Participant $source, array $contributions): VocalContributionRepository
    {
        $repository = $this->createStub(VocalContributionRepository::class);
        $repository->method('findBy')->with(['participant' => $source])->willReturn($contributions);

        return $repository;
    }

    private function entityManager(): EntityManagerInterface
    {
        $filters = $this->createStub(FilterCollection::class);
        $filters->method('isEnabled')->with(ContributionCompletionStatusFilter::FILTER_NAME)->willReturn(false);

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getFilters')->willReturn($filters);
        $entityManager->expects(self::once())->method('flush');

        return $entityManager;
    }
}
