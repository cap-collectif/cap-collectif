<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportDebateVotesCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports/debate';
    public const EXPECTED_FILE_NAMES = [
        'votes_debat-du-mois_pour-ou-contre-le-reconfinement',
        'votes_debat-sur-le-cannabis_pour-ou-contre-la-legalisation-du-cannabis',
        'votes_debats-sur-la-vie_pourquoi-la-mort',
        'votes_debats-sur-la-vie_pourquoi-la-vie',
        'votes_projet-avec-administrateur-de-projet_debat-admin-projet',
    ];
    public const FULL_SUFFIX = '.csv';
    public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export/debate';
    public const COMMAND = 'capco:export:debate:votes';

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
}
