<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportDebateContributionsCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports';
    public const EXPECTED_FILE_NAMES = [
        'contributions_debat-du-mois_pour-ou-contre-le-reconfinement',
        'contributions_debat-sur-le-cannabis_pour-ou-contre-la-legalisation-du-cannabis',
        'contributions_debat-wysiwyg_le-lait-avant-les-cereales',
        'contributions_projet-avec-administrateur-de-projet_debat-admin-projet',
    ];
    public const FULL_SUFFIX = '.csv';
    public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export';
    public const COMMAND = 'capco:export:debate:contributions';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        $this->emptyOutputDirectory();

        $actualOutputs = $this->executeCommand(self::COMMAND);

        $fullFileNames = $this->getCompletedFileNames(self::FULL_SUFFIX);
        $simplifiedFileNames = $this->getCompletedFileNames(self::SIMPLIFIED_SUFFIX);

        $this->assertOutputs($actualOutputs, array_merge($simplifiedFileNames, $fullFileNames));
    }
}
