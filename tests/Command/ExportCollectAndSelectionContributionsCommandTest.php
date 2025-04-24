<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;
use Symfony\Component\Finder\Finder;

/**
 * @internal
 * @coversNothing
 */
class ExportCollectAndSelectionContributionsCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports';
    public const EXPECTED_FILE_NAMES = [
        'collect' => [
            'contributions_un-avenir-meilleur-pour-les-nains-de-jardins-custom-access_collecte-des-propositions-liberer-les-nains-de-jardin',
            'contributions_solidarite-covid-19_collecte-de-projets',
            'contributions_sauvons-nos-cafes_soutenons-nos-bistros-et-cafes-dans-cette-periode-difficile',
            'contributions_qui-doit-conquerir-le-monde-visible-par-les-admins-seulement_collecte-des-propositions-pour-conquerir-le-monde',
            'contributions_questions-responses_collecte-des-questions-chez-youpie',
            'contributions_projet-pour-consolider-les-exports_etape-de-depot-des-exports',
            'contributions_projet-condition-requise-sms_budget-participatif-du-projet-avec-condition-requise-sms',
            'contributions_projet-avec-beaucoup-dopinions_collecte-des-propositions-avec-questions-qui-va-etre-jetee',
            'contributions_projet-avec-administrateur-de-projet_budget-participatif-du-projet-avec-administrateur-de-projet',
            'contributions_project-pour-la-force-visible-par-mauriau-seulement_collecte-des-propositions-pour-la-force',
            'contributions_project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement_collecte-des-propositions-pour-la-capcobeer',
            'contributions_project-analyse_collecte-des-propositions-pour-analyse',
            'contributions_depot-avec-selection-vote-simple_depot-ferme',
            'contributions_depot-avec-selection-vote-budget_collecte-des-propositions-1',
            'contributions_budget-participatif-rennes_collecte-des-propositions',
            'contributions_budget-participatif-rennes_collecte-des-propositions-privee',
            'contributions_budget-participatif-rennes_collecte-des-propositions-fermee',
            'contributions_budget-participatif-rennes_collecte-des-propositions-avec-questions',
            'contributions_budget-participatif-idf_collecte-des-projets-idf-privee',
            'contributions_budget-participatif-idf-3_etape-fermee-mais-on-peut-modifier-les-reseaux-sociaux-des-propositions',
            'contributions_budget-participatif-idf-3_collecte-vote-par-sms',
            'contributions_budget-participatif-idf-3_collecte-des-projets-idf-brp-3',
            'contributions_budget-participatif-dorganisation_collecte-des-propositions-privee',
            'contributions_budget-avec-vote-limite_collecte-avec-vote-simple-limite-1',
            'contributions_bp-avec-vote-classement_collecte-avec-vote-classement-limite',
            'contributions_bp-avec-archivage-des-propositions_collecte-des-propositions-avec-archivage',
            'contributions_appel-a-projets_collecte-des-propositions-avec-vote-simple',
            'contributions_budget-participatif-rennes_depot-avec-vote',
        ],
        'selection' => [
            'contributions_questions-responses_selection-de-questions-avec-vote-classement-limite',
            'contributions_projet-pour-consolider-les-exports_selectionstepexport',
            'contributions_depot-avec-selection-vote-simple_selection-avec-vote-simple',
            'contributions_depot-avec-selection-vote-budget_selection-avec-vote-selon-le-budget',
            'contributions_budget-participatif-rennes_selection',
            'contributions_budget-participatif-rennes_selection-a-venir',
            'contributions_budget-participatif-rennes_fermee',
            'contributions_budget-participatif-idf_etudes-des-projets',
            'contributions_budget-participatif-idf-3_vote-des-franciliens',
            'contributions_budget-participatif-idf-3_le-suivi-des-projets-laureats',
            'contributions_budget-avec-vote-limite_selection-avec-vote-budget-limite',
            'contributions_bp-avec-vote-classement_selection-avec-vote-classement-limite',
            'contributions_budget-participatif-rennes_vainqueur',
        ],
    ];
    public const FULL_SUFFIX = '.csv';
    public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export';
    public const OUTPUT_DIRECTORIES_STEP_TYPE = [
        'collect' => self::OUTPUT_DIRECTORY . '/collect',
        'selection' => self::OUTPUT_DIRECTORY . '/selection',
    ];
    public const CAPCO_EXPORT_COLLECT_SELECTION_CONTRIBUTIONS = 'capco:export:collect-selection:contributions';

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
            self::CAPCO_EXPORT_COLLECT_SELECTION_CONTRIBUTIONS,
            array_values(self::OUTPUT_DIRECTORIES_STEP_TYPE)
        );

        $completedFileNames = $this->getCompletedFileNames(self::FULL_SUFFIX, array_merge(...array_values(self::EXPECTED_FILE_NAMES)));
        $simplifiedFileNames = $this->getCompletedFileNames(self::SIMPLIFIED_SUFFIX, array_merge(...array_values(self::EXPECTED_FILE_NAMES)));

        $this->assertOutputs($actualOutputs, [
            self::EXPECTED_DIRECTORY . '/collect' => $completedFileNames,
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
