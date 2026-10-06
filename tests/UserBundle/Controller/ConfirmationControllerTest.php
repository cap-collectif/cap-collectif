<?php

namespace Capco\Tests\UserBundle\Controller;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Service\Encryptor;
use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class ConfirmationControllerTest extends IdentityWebTestCase
{
    public function testConfirmationConsumesTokenAndAuthenticatesTheAccount(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $token = str_repeat('a', 43);
        $user->setEnabled(false)->setConfirmationToken($token);
        $this->em->flush();
        $this->browser->request('GET', '/account/email_confirmation/' . $token);
        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertNull($this->reload($id)->getConfirmationToken());
        self::assertNotNull($this->reload($id)->getConfirmedAccountAt());
        self::assertTrue($this->reload($id)->isEnabled());
        $this->assertViewer(true, $id);
    }

    /** @dataProvider accountConfirmationPaths */
    public function testAccountConfirmationPublishesOnlyItsAuthorsAssociatedContent(string $path): void
    {
        $author = $this->account()->setConfirmationToken(str_repeat('a', 43))->setEnabled(false);
        $author->setNewEmailToConfirm($this->uniqueEmail())->setNewEmailConfirmationToken('pending');
        $neighbor = $this->account()->setConfirmationToken(str_repeat('b', 43));
        $proposal = $this->em->getRepository(Proposal::class)->findOneBy([]);
        self::assertNotNull($proposal);
        $comment = (new ProposalComment())->setProposal($proposal)->setAuthor($author)->setBody('Pending account contribution');
        $neighborComment = (new ProposalComment())->setProposal($proposal)->setAuthor($neighbor)->setBody('Neighbor contribution');
        $this->em->persist($comment);
        $this->em->persist($neighborComment);
        $this->em->flush();
        $commentId = $comment->getId();
        $neighborCommentId = $neighborComment->getId();
        $neighborId = $neighbor->getId();
        $this->em->clear();

        $this->browser->request('GET', $path);

        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('/', $this->browser->getResponse()->headers->get('Location'));
        $this->em->clear();
        $comment = $this->em->find(ProposalComment::class, $commentId);
        self::assertNotNull($comment->getPublishedAt());
        self::assertSame('Pending account contribution', $comment->getBody());
        $neighborComment = $this->em->find(ProposalComment::class, $neighborCommentId);
        self::assertNull($neighborComment->getPublishedAt());
        self::assertSame('Neighbor contribution', $neighborComment->getBody());
        self::assertSame(str_repeat('b', 43), $this->reload($neighborId)->getConfirmationToken());
    }

    /** @return iterable<string, array{string}> */
    public static function accountConfirmationPaths(): iterable
    {
        yield 'initial email confirmation' => ['/account/email_confirmation/' . str_repeat('a', 43)];
        yield 'pending email confirms an unconfirmed account' => ['/account/new_email_confirmation/pending'];
    }

    /** @dataProvider unknownConfirmationUrls */
    public function testUnknownTokensLeavePendingAccountChangesUntouched(string $path): void
    {
        $user = $this->account();
        $id = $user->getId();
        $email = $user->getEmail();
        $user->setConfirmationToken(str_repeat('a', 43))->setNewEmailToConfirm($this->uniqueEmail())->setNewEmailConfirmationToken('pending');
        $this->em->flush();
        $this->browser->request('GET', $path);
        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        $user = $this->reload($id);
        self::assertSame($email, $user->getEmail());
        self::assertSame(str_repeat('a', 43), $user->getConfirmationToken());
        self::assertSame('pending', $user->getNewEmailConfirmationToken());
        $this->assertViewer(false);
    }

    /** @return iterable<string, array{string}> */
    public static function unknownConfirmationUrls(): iterable
    {
        yield 'unknown account token' => ['/account/email_confirmation/' . str_repeat('b', 43)];
        yield 'unknown pending email token' => ['/account/new_email_confirmation/missing'];
    }

    public function testNewEmailConfirmationReplacesEmailAndConsumesPendingChange(): void
    {
        $user = $this->account();
        $id = $user->getId();
        $email = $this->uniqueEmail();
        $user->setConfirmationToken(str_repeat('a', 43))->setNewEmailToConfirm($email)->setNewEmailConfirmationToken('pending');
        $this->em->flush();
        $this->browser->request('GET', '/account/new_email_confirmation/pending');
        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        $user = $this->reload($id);
        self::assertSame($email, $user->getEmail());
        self::assertNull($user->getNewEmailToConfirm());
        self::assertNull($user->getNewEmailConfirmationToken());
        self::assertNull($user->getConfirmationToken());
        self::assertTrue($user->isEmailConfirmed());
        $this->assertViewer(true, $id);
    }

    public function testAnonymousCommentConfirmationConsumesOnlyItsToken(): void
    {
        $proposal = $this->em->getRepository(Proposal::class)->findOneBy([]);
        $comment = (new ProposalComment())->setProposal($proposal)->setBody('Retained comment')->setAuthorEmail($this->uniqueEmail())->setConfirmationToken('comment-token');
        $this->em->persist($comment);
        $this->em->flush();
        $id = $comment->getId();
        $this->browser->request('GET', '/comment/email_confirmation/comment-token');
        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        $this->em->clear();
        $comment = $this->em->find(ProposalComment::class, $id);
        self::assertNull($comment->getConfirmationToken());
        self::assertSame('Retained comment', $comment->getBody());
    }

    public function testParticipantConfirmationPersistsEmailAndUsesRequestedRedirect(): void
    {
        $email = $this->uniqueEmail();
        $participant = (new Participant())->setToken('participation-token')->setEmail($this->uniqueEmail())->setConfirmationToken('unconfirmed')->setNewEmailToConfirm($email)->setNewEmailConfirmationToken('participant-confirmation');
        $this->em->persist($participant);
        $this->em->flush();
        $id = $participant->getId();
        $cookies = self::getContainer()->get(Encryptor::class)->encryptData('{}');
        $this->browser->request('GET', '/participant/new_email_confirmation/participant-confirmation', ['redirectUrl' => '/projects', 'participationCookies' => $cookies]);
        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('/projects', $this->browser->getResponse()->headers->get('Location'));
        $this->em->clear();
        $participant = $this->em->find(Participant::class, $id);
        self::assertSame($email, $participant->getEmail());
        self::assertNull($participant->getNewEmailToConfirm());
        self::assertNull($participant->getNewEmailConfirmationToken());
        self::assertTrue($participant->isEmailConfirmed());
    }

    public function testUnknownParticipantTokenLeavesPendingEmailUntouched(): void
    {
        $email = $this->uniqueEmail();
        $pendingEmail = $this->uniqueEmail();
        $participant = (new Participant())->setToken('participant-' . bin2hex(random_bytes(8)))->setEmail($email)->setConfirmationToken('unconfirmed')->setNewEmailToConfirm($pendingEmail)->setNewEmailConfirmationToken('pending');
        $this->em->persist($participant);
        $this->em->flush();
        $id = $participant->getId();

        $this->browser->request('GET', '/participant/new_email_confirmation/missing');

        self::assertSame(302, $this->browser->getResponse()->getStatusCode());
        self::assertSame('/', $this->browser->getResponse()->headers->get('Location'));
        $this->em->clear();
        $participant = $this->em->find(Participant::class, $id);
        self::assertSame($email, $participant->getEmail());
        self::assertSame($pendingEmail, $participant->getNewEmailToConfirm());
        self::assertSame('pending', $participant->getNewEmailConfirmationToken());
        self::assertSame('unconfirmed', $participant->getConfirmationToken());
        self::assertFalse($participant->isEmailConfirmed());
    }
}
