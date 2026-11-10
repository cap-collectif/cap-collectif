<?php

namespace Capco\Tests\Controller\Site;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\Tests\Mailer\EmailWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\DomCrawler\Crawler;

/**
 * @internal
 *
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Exercises email-only edits, independent mailbox proof and denied credential reuse through HTTP.
 */
final class ProposalWorkflowAuthenticationTest extends EmailWebTestCase
{
    private ?string $confirmationUrl = null;

    protected function tearDown(): void
    {
        if ($this->confirmationUrl) {
            $token = basename((string) parse_url((string) $this->confirmationUrl, PHP_URL_PATH));
            self::getContainer()->get('snc_redis.default')->del('proposal_workflow_authentication:' . hash('sha256', $token));
        }
        parent::tearDown();
    }

    public function testEmailLinkDoesNotGrantIdentityBeforeIndependentMailboxProof(): void
    {
        [$participant, $proposal] = $this->proposal();
        $sibling = (new Proposal())->setTitle('Other private draft')->setProposalForm($proposal->getProposalForm())->setParticipant($participant)->setDraft(true)->setEmailToken('another-email-token');
        $this->em->persist($sibling);
        $this->em->flush();

        $result = $this->submit($proposal, 'proposal-only-token');
        $this->assertAuthenticationEmail($participant);
        self::assertTrue($result['changeProposalContent']['participantAuthenticationRequired']);
        self::assertNull($this->browser->getCookieJar()->get('CapcoParticipant'));
        self::assertStringNotContainsString($participant->getToken(), json_encode($result, \JSON_THROW_ON_ERROR));
        self::assertNotNull($this->confirmationUrl);
        self::assertStringNotContainsString($this->confirmationUrl, json_encode($result, \JSON_THROW_ON_ERROR));

        $denied = $this->graphResponse('mutation($input:ChangeProposalContentInput!){changeProposalContent(input:$input){proposal{id}}}', ['input' => [
            'id' => GlobalId::toGlobalId('Proposal', $sibling->getId()), 'title' => 'Forbidden change', 'emailToken' => 'proposal-only-token',
        ]]);
        self::assertSame(sprintf('Unknown proposal with id "%s"', GlobalId::toGlobalId('Proposal', $sibling->getId())), $denied['errors'][0]['message']);
        self::assertSame(['changeProposalContent'], $denied['errors'][0]['path']);
        self::assertSame('Other private draft', $this->em->getConnection()->fetchOne('SELECT title FROM proposal WHERE id = ?', [$sibling->getId()]));
        $denied = $this->graphResponse('mutation($input:ValidateContributionInput!){validateContribution(input:$input){redirectUrl}}', ['input' => [
            'contributionId' => GlobalId::toGlobalId('Proposal', $proposal->getId()), 'token' => 'proposal-only-token',
        ]]);
        self::assertSame('You must be logged in or send a valid participant token', $denied['errors'][0]['message']);
        self::assertSame(['validateContribution'], $denied['errors'][0]['path']);
        self::assertSame('MISSING_REQUIREMENTS', $this->em->getConnection()->fetchOne('SELECT completion_status FROM proposal WHERE id = ?', [$proposal->getId()]));
        self::assertNull($this->browser->getCookieJar()->get('CapcoParticipant'));

        $this->browser->request('GET', '/proposal-workflow/authenticate/proposal-only-token');
        self::assertResponseStatusCodeSame(404);
        self::assertNull($this->browser->getCookieJar()->get('CapcoParticipant'));

        $this->browser->request('GET', parse_url($this->confirmationUrl, PHP_URL_PATH) . 'tampered');
        self::assertResponseStatusCodeSame(404);
        self::assertNull($this->browser->getCookieJar()->get('CapcoParticipant'));

        $this->browser->request('GET', $this->confirmationUrl);
        self::assertResponseStatusCodeSame(302);
        self::assertSame(base64_encode($participant->getToken()), $this->browser->getCookieJar()->get('CapcoParticipant')->getValue());
        self::assertStringContainsString('contributionId=' . urlencode(GlobalId::toGlobalId('Proposal', $proposal->getId())), $this->browser->getResponse()->headers->get('Location'));
        $validated = $this->graphql('mutation($input:ValidateContributionInput!){validateContribution(input:$input){redirectUrl}}', ['input' => [
            'contributionId' => GlobalId::toGlobalId('Proposal', $proposal->getId()), 'token' => base64_encode($participant->getToken()),
        ]]);
        self::assertNotEmpty($validated['validateContribution']['redirectUrl']);
        $this->browser->request('GET', $this->confirmationUrl);
        self::assertResponseStatusCodeSame(404);
    }

    public function testSavingIncompleteDraftDoesNotRequireAuthenticationEmail(): void
    {
        [, $proposal] = $this->proposal();

        $result = $this->submit($proposal, 'proposal-only-token', true);

        self::assertFalse($result['changeProposalContent']['participantAuthenticationRequired']);
        self::assertCount(0, $this->emails->messages);
        self::assertNull($this->browser->getCookieJar()->get('CapcoParticipant'));
        self::assertSame('Updated draft', $this->em->getConnection()->fetchOne('SELECT title FROM proposal WHERE id = ?', [$proposal->getId()]));
    }

    public function testMatchingParticipantCookieDoesNotRequireAnotherEmail(): void
    {
        [$participant, $proposal] = $this->proposal();
        $this->browser->getCookieJar()->set(new Cookie('CapcoParticipant', base64_encode($participant->getToken()), null, '/', 'capco.test', true));
        self::assertFalse($this->submit($proposal, 'proposal-only-token')['changeProposalContent']['participantAuthenticationRequired']);
        self::assertCount(0, $this->emails->messages);
    }

    public function testAnotherParticipantCookieIsNotReplacedByTheProposalEmailLink(): void
    {
        [$participant, $proposal] = $this->proposal();
        $other = (new Participant())->setToken(bin2hex(random_bytes(32)));
        $this->em->persist($other);
        $this->em->flush();
        $cookie = base64_encode($other->getToken());
        $this->browser->getCookieJar()->set(new Cookie('CapcoParticipant', $cookie, null, '/', 'capco.test', true));

        self::assertTrue($this->submit($proposal, 'proposal-only-token')['changeProposalContent']['participantAuthenticationRequired']);
        $this->assertAuthenticationEmail($participant);
        self::assertSame($cookie, $this->browser->getCookieJar()->get('CapcoParticipant')->getValue());
    }

    public function testExpiredMailboxProofCannotAuthenticate(): void
    {
        [$participant, $proposal] = $this->proposal();
        $this->submit($proposal, 'proposal-only-token');
        $this->assertAuthenticationEmail($participant);
        $token = basename((string) parse_url((string) $this->confirmationUrl, PHP_URL_PATH));
        $redis = self::getContainer()->get('snc_redis.default');
        $key = 'proposal_workflow_authentication:' . hash('sha256', $token);
        self::assertGreaterThan(0, $redis->ttl($key));
        self::assertLessThanOrEqual(900, $redis->ttl($key));
        $redis->expire($key, 0);
        $this->browser->request('GET', $this->confirmationUrl);
        self::assertResponseStatusCodeSame(404);
        self::assertNull($this->browser->getCookieJar()->get('CapcoParticipant'));
    }

    /** @return array{Participant, Proposal} */
    private function proposal(): array
    {
        $participant = (new Participant())->setToken(bin2hex(random_bytes(32)))->setEmail('workflow-proof@example.test')->setUsername('Participant');
        $participant->setConsentInternalCommunication(true);
        $form = $this->em->find(ProposalForm::class, 'proposalForm4');
        $form->getStep()->setEndAt(new \DateTime('+1 year'));
        $form->getStep()->getRequirements()->clear();
        $form->getStep()->setPrivate(false);
        $form->getStep()->getProject()->setVisibility(2);
        $proposal = (new Proposal())->setTitle('Email draft')->setBody('Draft body')->setProposalForm($form)->setParticipant($participant)->setDraft(true)->setEmailToken('proposal-only-token')->setMissingRequirementsStatus();
        $this->em->persist($participant);
        $this->em->persist($proposal);
        $this->em->flush();

        return [$participant, $proposal];
    }

    private function assertAuthenticationEmail(Participant $participant): void
    {
        self::assertCount(1, $this->emails->messages);
        $email = $this->emails->messages[0];
        self::assertCount(1, $email->getTo());
        self::assertSame($participant->getEmail(), $email->getTo()[0]->getAddress());
        $links = array_values(array_unique((new Crawler((string) $email->getHtmlBody()))->filter('a[href*="/proposal-workflow/authenticate/"]')->extract(['href'])));
        self::assertCount(1, $links);
        $this->confirmationUrl = $links[0];
        self::assertNotNull($this->confirmationUrl);
        self::assertSame('https', parse_url((string) $this->confirmationUrl, PHP_URL_SCHEME));
        self::assertSame('capco.test', parse_url((string) $this->confirmationUrl, PHP_URL_HOST));
    }

    /** @return array<string, mixed> */
    private function submit(Proposal $proposal, string $emailToken, bool $draft = false): array
    {
        return $this->graphql('mutation($input:ChangeProposalContentInput!){changeProposalContent(input:$input){participantAuthenticationRequired proposal{id}}}', ['input' => [
            'id' => GlobalId::toGlobalId('Proposal', $proposal->getId()), 'title' => 'Updated draft', 'draft' => $draft, 'emailToken' => $emailToken,
        ]]);
    }
}
