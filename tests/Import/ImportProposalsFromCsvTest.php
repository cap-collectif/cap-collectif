<?php

namespace Capco\Tests\Import;

use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class ImportProposalsFromCsvTest extends IdentityWebTestCase
{
    /** @dataProvider choiceResponses */
    public function testCsvValidationAcceptsOnlyAllowedCustomAnswers(string $type, bool $required, bool $other, string $answer, bool $accepted): void
    {
        $admin = $this->account()->addRole('ROLE_ADMIN');
        $form = $this->em->find(\Capco\AppBundle\Entity\ProposalForm::class, 'proposalForm1');
        self::assertNotNull($form);
        foreach ($form->getRealQuestions() as $existing) {
            $existing->setRequired(false);
        }
        $question = 'majority' === $type ? new \Capco\AppBundle\Entity\Questions\SimpleQuestion() : new \Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion();
        $question->setType('majority' === $type ? 'majority' : $type)->setTitle('Import choice')->setRequired($required);
        if ($question instanceof \Capco\AppBundle\Entity\Questions\MultipleChoiceQuestion) {
            $question->setOtherAllowed($other);
            $question->addChoice((new \Capco\AppBundle\Entity\QuestionChoice())->setTitle('Known choice')->setPosition(0));
        }
        $association = (new \Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion())->setProposalForm($form)->setQuestion($question)->setPosition(100);
        $form->addQuestion($association);
        $this->em->persist($association);
        $media = (new \Capco\AppBundle\Entity\Media())->setName('Import CSV')->setProviderName('sonata.media.provider.file')->setProviderReference('test-import-' . bin2hex(random_bytes(8)) . '.csv');
        $this->em->persist($media);
        $this->em->flush();
        $this->login($admin->getEmail());
        if ('majority' === $type) {
            $answer = self::getContainer()->get('translator')->getCatalogue($this->browser->getRequest()->getLocale())->get($answer, 'CapcoAppBundle');
        }
        $headers = array_merge($form->getFieldsUsed(false), $form->getCustomFields(false));
        $values = array_fill_keys($headers, '');
        $title = 'CSV test proposal ' . bin2hex(random_bytes(8));
        $values['title'] = $title;
        $values['author'] = $admin->getEmail();
        $values['category'] = 'Politique';
        $values['district'] = 'Nord Saint-Martin';
        $values['body'] = 'A description long enough for a proposal import.';
        $values['Import choice'] = $answer;
        $path = self::getContainer()->getParameter('kernel.project_dir') . '/public/media/default/0001/01/' . $media->getProviderReference();

        try {
            $handle = fopen($path, 'w');
            self::assertNotFalse($handle);

            try {
                self::assertNotFalse(fputcsv($handle, $headers, ';'));
                self::assertNotFalse(fputcsv($handle, array_values($values), ';'));
            } finally {
                fclose($handle);
            }

            $result = $this->graphql('mutation($input: AddProposalsFromCsvInput!) { addProposalsFromCsv(input: $input) { errorCode importableProposals badLines lineErrors { reason field } } }', ['input' => ['proposalFormId' => $form->getId(), 'csvToImport' => $media->getId(), 'dryRun' => true]])['addProposalsFromCsv'];
            self::assertNull($result['errorCode']);
            self::assertSame($accepted ? 1 : 0, $result['importableProposals'], json_encode($result, \JSON_THROW_ON_ERROR));
            self::assertSame($accepted ? [] : [2], $result['badLines']);
            if (!$accepted) {
                self::assertContains(['reason' => 'INVALID_CUSTOM_FIELD', 'field' => 'Import choice'], $result['lineErrors']);
            }
            $this->em->clear();
            self::assertNull($this->em->getRepository(\Capco\AppBundle\Entity\Proposal::class)->findOneBy(['title' => $title]));
        } finally {
            if (file_exists($path)) {
                unlink($path);
            }
        }
    }

    /** @return iterable<string, array{string, bool, bool, string, bool}> */
    public static function choiceResponses(): iterable
    {
        yield 'unknown choice' => ['radio', true, false, 'Unknown choice', false];
        yield 'free answer enabled' => ['radio', true, true, 'Unknown choice', true];
        yield 'empty optional choice' => ['select', false, false, '', true];
        yield 'empty required choice' => ['select', true, false, '', false];
        yield 'known choice' => ['radio', true, false, 'Known choice', true];
        yield 'valid majority judgement' => ['majority', false, false, 'global-well', true];
    }
}
