<?php

namespace Capco\Tests\Repository;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Mapping\ClassMetadata;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class ProposalFormRepositoryTest extends TestCase
{
    /**
     * @phpunit-status non-compliant
     * @phpunit-reason Calls the Doctrine repository directly and constrains SQL and connection calls instead
     * of asserting a domain effect through HTTP or CLI.
     */
    public function testAllocatesTheNextProposalReferenceFromTheDatabaseSequence(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection
            ->expects($this->once())
            ->method('executeStatement')
            ->with(
                'UPDATE proposal_form SET last_proposal_reference = LAST_INSERT_ID(last_proposal_reference + 1) WHERE id = :form_id',
                ['form_id' => 'proposal-form-id']
            )
            ->willReturn(1)
        ;
        $connection->expects($this->once())->method('lastInsertId')->willReturn('106');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);
        $repository = new ProposalFormRepository($entityManager, new ClassMetadata(ProposalForm::class));

        self::assertSame(106, $repository->allocateNextProposalReference('proposal-form-id'));
    }

    /**
     * @phpunit-status non-compliant
     * @phpunit-reason Calls the Doctrine repository directly and constrains SQL and connection calls instead
     * of asserting a domain effect through HTTP or CLI.
     */
    public function testDoesNotUseLastInsertIdWhenTheProposalFormDoesNotExist(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection->expects($this->once())->method('executeStatement')->willReturn(0);
        $connection->expects($this->never())->method('lastInsertId');

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);
        $repository = new ProposalFormRepository($entityManager, new ClassMetadata(ProposalForm::class));

        self::assertNull($repository->allocateNextProposalReference('new-proposal-form-id'));
    }

    /**
     * @phpunit-status non-compliant
     * @phpunit-reason Calls the Doctrine repository directly and constrains SQL and connection calls instead
     * of asserting a domain effect through HTTP or CLI.
     */
    public function testSynchronizesTheProposalReferenceWithAnExplicitReference(): void
    {
        $connection = $this->createMock(Connection::class);
        $connection
            ->expects($this->once())
            ->method('executeStatement')
            ->with(
                'UPDATE proposal_form SET last_proposal_reference = GREATEST(last_proposal_reference, :reference) WHERE id = :form_id',
                ['form_id' => 'proposal-form-id', 'reference' => 106]
            )
        ;

        $entityManager = $this->createMock(EntityManagerInterface::class);
        $entityManager->method('getConnection')->willReturn($connection);
        $repository = new ProposalFormRepository($entityManager, new ClassMetadata(ProposalForm::class));

        $repository->synchronizeLastProposalReference('proposal-form-id', 106);
    }

    /**
     * @phpunit-status compliant
     * @phpunit-reason Checks proposal-reference allocation on a real new domain entity without invoking the
     * repository.
     */
    public function testNewProposalFormAllocatesReferencesInMemoryBeforeItIsPersisted(): void
    {
        $proposalForm = new ProposalForm();

        self::assertSame(1, $proposalForm->allocateNextProposalReference());
        self::assertSame(2, $proposalForm->allocateNextProposalReference());
    }

    /**
     * @phpunit-status compliant
     * @phpunit-reason Checks proposal-reference allocation on a real new domain entity without invoking the
     * repository.
     */
    public function testNewProposalFormSynchronizesWithAnExplicitReference(): void
    {
        $proposalForm = new ProposalForm();
        $proposalForm->synchronizeLastProposalReference(106);

        self::assertSame(107, $proposalForm->allocateNextProposalReference());
    }
}
