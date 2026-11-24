<?php

namespace Capco\Tests\Service;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Enum\ProposalArchivedUnitTime;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalArchiveLimitDateResolver;
use Capco\AppBundle\Service\ProposalVotePeriodChecker;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Vote period rule checked through the public checker with real entities and explicit dates.
 */
class ProposalVotePeriodCheckerTest extends TestCase
{
    private ProposalVotePeriodChecker $checker;

    protected function setUp(): void
    {
        $this->checker = new ProposalVotePeriodChecker(new ProposalArchiveLimitDateResolver());
    }

    /**
     * @dataProvider votePeriodProvider
     */
    public function testVotePeriod(
        bool $isArchived,
        int $proposalArchivedTime,
        string $publishedAt,
        string $checkedAt,
        bool $isVotePeriodOver
    ): void {
        $step = $this->createCollectStep($proposalArchivedTime);
        $proposal = $this->createProposal($step, $publishedAt);
        $proposal->setIsArchived($isArchived);

        self::assertSame(
            $isVotePeriodOver,
            $this->checker->isVotePeriodOver($proposal, $step, new \DateTime($checkedAt))
        );
    }

    public function votePeriodProvider(): \Generator
    {
        yield 'Vote period is over for an archived proposal' => [
            true,
            0,
            '2026-01-10 10:00:00',
            '2026-01-11 12:00:00',
            true,
        ];

        yield 'Vote period is over once the archiving deadline has passed' => [
            false,
            10,
            '2026-01-10 10:00:00',
            '2026-01-21 00:00:01',
            true,
        ];

        yield 'Vote period is still running before the archiving deadline' => [
            false,
            10,
            '2026-01-10 10:00:00',
            '2026-01-20 23:59:59',
            false,
        ];

        yield 'Vote period never ends without automatic archiving' => [
            false,
            0,
            '2015-01-10 10:00:00',
            '2026-01-21 00:00:01',
            false,
        ];
    }

    private function createCollectStep(int $proposalArchivedTime): CollectStep
    {
        $step = new CollectStep();
        $step->setProposalArchivedTime($proposalArchivedTime);
        $step->setProposalArchivedUnitTime(ProposalArchivedUnitTime::DAYS);

        return $step;
    }

    private function createProposal(CollectStep $step, string $publishedAt): Proposal
    {
        $form = new ProposalForm();
        $form->setStep($step);

        $proposal = new Proposal();
        $proposal->setProposalForm($form);
        $proposal->setPublishedAt(new \DateTime($publishedAt));

        return $proposal;
    }
}
