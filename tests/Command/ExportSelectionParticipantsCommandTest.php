<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportSelectionParticipantsCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports/selection';
    public const EXPECTED_FILE_NAMES = [
        'participants_bp-avec-vote-classement_selection-avec-vote-classement-limite',
        'participants_budget-avec-vote-limite_selection-avec-vote-budget-limite',
        'participants_budget-participatif-idf-3_le-suivi-des-projets-laureats',
        'participants_budget-participatif-idf-3_vote-des-franciliens',
        'participants_budget-participatif-rennes_selection',
        'participants_budget-participatif-rennes_fermee',
        'participants_depot-avec-selection-vote-budget_selection-avec-vote-selon-le-budget',
        'participants_projet-pour-consolider-les-exports_selectionstepexport',
        'participants_questions-responses_selection-de-questions-avec-vote-classement-limite',
    ];
    public const FULL_SUFFIX = '.csv';
    public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export/selection';
    public const COMMAND = 'capco:export:selection:participants';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        $this->emptyOutputDirectory();

        $actualOutputs = $this->executeCommand(self::COMMAND);

        $fullFileNames = self::getCompletedFileNames(self::FULL_SUFFIX);
        $simplifiedFileNames = self::getCompletedFileNames(self::SIMPLIFIED_SUFFIX);

        $this->assertOutputs($actualOutputs, array_merge($simplifiedFileNames, $fullFileNames));
    }

    public function testIfFileIsGeneratedWhenUserWasUpdated(): void
    {
        [$commandTester, $options] = $this->executeFirstCommand(self::COMMAND);

        $this->updateUser('user7');

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('participants_budget-participatif-rennes_selection_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('participants_budget-participatif-rennes_selection.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetUserUpdatedAt('user7');
    }
}
