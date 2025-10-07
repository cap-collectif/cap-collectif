<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportDebateGroupedCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports/debate';
    public const EXPECTED_FILE_NAMES = [
        'contributions_debat-sur-le-cannabis_pour-ou-contre-la-legalisation-du-cannabis_grouped',
        'contributions_debat-du-mois_pour-ou-contre-le-reconfinement_grouped',
        'contributions_projet-avec-administrateur-de-projet_debat-admin-projet_grouped',
        'contributions_debat-wysiwyg_le-lait-avant-les-cereales_groupe',
    ];
    public const FULL_SUFFIX = '.csv';
    public const GROUPED_SUFFIX = '_grouped.csv';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export/debate';
    public const COMMAND = 'capco:export:debate-grouped';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        $this->emptyOutputDirectory();

        $actualOutputs = $this->executeCommand(self::COMMAND);

        $groupedFileNames = self::getCompletedFileNames(self::GROUPED_SUFFIX);

        $this->assertOutputs($actualOutputs, array_merge($groupedFileNames));
    }
}
