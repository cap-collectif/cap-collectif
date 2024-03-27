<?php

namespace Capco\Tests\Command;

use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class ExportQuestionnaireContributionsCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports';
    public const EXPECTED_FILE_NAMES = [
        'consultation-pour-conquerir-le-monde',
        'consultation-pour-la-capcobeer',
        'consultation-pour-la-flnj',
        'projet-avec-questionnaire_essais-de-sauts-conditionnels',
        'projet-avec-questionnaire_etape-de-questionnaire-avec-questionnaire-sauts-conditionnels',
        'projet-avec-questionnaire_etape-de-questionnaire-fermee',
        'projet-avec-questionnaire_questionnaire-des-jo-2024',
        'projet-avec-questionnaire_questionnaire',
        'projet-pour-le-group2_questionnaire-step-pour-group2',
        'questionnaire-non-rattache',
        'questionnaire-pour-budget-participatif-de-la-force',
        'questionnaire-pour-budget-participatif-disponible',
        'questionnaire-pour-budget-participatif',
        'qui-doit-conquerir-le-monde-visible-par-les-admins-seulement_questionnaire-step-pour-admins',
    ];
    public const FULL_SUFFIX = '.csv';
    public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export';
    public const CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS = 'capco:export:questionnaire:contributions';

    protected function setUp(): void
    {
        self::bootKernel();
    }

    public function testCommand(): void
    {
        $this->emptyOutputDirectory();

        $actualOutputs = $this->executeCommand(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS);

        $completedFileNames = $this->getCompletedFileNames(self::FULL_SUFFIX);
        $simplifiedFileNames = $this->getCompletedFileNames(self::SIMPLIFIED_SUFFIX);

        $this->assertOutputs($actualOutputs, array_merge($simplifiedFileNames, $completedFileNames));
    }

    public function testIfNoUpdateNoFileGenerated(): void
    {
        list($commandTester, $options) = $this->setUpCommandTester(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS);

        $commandTester->execute($options);

        $actualOutputs = $commandTester->execute($options);

        $this->assertStringContainsString('No file has been updated.', $commandTester->getDisplay());
        $this->assertSame(0, $actualOutputs);
    }

    public function testIfUpdateUserFileGenerated(): void
    {
        list($commandTester, $options) = $this->executeFirstCommand(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS);

        $this->updateUser('user6');

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('projet-avec-questionnaire_questionnaire-des-jo-2024_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('projet-avec-questionnaire_questionnaire-des-jo-2024.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetUserUpdatedAt('user6');
    }

    public function testIfReplyUpdateFileGenerated(): void
    {
        list($commandTester, $options) = $this->executeFirstCommand(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS);

        $this->updateReply();

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('projet-avec-questionnaire_questionnaire-des-jo-2024_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('projet-avec-questionnaire_questionnaire-des-jo-2024.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetReply();
    }

    public function testIfReplyAnonymousUpdateFileGenerated(): void
    {
        list($commandTester, $options) = $this->executeFirstCommand(self::CAPCO_EXPORT_QUESTIONNAIRE_CONTRIBUTIONS);

        $this->updateAnonymousReply();

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('projet-avec-questionnaire-anonyme_questionnaire-step-anonymous_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('projet-avec-questionnaire-anonyme_questionnaire-step-anonymous.csv', $commandTester->getDisplay());
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
