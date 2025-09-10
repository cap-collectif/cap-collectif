<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Entity\ProposalCollectVote;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportCollectParticipantsCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    final public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports/collect';
    final public const EXPECTED_FILE_NAMES = [
        'participants_bp-avec-vote-classement_collecte-avec-vote-classement-limite',
        'participants_appel-a-projets_collecte-des-propositions-avec-vote-simple',
        'participants_questions-responses_collecte-des-questions-chez-youpie',
        'participants_budget-participatif-idf-3_collecte-vote-par-sms',
        'participants_projet-pour-consolider-les-exports_etape-de-depot-des-exports',
    ];
    final public const FULL_SUFFIX = '.csv';
    final public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    final public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export/collect';
    final public const COMMAND = 'capco:export:collect:participants';

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

    public function testIfFileIsGeneratedIfAUserWasUpdated(): void
    {
        [$commandTester, $options] = $this->executeFirstCommand(self::COMMAND);

        $this->updateUser('user1');

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('participants_bp-avec-vote-classement_collecte-avec-vote-classement-limite_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('participants_bp-avec-vote-classement_collecte-avec-vote-classement-limite.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetUserUpdatedAt('user1');
    }

//    public function testIfFileIsNotGeneratedIfRandomUserWasUpdated(): void
//    {
//        [$commandTester, $options] = $this->executeFirstCommand(self::COMMAND);
//
//        $this->updateUser('user6');
//
//        $code = $commandTester->execute($options);
//
//        $this->assertStringNotContainsString('participants_bp-avec-vote-classement_collecte-avec-vote-classement-limite_simplified.csv', $commandTester->getDisplay());
//        $this->assertStringNotContainsString('participants_bp-avec-vote-classement_collecte-avec-vote-classement-limite.csv', $commandTester->getDisplay());
//        $this->assertSame(0, $code);
//
//        $this->resetUserUpdatedAt('user6');
//    }

//    public function testIfFileIsNotGeneratedIfUserWasNotUpdated(): void
//    {
//        [$commandTester, $options] = $this->executeFirstCommand(self::COMMAND);
//
//        $code = $commandTester->execute($options);
//
//        $this->assertStringNotContainsString('participants_bp-avec-vote-classement_collecte-avec-vote-classement-limite.csv', $commandTester->getDisplay());
//        $this->assertStringNotContainsString('participants_bp-avec-vote-classement_collecte-avec-vote-classement-limite.csv', $commandTester->getDisplay());
//        $this->assertSame(0, $code);
//    }

    public function testIfFileIsGeneratedIfThereIsANewVote(): void
    {
        [$commandTester, $options] = $this->executeFirstCommand(self::COMMAND);

        $this->addVote('user1', 'collectQuestionVoteAvecClassement', 'proposal18');

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('collecte-avec-vote-simple-limite-1_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('collecte-avec-vote-simple-limite-1', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->deleteVote('user1', 'collectQuestionVoteAvecClassement');
    }

    private function addVote(string $id, string $collectStepId, string $proposalId): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $user = $em->getRepository('CapcoUserBundle:User')->findOneBy(['id' => $id]);
        $collectStep = $em->getRepository('CapcoAppBundle:Steps\CollectStep')->findOneBy(['id' => $collectStepId]);
        $proposal = $em->getRepository('CapcoAppBundle:Proposal')->findOneBy(['id' => $proposalId]);

        $vote = new ProposalCollectVote();
        $vote->setUser($user);
        $vote->setCollectStep($collectStep);
        $vote->setProposal($proposal);
        $vote->setCreatedAt(new \DateTime('+ 1 day'));
        $vote->setIsAccounted(true);

        $em->persist($vote);
        $em->flush();
    }

    private function deleteVote(string $id, string $collectStepId): void
    {
        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
        $user = $em->getRepository('CapcoUserBundle:User')->findOneBy(['id' => $id]);
        $vote = $em->getRepository('CapcoAppBundle:ProposalCollectVote')->findOneBy(['user' => $user, 'collectStep' => $collectStepId]);

        $em->remove($vote);
        $em->flush();
    }
}
