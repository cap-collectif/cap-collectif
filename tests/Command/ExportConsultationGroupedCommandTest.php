<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportConsultationGroupedCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports/consultation';
    public const EXPECTED_FILE_NAMES = [
        'contributions_croissance-innovation-disruption_collecte-des-avis',
        'contributions_strategie-technologique-de-letat-et-services-publics_collecte-des-avis-pour-une-meilleur-strategie',
        'contributions_transformation-numerique-des-relations_ma-futur-collecte-de-proposition',
        'contributions_project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement_etape-participation-continue',
        'contributions_qui-doit-conquerir-le-monde-visible-par-les-admins-seulement_consultation-step-in-private-project-admin-only',
        'contributions_un-avenir-meilleur-pour-les-nains-de-jardins-custom-access_consultation-step-in-project-with-custom-access-group-2-3',
        'contributions_strategie-technologique-de-letat-et-services-publics_etape-de-multi-consultation',
        'contributions_projet-pour-consolider-les-exports_etape-de-multi-consultation-export',
    ];

    public const GROUPED_SUFFIX = '_grouped.csv';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export/consultation';
    public const CAPCO_EXPORT_CONSULTATION_GROUPED = 'capco:export:consultation:grouped';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        $this->emptyOutputDirectory();

        $actualOutputs = $this->executeCommand(self::CAPCO_EXPORT_CONSULTATION_GROUPED);

        $groupedFileNames = self::getCompletedFileNames(self::GROUPED_SUFFIX);

        $this->assertOutputs($actualOutputs, $groupedFileNames);
    }
}
