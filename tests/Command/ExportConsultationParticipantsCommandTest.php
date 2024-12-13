<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportConsultationParticipantsCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports/consultation';
    public const EXPECTED_FILE_NAMES = [
        'participants_croissance-innovation-disruption_collecte-des-avis',
        'participants_project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement-etape-de-participation-continue',
        'participants_projet-avec-beaucoup-dopinions_consultation-step-in-project-with-many-opinions',
        'participants_projet-de-la-loi-renseignement_elaboration-de-la-loi',
        'participants_projet-pour-consolider-les-exports_etape-de-multi-consultation-export',
        'participants_qui-doit-conquerir-le-monde-visible-par-les-admins-seulement_consultation-step-in-private-project-admin-only',
        'participants_strategie-technologique-de-letat-et-services-publics_collecte-des-avis-pour-une-meilleur-strategie',
        'participants_strategie-technologique-de-letat-et-services-publics_etape-de-multi-consultation',
        'participants_transformation-numerique-des-relations_ma-futur-collecte-de-proposition',
        'participants_un-avenir-meilleur-pour-les-nains-de-jardins-custom-access_consultation-step-in-project-with-custom-access-group-2-3',
    ];

    public const FULL_SUFFIX = '.csv';
    public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export/consultation';
    public const CAPCO_EXPORT_CONSULTATION_PARTICIPANTS = 'capco:export:consultation:participants';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        $this->emptyOutputDirectory();

        $actualOutputs = $this->executeCommand(self::CAPCO_EXPORT_CONSULTATION_PARTICIPANTS);

        $completedFileNames = self::getCompletedFileNames(self::FULL_SUFFIX);
        $simplifiedFileNames = self::getCompletedFileNames(self::SIMPLIFIED_SUFFIX);

        $this->assertOutputs($actualOutputs, array_merge($simplifiedFileNames, $completedFileNames));
    }
}
