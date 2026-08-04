<?php

namespace Capco\Tests\Command;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\UserBundle\Entity\User;

/**
 * @internal
 * @coversNothing
 */
class ImportCommandsTest extends DatabaseCommandTestCase
{
    public function testImportConsultationCreatesTheExpectedDomainObjects(): void
    {
        $csv = <<<'CSV'
            titre;type;contenu;titre_consultation;description_section;titre_projet;titre_etape
            Command test opinion;Titre Ier|Chapitre Ier|Section 1;Contenu avec des accents et une apostrophe d'import;Command test consultation;Command test section;Command test project;Command test step
            CSV;
        $inputPath = $this->writeTemporaryFile('opinions.csv', $csv);
        $commandTester = $this->createCommandTester('capco:import:consultation-from-csv');

        $commandTester->execute([
            'filePath' => $inputPath,
            'user' => 'admin@test.com',
            'step' => 'elaboration-de-la-loi',
            '--delimiter' => ';',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            '1 opinions successfully created.',
            $commandTester->getDisplay()
        );

        $this->entityManager->clear();
        $opinion = $this->entityManager
            ->getRepository(Opinion::class)
            ->findOneBy(['title' => 'Command test opinion'])
        ;

        self::assertInstanceOf(Opinion::class, $opinion);
        self::assertSame(
            "Contenu avec des accents et une apostrophe d'import",
            $opinion->getBody()
        );
        self::assertSame('admin@test.com', $opinion->getAuthor()?->getEmail());
        self::assertSame('Command test consultation', $opinion->getConsultation()?->getTitle());
        self::assertSame('Command test step', $opinion->getStep()?->getTitle());
        self::assertSame('Command test project', $opinion->getProject()?->getTitle());
        self::assertSame('Section 1', $opinion->getOpinionType()?->getTitle());
    }

    public function testImportProposalsReusesOneGeneratedAuthorForMatchingUsernames(): void
    {
        $csv = <<<'CSV'
            name;author;district_name;address;collect_status;estimation;category;summary;body;"Evaluez l'importance de votre proposition";"Evaluez le coût de votre proposition"
            Command test proposal 1;aurelien@cap-collectif.com;Nord Saint-Martin;;Rejeté;200;Politique;Summary 1;Body 1;très important;gratuit
            Command test proposal 2;Command Test Author;Nord Saint-Martin;;Rejeté;200;Politique;Summary 2;Body 2;nulle;pas chère
            Command test proposal 3;Command Test Author;Nord Saint-Martin;;Rejeté;200;Politique;Summary 3;Body 3;nulle;pas chère
            CSV;
        $inputPath = $this->writeTemporaryFile('proposals.csv', $csv);
        $commandTester = $this->createCommandTester('capco:import:proposals-from-csv');

        $commandTester->execute([
            'filePath' => $inputPath,
            'proposal-form' => 'proposalForm1',
            '--delimiter' => ';',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            'Creating a new user with a fake email and username: Command Test Author',
            $commandTester->getDisplay()
        );

        $this->entityManager->clear();
        $proposalRepository = $this->entityManager->getRepository(Proposal::class);
        $firstProposal = $proposalRepository->findOneBy(['title' => 'Command test proposal 1']);
        $secondProposal = $proposalRepository->findOneBy(['title' => 'Command test proposal 2']);
        $thirdProposal = $proposalRepository->findOneBy(['title' => 'Command test proposal 3']);

        self::assertInstanceOf(Proposal::class, $firstProposal);
        self::assertInstanceOf(Proposal::class, $secondProposal);
        self::assertInstanceOf(Proposal::class, $thirdProposal);
        self::assertSame('aurelien@cap-collectif.com', $firstProposal->getAuthor()?->getEmail());
        self::assertSame('Body 1', $firstProposal->getBody());
        self::assertSame('proposalForm1', $firstProposal->getProposalForm()->getId());
        $secondAuthor = $secondProposal->getAuthor();
        $thirdAuthor = $thirdProposal->getAuthor();
        self::assertNotNull($secondAuthor);
        self::assertNotNull($thirdAuthor);
        self::assertSame('Command Test Author', $secondAuthor->getUsername());
        self::assertSame($secondAuthor->getId(), $thirdAuthor->getId());
    }

    public function testCreateUserAccountsImportsCustomFieldsAndSkipsDuplicates(): void
    {
        $csv = <<<'CSV'
            email;username;Champ pas facultatif;Champ facultatif;Sangohan / Vegeta ?
            command-custom-a@cap-collectif.test;Jean Command;toto;tata;Sangohan
            command-custom-b@cap-collectif.test;Paul Command;popo;popaul;Vegeta
            command-duplicate@cap-collectif.test;Duplicate;Duplicate;Duplicate;Vegeta
            command-duplicate@cap-collectif.test;Duplicate;Duplicate;Duplicate;Vegeta
            admin@cap-collectif.com;Already Present;Already Present;Already Present;Vegeta
            CSV;
        $inputPath = $this->writeTemporaryFile('users.csv', $csv);
        $outputPath = $this->temporaryFilePath('users-created.csv');
        $commandTester = $this->createCommandTester('capco:create-users-account-from-csv');

        $commandTester->execute([
            'input' => $inputPath,
            'output' => $outputPath,
            '--with-custom-fields' => true,
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            'Skipping 1 duplicated email(s).',
            $commandTester->getDisplay()
        );
        self::assertStringContainsString(
            'Skipping existing user: admin@cap-collectif.com',
            $commandTester->getDisplay()
        );
        self::assertStringContainsString('3 users created.', $commandTester->getDisplay());
        self::assertFileExists($outputPath);
        self::assertStringStartsWith('email;confirmation_link', (string) file_get_contents($outputPath));

        $this->entityManager->clear();
        $userRepository = $this->entityManager->getRepository(User::class);
        $firstUser = $userRepository->findOneBy(['email' => 'command-custom-a@cap-collectif.test']);
        $secondUser = $userRepository->findOneBy(['email' => 'command-custom-b@cap-collectif.test']);
        $duplicateUser = $userRepository->findOneBy([
            'email' => 'command-duplicate@cap-collectif.test',
        ]);

        self::assertInstanceOf(User::class, $firstUser);
        self::assertInstanceOf(User::class, $secondUser);
        self::assertInstanceOf(User::class, $duplicateUser);
        $this->assertUserResponse($firstUser, 6, 'toto');
        $this->assertUserResponse($firstUser, 7, 'tata');
        $this->assertUserResponse($firstUser, 17, 'Sangohan');
        $this->assertUserResponse($secondUser, 6, 'popo');
        $this->assertUserResponse($secondUser, 7, 'popaul');
        $this->assertUserResponse($secondUser, 17, 'Vegeta');
    }

    public function testCreateUserAccountsGeneratesEmailsAndPasswords(): void
    {
        $csv = <<<'CSV'
            first_name;last_name
            Johnny;Yadlidée Command
            Jean-Michel;Palaref Command
            CSV;
        $inputPath = $this->writeTemporaryFile('users.csv', $csv);
        $outputPath = $this->temporaryFilePath('users-created.csv');
        $commandTester = $this->createCommandTester('capco:create-users-account-from-csv');

        $commandTester->execute([
            'input' => $inputPath,
            'output' => $outputPath,
            '--with-password' => true,
            '--generate-email' => 'cap-collectif.test',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString('2 users created.', $commandTester->getDisplay());
        self::assertFileExists($outputPath);
        self::assertStringStartsWith(
            'first_name;last_name;email;password',
            (string) file_get_contents($outputPath)
        );

        $this->entityManager->clear();
        $userRepository = $this->entityManager->getRepository(User::class);
        $firstUser = $userRepository->findOneBy([
            'email' => 'johnny-yadlidee-command@cap-collectif.test',
        ]);
        $secondUser = $userRepository->findOneBy([
            'email' => 'jean-michel-palaref-command@cap-collectif.test',
        ]);

        self::assertInstanceOf(User::class, $firstUser);
        self::assertInstanceOf(User::class, $secondUser);
        self::assertSame('Johnny Yadlidée Command', $firstUser->getUsername());
        self::assertSame('Jean-Michel Palaref Command', $secondUser->getUsername());
        self::assertNotEmpty($firstUser->getPassword());
        self::assertNotEmpty($secondUser->getPassword());
    }

    public function testImportUsersPersistsEveryValidRow(): void
    {
        $csv = <<<'CSV'
            username;email;password
            command-john;command-user-a@test.com;test
            command-mcfly;command-user-b@test.com;carlito
            CSV;
        $inputPath = $this->writeTemporaryFile('users.csv', $csv);
        $commandTester = $this->createCommandTester('capco:import:users');

        $commandTester->execute([
            'filePath' => $inputPath,
            '--delimiter' => ';',
        ]);

        self::assertSame(0, $commandTester->getStatusCode(), $commandTester->getDisplay());
        self::assertStringContainsString(
            '2 users successfully created.',
            $commandTester->getDisplay()
        );

        $this->entityManager->clear();
        $userRepository = $this->entityManager->getRepository(User::class);
        $firstUser = $userRepository->findOneBy(['email' => 'command-user-a@test.com']);
        $secondUser = $userRepository->findOneBy(['email' => 'command-user-b@test.com']);

        self::assertInstanceOf(User::class, $firstUser);
        self::assertInstanceOf(User::class, $secondUser);
        self::assertSame('command-john', $firstUser->getUsername());
        self::assertSame('command-mcfly', $secondUser->getUsername());
        self::assertTrue($firstUser->isEnabled());
        self::assertTrue($secondUser->isEnabled());
    }

    public function testImportIdfUsersPersistsValidRowsAndReportsInvalidRows(): void
    {
        $csv = <<<'CSV'
            "username";"email";"openid_id"
            "command-toto";"command-toto@test.com";"command-openid-toto"
            "command-titi";"command-titi@test.com";"command-openid-titi"
            "command-tata";"command-tata@test.com";"command-openid-tata"
            "command-titi";"command-titi@test.com";"command-openid-titi"
            "admin";"admin@test.com";"command-openid-admin"
            "";;
            CSV;
        $inputPath = $this->writeTemporaryFile('idf-users.csv', $csv);
        $commandTester = $this->createCommandTester('capco:import:idf-users');

        $commandTester->execute([
            'filePath' => $inputPath,
            '--delimiter' => ';',
        ]);

        $display = $commandTester->getDisplay();
        self::assertSame(0, $commandTester->getStatusCode(), $display);
        self::assertStringContainsString('3 users successfully created.', $display);
        self::assertStringContainsString('3 lines with errors', $display);
        self::assertStringContainsString(
            'On line 4 : email command-titi@test.com is already used, opendId id command-openid-titi is already used',
            $display
        );
        self::assertStringContainsString('On line 5 : email admin@test.com is already used', $display);
        self::assertStringContainsString('On line 6 : missing email, missing openId id', $display);

        $this->entityManager->clear();
        $userRepository = $this->entityManager->getRepository(User::class);
        $toto = $userRepository->findOneBy(['email' => 'command-toto@test.com']);
        $titi = $userRepository->findOneBy(['email' => 'command-titi@test.com']);
        $tata = $userRepository->findOneBy(['email' => 'command-tata@test.com']);

        self::assertInstanceOf(User::class, $toto);
        self::assertInstanceOf(User::class, $titi);
        self::assertInstanceOf(User::class, $tata);
        self::assertSame('command-openid-toto', $toto->getOpenId());
        self::assertSame('command-openid-titi', $titi->getOpenId());
        self::assertSame('command-openid-tata', $tata->getOpenId());
    }

    public function testImportIdfProposalsPersistsOnlyImportableRows(): void
    {
        $proposalFormRepository = $this->entityManager->getRepository(ProposalForm::class);
        $proposalRepository = $this->entityManager->getRepository(Proposal::class);
        $proposalForm = $proposalFormRepository->find('proposalformIdfBP3');
        self::assertInstanceOf(ProposalForm::class, $proposalForm);
        $countBefore = $proposalRepository->count(['proposalForm' => $proposalForm]);

        $commandTester = $this->createCommandTester('capco:import:idf-proposals-from-csv');
        $commandTester->execute([
            'filePath' => '/__snapshots__/imports/proposals_idf_bp3_cli.csv',
            'proposal-form' => 'proposalformIdfBP3',
            '--delimiter' => ',',
        ]);

        $display = $commandTester->getDisplay();
        self::assertSame(0, $commandTester->getStatusCode(), $display);
        self::assertStringContainsString('4 proposals successfully created.', $display);
        self::assertStringContainsString(
            '2 bad data. Lines : 2,3  are bad and not imported.',
            $display
        );
        self::assertStringContainsString(
            '1 mandatory fields missing. Lines : 8 missing somes required data and not imported.',
            $display
        );

        $this->entityManager->clear();
        $proposalForm = $proposalFormRepository->find('proposalformIdfBP3');
        self::assertInstanceOf(ProposalForm::class, $proposalForm);
        self::assertSame(
            $countBefore + 4,
            $proposalRepository->count(['proposalForm' => $proposalForm])
        );
        self::assertInstanceOf(
            Proposal::class,
            $proposalRepository->findOneBy(['title' => 'test OK'])
        );
        self::assertInstanceOf(
            Proposal::class,
            $proposalRepository->findOneBy(['title' => '2nd test OK'])
        );
        self::assertInstanceOf(
            Proposal::class,
            $proposalRepository->findOneBy(['title' => 'Proposition pour tester le doublon'])
        );
        self::assertNull(
            $proposalRepository->findOneBy(['title' => 'Proposition avec des champs manquant'])
        );
    }

    private function assertUserResponse(User $user, int $questionId, string $expectedValue): void
    {
        foreach ($user->getResponses() as $response) {
            if (
                $response instanceof ValueResponse
                && $questionId === $response->getQuestion()?->getId()
                && $expectedValue === $response->getValue()
            ) {
                return;
            }
        }

        self::fail(
            sprintf(
                'Response "%s" for question "%d" was not found on user "%s".',
                $expectedValue,
                $questionId,
                $user->getEmail()
            )
        );
    }
}
