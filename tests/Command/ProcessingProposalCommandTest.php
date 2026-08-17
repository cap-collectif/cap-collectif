<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Entity\AnalysisConfiguration;
use Capco\AppBundle\Entity\AnalysisConfigurationProcess;

/**
 * @internal
 * @coversNothing
 */
class ProcessingProposalCommandTest extends DatabaseCommandTestCase
{
    public function testProcessesEligibleProposalDecisions(): void
    {
        $configuration = $this->entityManager
            ->getRepository(AnalysisConfiguration::class)
            ->find('analysisConfigurationIdf')
        ;
        self::assertInstanceOf(AnalysisConfiguration::class, $configuration);
        self::assertFalse($configuration->getEffectiveDateProcessed());

        $processRepository = $this->entityManager->getRepository(
            AnalysisConfigurationProcess::class
        );
        $initialProcessCount = $processRepository->count([
            'analysisConfiguration' => $configuration,
        ]);

        $commandTester = $this->createCommandTester('capco:process_proposals');
        $commandTester->execute([
            '--time' => '2021-01-01 03:00:00',
            '--message' => 'no',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            '2 proposals have been processed.',
            $commandTester->getDisplay()
        );
        self::assertTrue($configuration->getEffectiveDateProcessed());

        $processes = $processRepository->findBy([
            'analysisConfiguration' => $configuration,
        ]);
        self::assertCount($initialProcessCount + 1, $processes);

        $latestProcess = end($processes);
        self::assertInstanceOf(AnalysisConfigurationProcess::class, $latestProcess);
        self::assertCount(2, $latestProcess->getDecisions());
    }
}
