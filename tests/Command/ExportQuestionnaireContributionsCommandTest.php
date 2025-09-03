<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportQuestionnaireContributionsCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports/questionnaire';
    public const EXPECTED_FILE_NAMES = [
        'contributions_projet-avec-questionnaire_questionnaire-des-jo-2024',
        'contributions_projet-avec-questionnaire_questionnaire',
        'contributions_projet-avec-questionnaire-anonyme_questionnaire-step-anonymous',
        'contributions_projet-avec-questionnaire_etape-de-questionnaire-fermee',
        'contributions_projet-pour-consolider-les-exports_questionnaire-export',
        'contributions_projet-avec-administrateur-de-projet_questionnaire-step-anonymous-project-owner',
    ];
    final public const FULL_SUFFIX = '.csv';
    final public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    final public const GROUPED_SUFFIX = '_grouped.csv';
    final public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export/questionnaire';
    final public const CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS = 'capco:export:questionnaire:contributions';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        $this->emptyOutputDirectory();

        $actualOutputs = $this->executeCommand(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS);

        $completedFileNames = self::getCompletedFileNames(self::FULL_SUFFIX);
        $simplifiedFileNames = self::getCompletedFileNames(self::SIMPLIFIED_SUFFIX);
        $groupedFileNames = self::getCompletedFileNames(self::GROUPED_SUFFIX);

        $this->assertOutputs($actualOutputs, array_merge($simplifiedFileNames, $completedFileNames, $groupedFileNames));
    }

    public function testIfUpdateUserFileGenerated(): void
    {
        [$commandTester, $options] = $this->executeFirstCommand(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS);

        $this->updateUser('user6');

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('contributions_projet-avec-questionnaire_questionnaire-des-jo-2024_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('contributions_projet-avec-questionnaire_questionnaire-des-jo-2024.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetUserUpdatedAt('user6');
    }

    public function testIfReplyUpdateFileGenerated(): void
    {
        [$commandTester, $options] = $this->executeFirstCommand(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS);

        $this->updateReply();

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('contributions_projet-avec-questionnaire_questionnaire-des-jo-2024_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('contributions_projet-avec-questionnaire_questionnaire-des-jo-2024.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetReply();
    }

    public function testIfReplyAnonymousUpdateFileGenerated(): void
    {
        [$commandTester, $options] = $this->executeFirstCommand(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS);

        $this->updateAnonymousReply();

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('contributions_projet-avec-questionnaire-anonyme_questionnaire-step-anonymous_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('contributions_projet-avec-questionnaire-anonyme_questionnaire-step-anonymous.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetAnonymousReply();
    }

    private function updateUser(string $id): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $user = $em->getRepository('CapcoUserBundle:User')->findOneBy(['id' => $id]);
        $user->setUpdatedAt(new \DateTime('+ 1 day'));
        $em->persist($user);
        $em->flush();
    }

    private function updateReply(): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $reply = $em->getRepository('CapcoAppBundle:Reply')->findOneBy(['id' => 'replyMajority7']);
        $reply->setUpdatedAt(new \DateTime('+ 1 day'));
        $em->persist($reply);
        $em->flush();
    }

    private function resetReply(): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $reply = $em->getRepository('CapcoAppBundle:Reply')->findOneBy(['id' => 'replyMajority7']);
        $reply->setUpdatedAt(new \DateTime('2016-03-02 00:00:00'));
        $em->persist($reply);
        $em->flush();
    }

    private function updateAnonymousReply(): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $reply = $em->getRepository('CapcoAppBundle:Reply')->findOneBy(['id' => 'replyAnonymous1']);
        $reply->setUpdatedAt(new \DateTime('+ 1 day'));
        $em->persist($reply);
        $em->flush();
    }

    private function resetAnonymousReply(): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $reply = $em->getRepository('CapcoAppBundle:Reply')->findOneBy(['id' => 'replyAnonymous1']);
        $reply->setUpdatedAt(new \DateTime('2016-03-01 00:00:00'));
        $em->persist($reply);
        $em->flush();
    }
}
