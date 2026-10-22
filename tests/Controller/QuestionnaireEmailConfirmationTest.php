<?php

namespace Capco\Tests\Controller;

use Capco\AppBundle\Entity\Participant;
use Capco\Tests\UserBundle\Functional\AccountWebTestCase;

/**
 * @internal
 *
 * @coversNothing
 *
 * @runTestsInSeparateProcesses
 *
 * @preserveGlobalState disabled
 *
 * @phpunit-status compliant
 *
 * @phpunit-reason Exercises the confirmation link over HTTP and reloads SQL state inside a rolled-back transaction.
 */
class QuestionnaireEmailConfirmationTest extends AccountWebTestCase
{
    public function testUnknownTokenDoesNotConfirmAnEmail(): void
    {
        $participant = $this->unconfirmedParticipant();
        $id = $participant->getId();

        $this->request('GET', '/confirmAnonymousEmail?token=unknown-token');

        self::assertResponseRedirects('/');
        $this->em->clear();
        $participant = $this->em->find(Participant::class, $id);
        self::assertInstanceOf(Participant::class, $participant);
        self::assertFalse($participant->isEmailConfirmed());
        self::assertSame('known-confirmation-token', $participant->getConfirmationToken());
    }

    public function testConfirmationLinkConfirmsParticipantEmail(): void
    {
        $participant = $this->unconfirmedParticipant();
        $id = $participant->getId();
        $this->em->clear();

        $this->request('GET', '/confirmAnonymousEmail?token=known-confirmation-token');

        self::assertResponseRedirects('/');
        $this->em->clear();
        $participant = $this->em->find(Participant::class, $id);
        self::assertInstanceOf(Participant::class, $participant);
        self::assertTrue($participant->isEmailConfirmed());
        self::assertNull($participant->getConfirmationToken());
    }

    private function unconfirmedParticipant(): Participant
    {
        $participant = $this->em->find(Participant::class, 'participant1');
        self::assertInstanceOf(Participant::class, $participant);
        $participant->setConfirmationToken('known-confirmation-token');
        $this->em->flush();

        return $participant;
    }
}
