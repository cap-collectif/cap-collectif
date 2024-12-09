<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportConsultationContributionsCommandTest extends KernelTestCase
{
    use CommandTestTrait;

    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports';
    public const EXPECTED_FILE_NAMES = [
        'contributions_croissance-innovation-disruption_collecte-des-avis',
        'contributions_project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement_etape-participation-continue',
        'contributions_projet-avec-beaucoup-dopinions_consultation-step-in-project-with-many-opinions',
        'contributions_projet-de-loi-renseignement_elaboration-de-la-loi',
        'contributions_projet-pour-consolider-les-exports_etape-de-multi-consultation-export',
        'contributions_qui-doit-conquerir-le-monde-visible-par-les-admins-seulement_consultation-step-in-private-project-admin-only',
        'contributions_strategie-technologique-de-letat-et-services-publics_collecte-des-avis-pour-une-meilleur-strategie',
        'contributions_strategie-technologique-de-letat-et-services-publics_etape-de-multi-consultation',
        'contributions_transformation-numerique-des-relations_ma-futur-collecte-de-proposition',
        'contributions_un-avenir-meilleur-pour-les-nains-de-jardins-custom-access_consultation-step-in-project-with-custom-access-group-2-3',
    ];
    public const FULL_SUFFIX = '.csv';
    public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export';
    public const CAPCO_EXPORT_CONSULTATION_CONTRIBUTIONS = 'capco:export:consultation:contributions';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        $actualOutputs = $this->executeCommand(self::CAPCO_EXPORT_CONSULTATION_CONTRIBUTIONS);

        $completedFileNames = $this->getCompletedFileNames(self::FULL_SUFFIX);
        $simplifiedFileNames = $this->getCompletedFileNames(self::SIMPLIFIED_SUFFIX);

        $this->assertOutputs($actualOutputs, array_merge($simplifiedFileNames, $completedFileNames));
    }
}
