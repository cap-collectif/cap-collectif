<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Entity\ProposalSelectionVote;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

/**
 * @internal
 * @coversNothing
 */
class ExportSelectionParticipantsCommandTest extends KernelTestCase
{
    use CommandTestTrait;
    public const EXPECTED_DIRECTORY = __DIR__ . '/../../__snapshots__/exports/selection';
    public const EXPECTED_FILE_NAMES = [
        'participants_bp-avec-vote-classement_selection-avec-vote-classement-limite',
        'participants_budget-avec-vote-limite_selection-avec-vote-budget-limite',
        'participants_budget-participatif-idf-3_le-suivi-des-projets-laureats',
        'participants_budget-participatif-idf-3_vote-des-franciliens',
        'participants_budget-participatif-rennes_selection',
        'participants_budget-participatif-rennes_fermee',
        'participants_depot-avec-selection-vote-budget_selection-avec-vote-selon-le-budget',
        'participants_projet-pour-consolider-les-exports_selectionstepexport',
        'participants_questions-responses_selection-de-questions-avec-vote-classement-limite',
    ];
    public const FULL_SUFFIX = '.csv';
    public const SIMPLIFIED_SUFFIX = '_simplified.csv';
    public const OUTPUT_DIRECTORY = __DIR__ . '/../../public/export/selection';
    public const COMMAND = 'capco:export:selection:participants';

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

    public function testIfFileIsGeneratedWhenUserWasUpdated(): void
    {
        [$commandTester, $options] = $this->executeFirstCommand(self::COMMAND);

        $this->updateUser('user7');

        $code = $commandTester->execute($options);

        $this->assertStringContainsString('participants_budget-participatif-rennes_selection_simplified.csv', $commandTester->getDisplay());
        $this->assertStringContainsString('participants_budget-participatif-rennes_selection.csv', $commandTester->getDisplay());
        $this->assertSame(0, $code);

        $this->resetUserUpdatedAt('user7');
    }

//    public function testIfFileIsNotGeneratedWhenRandomUserWasUpdated(): void
//    {
//        [$commandTester, $options] = $this->executeFirstCommand(self::COMMAND);
//
//        $this->updateUser('adminCapco');
//
//        $code = $commandTester->execute($options);
//
//        $this->assertStringNotContainsString('participants_budget-participatif-rennes_selection_simplified.csv', $commandTester->getDisplay());
//        $this->assertStringNotContainsString('participants_budget-participatif-rennes_selection.csv', $commandTester->getDisplay());
//        $this->assertSame(0, $code);
//
//        $this->resetUserUpdatedAt('adminCapco');
//    }

//    public function testIfFileIsNotGeneratedWhenUserWasNotUpdated(): void
//    {
//        [$commandTester, $options] = $this->executeFirstCommand(self::COMMAND);
//
//        $code = $commandTester->execute($options);
//
//        $this->assertStringNotContainsString('participants_budget-participatif-rennes_selection_simplified.csv', $commandTester->getDisplay());
//        $this->assertStringNotContainsString('participants_budget-participatif-rennes_selection.csv', $commandTester->getDisplay());
//        $this->assertSame(0, $code);
//    }

//    public function testIfFileIsGeneratedWhenThereIsANewVote(): void
//    {
//        [$commandTester, $options] = $this->executeFirstCommand(self::COMMAND);
//
//        $this->addVote('user6', 'selectionstep8', 'proposal17');
//
//        $code = $commandTester->execute($options);
//
//        $this->assertStringContainsString('participants_budget-avec-vote-limite_selection-avec-vote-budget-limite_simplified.csv', $commandTester->getDisplay());
//        $this->assertStringContainsString('participants_budget-avec-vote-limite_selection-avec-vote-budget-limite.csv', $commandTester->getDisplay());
//        $this->assertSame(0, $code);
//
//        $this->deleteVote('user6', 'selectionstep8');
//    }

//    private function addVote(string $id, string $selectionStepId, string $proposalId): void
//    {
//        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
//        $user = $em->getRepository('CapcoUserBundle:User')->findOneBy(['id' => $id]);
//        $selectionStep = $em->getRepository('CapcoAppBundle:Steps\SelectionStep')->findOneBy(['id' => $selectionStepId]);
//        $proposal = $em->getRepository('CapcoAppBundle:Proposal')->findOneBy(['id' => $proposalId]);
//
//        $vote = new ProposalSelectionVote();
//        $vote->setUser($user);
//        $vote->setSelectionStep($selectionStep);
//        $vote->setProposal($proposal);
//
//        $em->persist($vote);
//        $em->flush();
//    }
//
//    private function deleteVote(string $id, string $selectionStepId): void
//    {
//        $em = self::$kernel->getContainer()->get('doctrine')->getManager();
//        $user = $em->getRepository('CapcoUserBundle:User')->findOneBy(['id' => $id]);
//        $vote = $em->getRepository('CapcoAppBundle:ProposalSelectionVote')->findOneBy(['user' => $user, 'selectionStep' => $selectionStepId]);
//
//        $em->remove($vote);
//        $em->flush();
//    }
}
