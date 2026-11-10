<?php

namespace Capco\Tests\Controller\Site;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\Tests\IdentityWebTestCase;
use Symfony\Component\BrowserKit\Cookie;

/**
 * @internal
 *
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Checks incomplete draft access over HTTP with transactional fixture changes.
 */
final class ProposalDraftAccessTest extends IdentityWebTestCase
{
    /** @dataProvider viewers */
    public function testIncompleteDraftAccess(string $viewer, int $expectedStatus, bool $draft = true): void
    {
        $proposal = $this->em->find(Proposal::class, 'proposal20');
        $proposal->setMissingRequirementsStatus();
        $proposal->setSlug('incomplete-draft-' . bin2hex(random_bytes(8)));
        $proposal->setDraft($draft);
        $author = $proposal->getAuthor();
        $url = self::getContainer()->get('router')->generate('app_project_show_proposal', [
            'projectSlug' => $proposal->getProject()->getSlug(),
            'stepSlug' => $proposal->getStep()->getSlug(),
            'proposalSlug' => $proposal->getSlug(),
        ]);
        $this->em->flush();
        $this->em->clear();

        if ('author' === $viewer) {
            $this->browser->loginUser($author, 'main');
        } elseif ('other' === $viewer) {
            $this->browser->loginUser($this->account(), 'main');
        }

        $this->browser->request('GET', $url);

        self::assertResponseStatusCodeSame($expectedStatus);
    }

    /** @return iterable<string, array{0: string, 1: int, 2?: bool}> */
    public static function viewers(): iterable
    {
        yield 'author' => ['author', 200];

        yield 'another user' => ['other', 404];

        yield 'anonymous visitor' => ['anonymous', 404];

        yield 'incomplete non-draft' => ['author', 404, false];
    }

    /** @dataProvider participantCredentials */
    public function testParticipantDraftPageAccess(string $credential, bool $completed, bool $allowed): void
    {
        [$proposal, $token] = $this->participantDraft($credential, $completed);
        if (null !== $token) {
            $this->browser->getCookieJar()->set(new Cookie('CapcoParticipant', $token, null, '/', 'capco.test', true));
        }
        $url = self::getContainer()->get('router')->generate('app_project_show_proposal', [
            'projectSlug' => $proposal->getProject()->getSlug(),
            'stepSlug' => $proposal->getStep()->getSlug(),
            'proposalSlug' => $proposal->getSlug(),
        ]);

        $this->browser->request('GET', $url);

        self::assertResponseStatusCodeSame($allowed ? 200 : 404);
        if (!$allowed) {
            self::assertStringNotContainsString($proposal->getBody(), (string) $this->browser->getResponse()->getContent());
        }
    }

    /** @dataProvider participantCredentials */
    public function testParticipantDraftGraphqlAccess(string $credential, bool $completed, bool $allowed): void
    {
        [$proposal, $token] = $this->participantDraft($credential, $completed);

        $data = $this->graphql('query($slug: String!, $token: String) { proposalFromSlug(slug: $slug, participantToken: $token) { title body } }', [
            'slug' => $proposal->getSlug(), 'token' => $token,
        ]);

        self::assertSame($allowed ? ['title' => $proposal->getTitle(), 'body' => $proposal->getBody()] : null, $data['proposalFromSlug']);
    }

    /** @return iterable<string, array{string, bool, bool}> */
    public static function participantCredentials(): iterable
    {
        foreach ([false, true] as $completed) {
            $status = $completed ? 'completed' : 'missing requirements';

            yield $status . ' without credentials' => ['none', $completed, false];

            yield $status . ' with owner token' => ['owner', $completed, true];

            yield $status . ' with another participant token' => ['other', $completed, false];

            yield $status . ' with proposal email token' => ['email', $completed, false];
        }
    }

    /** @return array{Proposal, ?string} */
    private function participantDraft(string $credential, bool $completed): array
    {
        $participant = (new Participant())->setToken(bin2hex(random_bytes(32)));
        $other = (new Participant())->setToken(bin2hex(random_bytes(32)));
        $form = $this->em->find(ProposalForm::class, 'proposalForm4');
        $form->getStep()->setPrivate(false);
        $form->getStep()->getProject()->setVisibility(2);
        $proposal = (new Proposal())->setTitle('Participant draft')->setBody('Confidential draft body')
            ->setSlug('participant-draft-' . bin2hex(random_bytes(8)))
            ->setProposalForm($form)->setParticipant($participant)->setDraft(true)
            ->setEmailToken(bin2hex(random_bytes(32)))
        ;
        if (!$completed) {
            $proposal->setMissingRequirementsStatus();
        }
        $this->em->persist($participant);
        $this->em->persist($other);
        $this->em->persist($proposal);
        $this->em->flush();

        $token = match ($credential) {
            'owner' => base64_encode($participant->getToken()),
            'other' => base64_encode($other->getToken()),
            'email' => base64_encode((string) $proposal->getEmailToken()),
            default => null,
        };
        $this->em->clear();

        return [$proposal, $token];
    }
}
