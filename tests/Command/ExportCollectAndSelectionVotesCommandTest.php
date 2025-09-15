<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Finder\Finder;

/**
 * @internal
 * @coversNothing
 */
class ExportCollectAndSelectionVotesCommandTest extends KernelTestCase
{
    use CommandTestTrait;

    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports';
    public const EXPECTED_FILE_NAMES = [
        'collect' => [
            'votes_appel-a-projets_collecte-des-propositions-avec-vote-simple_simplified',
            'votes_budget-participatif-idf-3_collecte-vote-par-sms_simplified',
            'votes_bp-avec-vote-classement_collecte-avec-vote-classement-limite_simplified',
            'votes_projet-pour-consolider-les-exports_etape-de-depot-des-exports_simplified',
            'votes_bp-vote-etape-de-depot_collecte-des-propositions-vote-parcours-min-3-max-5_simplified',
            'votes_questions-responses_collecte-des-questions-chez-youpie_simplified',
        ],
        'selection' => [
            'votes_bp-avec-vote-classement_selection-avec-vote-classement-limite_simplified',
            'votes_budget-participatif-rennes_fermee_simplified',
            'votes_bp-vote-parcours_vote-parcours-min-3-max-5_simplified',
            'votes_budget-participatif-rennes_selection_simplified',
            'votes_budget-avec-vote-limite_selection-avec-vote-budget-limite_simplified',
            'votes_depot-avec-selection-vote-budget_selection-avec-vote-selon-le-budget_simplified',
            'votes_budget-participatif-idf-3_le-suivi-des-projets-laureats_simplified',
            'votes_projet-pour-consolider-les-exports_selectionstepexport_simplified',
            'votes_budget-participatif-idf-3_vote-des-franciliens_simplified',
            'votes_questions-responses_selection-de-questions-avec-vote-classement-limite_simplified',
        ],
    ];
    public const SIMPLIFIED_SUFFIX = '_simplified';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export';
    public const OUTPUT_DIRECTORIES_STEP_TYPE = [
        'collect' => self::OUTPUT_DIRECTORY . '/collect',
        'selection' => self::OUTPUT_DIRECTORY . '/selection',
    ];
    public const CAPCO_EXPORT_COLLECT_SELECTION_VOTES = 'capco:export:collect-selection:votes';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        foreach (self::OUTPUT_DIRECTORIES_STEP_TYPE as $outputDir) {
            $this->emptyOutputDirectory($outputDir);
        }

        $actualOutputs = $this->executeCommand(
            self::CAPCO_EXPORT_COLLECT_SELECTION_VOTES,
            array_values(self::OUTPUT_DIRECTORIES_STEP_TYPE)
        );

        $simplifiedFileNames = $this->getCompletedFileNames(self::SIMPLIFIED_SUFFIX, array_merge(...array_values(self::EXPECTED_FILE_NAMES)));

        $this->assertOutputs($actualOutputs, [
            self::EXPECTED_DIRECTORY . '/collect' => $simplifiedFileNames,
            self::EXPECTED_DIRECTORY . '/selection' => $simplifiedFileNames,
        ]);
    }

    /**
     * @param array<string, bool|string> $actualOutputs
     * @param array<string, string[]>    $expectedFiles
     */
    private function assertOutputs(array $actualOutputs, array $expectedFiles): void
    {
        foreach ($expectedFiles as $expectedDir => $files) {
            $finder = new Finder();
            $finder->files()->in($expectedDir)->name($files);

            foreach ($finder as $file) {
                $expectedFileName = $file->getRelativePathname();

                $isDirectory = $file->isDir();

                if (!$isDirectory) {
                    $this->assertArrayHasKey($expectedFileName, $actualOutputs);

                    $expectedOutput = file_get_contents($expectedDir . '/' . $expectedFileName);
                    $actualOutput = $actualOutputs[$expectedFileName];

                    $this->assertSame($expectedOutput, $actualOutput);
                }
            }
        }
    }
}
