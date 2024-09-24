<?php

namespace Capco\Tests\GraphQL\Service;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Enum\VoteType;
use Capco\AppBundle\GraphQL\Service\ProposalStepSplitViewService;
use Doctrine\ORM\EntityManager;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @coversNothing
 */
class ProposalStepSplitViewServiceTest extends TestCase
{
    /**
     * @return array<string, array<int, array<string, null|int>|bool|string>>
     */
    public function shouldDisableProposalStepSplitViewDataProvider(): array
    {
        $dataWithoutThresholdWithoutBudget = [
            'voteThreshold' => null,
            'voteType' => VoteType::SIMPLE,
        ];

        $dataWithoutThresholdWithBudget = [
            'voteThreshold' => null,
            'voteType' => VoteType::BUDGET,
        ];
        $dataWithThresholdWithoutBudget = [
            'voteThreshold' => 1,
            'voteType' => VoteType::SIMPLE,
        ];
        $dataWithThresholdWithBudget = [
            'voteThreshold' => 1,
            'voteType' => VoteType::BUDGET,
        ];
        $dataWithWrongThresholdWithoutBudget = [
            'voteThreshold' => 0,
            'voteType' => VoteType::SIMPLE,
        ];
        $dataWithBudgetButMissingKey = [
            'voteType' => VoteType::BUDGET,
        ];

        return [
            'In PresentationStep, we do not disable SplitView' => [PresentationStep::class, $dataWithThresholdWithoutBudget, false],
            'In ConsultationStep, we do not disable SplitView' => [ConsultationStep::class, $dataWithoutThresholdWithBudget, false],
            'CollectStep without threshold and without budget' => [CollectStep::class, $dataWithoutThresholdWithoutBudget, false],
            'SelectionStep without threshold and without budget' => [SelectionStep::class, $dataWithoutThresholdWithoutBudget, false],
            'SelectionStep without threshold and with budget' => [SelectionStep::class, $dataWithoutThresholdWithBudget, true],
            'CollectStep without threshold and with budget' => [CollectStep::class, $dataWithoutThresholdWithBudget, true],
            'SelectionStep with threshold and without budget' => [SelectionStep::class, $dataWithThresholdWithoutBudget, true],
            'SelectionStep with threshold and with budget' => [SelectionStep::class, $dataWithThresholdWithBudget, true],
            'SelectionStep with wrong threshold value and without budget' => [SelectionStep::class, $dataWithWrongThresholdWithoutBudget, false],
            'SelectionStep with budget but missing data' => [SelectionStep::class, $dataWithBudgetButMissingKey, false],
        ];
    }

    /**
     * @dataProvider shouldDisableProposalStepSplitViewDataProvider
     *
     * @param class-string                                                   $stepClass
     * @param array<string, array<int, array<string, null|int>|bool|string>> $data
     */
    public function testShouldDisableProposalStepSplitView(string $stepClass, array $data, bool $expected): void
    {
        $step = $this->getMockBuilder($stepClass)->disableOriginalConstructor()->getMock();

        $service = $this->getSut();
        $result = $service->shouldDisableProposalStepSplitView($step, $data);

        $this->assertEquals($expected, $result);
    }

    private function getSut(): ProposalStepSplitViewService
    {
        $emMock = $this->getMockBuilder(EntityManager::class)->disableOriginalConstructor()->getMock();

        return new ProposalStepSplitViewService($emMock);
    }
}
