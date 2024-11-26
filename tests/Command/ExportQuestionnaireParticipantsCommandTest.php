<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportQuestionnaireParticipantsCommandTest extends KernelTestCase
{
    use CommandTestTrait;

    final public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports';
    final public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export';
    final public const EXPECTED_FILE_NAMES = [
        'participants_projet-avec-questionnaire_questionnaire-des-jo-2024',
        'participants_projet-avec-questionnaire_questionnaire',
        'participants_projet-avec-questionnaire_etape-de-questionnaire-fermee',
        'participants_qui-doit-conquerir-le-monde-visible-par-les-admins-seulement_questionnaire-step-pour-admins',
        'participants_projet-avec-questionnaire-anonyme_questionnaire-step-anonymous',
        'participants_projet-pour-consolider-les-exports_questionnaire-export',
        'participants_projet-pour-le-group2_questionnaire-step-pour-group2',
        'participants_projet-avec-administrateur-de-projet_questionnaire-step-anonymous-project-owner',
    ];
    final public const FULL_SUFFIX = '.csv';
    final public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    final public const COMMAND = 'capco:export:questionnaire:participants';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        $this->emptyOutputDirectory();

        $actualOutputs = $this->executeCommand(self::COMMAND);

        $completedFileNames = $this->getCompletedFileNames(self::FULL_SUFFIX);
        $simplifiedFileNames = $this->getCompletedFileNames(self::SIMPLIFIED_SUFFIX);

        $this->assertOutputs($actualOutputs, array_merge($simplifiedFileNames, $completedFileNames));
    }

    public function testIfFileIsGeneratedIfUserWasUpdated(): void
    {
        list($commandTester, $options) = $this->executeFirstCommand(self::COMMAND);

        $this->updateUser('user6');

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('participants_projet-avec-questionnaire_questionnaire-des-jo-2024_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('participants_projet-avec-questionnaire_questionnaire-des-jo-2024.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetUserUpdatedAt('user6');
    }

    public function testIfFileIsGeneratedIfReplyWasUpdated(): void
    {
        list($commandTester, $options) = $this->executeFirstCommand(self::COMMAND);

        $this->updateReply();

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('participants_projet-avec-questionnaire_questionnaire-des-jo-2024_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('participants_projet-avec-questionnaire_questionnaire-des-jo-2024.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetReply();
    }

    public function testIfFileIsGeneratedIfAnonymousReplyWasUpdated(): void
    {
        list($commandTester, $options) = $this->executeFirstCommand(self::COMMAND);

        $this->updateAnonymousReply();

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('participants_projet-avec-questionnaire-anonyme_questionnaire-step-anonymous_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('participants_projet-avec-questionnaire-anonyme_questionnaire-step-anonymous.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetAnonymousReply();
    }

    private function updateReply(): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $reply = $em->getRepository('CapcoAppBundle:Reply')->findOneBy(['id' => 'reply1']);
        $reply->setUpdatedAt(new \DateTime('+ 1 day'));
        $em->persist($reply);
        $em->flush();
    }

    private function resetReply(): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $reply = $em->getRepository('CapcoAppBundle:Reply')->findOneBy(['id' => 'reply1']);
        $reply->setUpdatedAt(new \DateTime('2016-03-01 00:00:00'));
        $em->persist($reply);
        $em->flush();
    }

    private function updateAnonymousReply(): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $reply = $em->getRepository('CapcoAppBundle:ReplyAnonymous')->findOneBy(['id' => 'replyAnonymous1']);
        $reply->setUpdatedAt(new \DateTime('+ 1 day'));
        $em->persist($reply);
        $em->flush();
    }

    private function resetAnonymousReply(): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $reply = $em->getRepository('CapcoAppBundle:ReplyAnonymous')->findOneBy(['id' => 'replyAnonymous1']);
        $reply->setUpdatedAt(new \DateTime('2016-03-01 00:00:00'));
        $em->persist($reply);
        $em->flush();
    }
}
