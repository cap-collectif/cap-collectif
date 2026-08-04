<?php

namespace Capco\Tests\Command;

/**
 * @internal
 * @coversNothing
 */
class GenerateCSVFromProposalFormCommandTest extends DatabaseCommandTestCase
{
    /**
     * @dataProvider proposalFormModels
     */
    public function testGenerateCsvModelMatchesSnapshot(
        string $proposalFormId,
        string $expectedFilename
    ): void {
        $generatedPath = sys_get_temp_dir() . '/' . $expectedFilename;
        $snapshotPath = __DIR__ . '/../../__snapshots__/imports/' . $expectedFilename;
        $commandTester = $this->createCommandTester(
            'capco:import-proposals:generate-header-csv'
        );

        try {
            $commandTester->execute([
                'proposal-form' => $proposalFormId,
                '--delimiter' => ',',
            ]);

            self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
            self::assertFileExists($generatedPath);
            self::assertFileEquals($snapshotPath, $generatedPath);
        } finally {
            if (file_exists($generatedPath)) {
                unlink($generatedPath);
            }
        }
    }

    /**
     * @return iterable<string, array{string, string}>
     */
    public function proposalFormModels(): iterable
    {
        yield 'IDF proposal form' => [
            'proposalformIdfBP3',
            'Budget_Participatif_IdF_3-Collecte_des_projets_Idf_BRP_3_vierge.csv',
        ];
        yield 'Rennes proposal form' => [
            'proposalForm1',
            'Budget_Participatif_Rennes-Collecte_des_propositions_vierge.csv',
        ];
        yield 'Cafetier proposal form' => [
            'proposalformCafetier',
            'Sauvons_nos_cafes-Soutenons_nos_bistros_et_cafes_dans_cette_periode_difficile_vierge.csv',
        ];
    }
}
