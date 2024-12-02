<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportDebateParticipantsCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    final public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports';
    final public const EXPECTED_FILE_NAMES = [
        'participants_debat-du-mois_pour-ou-contre-le-reconfinement',
        'participants_debat-sur-le-cannabis_pour-ou-contre-la-legalisation-du-cannabis',
        'participants_debat-wysiwyg_le-lait-avant-les-cereales',
        'participants_debats-sur-la-vie_pourquoi-la-mort',
        'participants_debats-sur-la-vie_pourquoi-la-vie',
        'participants_projet-avec-administrateur-de-projet_debat-admin-projet',
    ];
    final public const FULL_SUFFIX = '.csv';
    final public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    final public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export';
    final public const COMMAND = 'capco:export:debate:participants';

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

    public function testIfFileIsGeneratedIfUserWasUpdated(): void
    {
        [$commandTester, $options] = $this->executeFirstCommand(self::COMMAND);

        $this->updateUser('user42');

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('participants_projet-avec-administrateur-de-projet_debat-admin-projet_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('participants_projet-avec-administrateur-de-projet_debat-admin-projet.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetUserUpdatedAt('user42');
    }
}
