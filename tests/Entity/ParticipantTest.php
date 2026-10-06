<?php

namespace Capco\Tests\Entity;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Reply;
use Capco\UserBundle\Entity\User;
use PHPUnit\Framework\TestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Public identity and contributor rules use real domain objects without infrastructure.
 */
final class ParticipantTest extends TestCase
{
    public function testAnonymousDefaultsDoNotGrantConsentOrConfirmPhone(): void
    {
        $participant = new Participant();
        self::assertNull($participant->getEmail());
        self::assertTrue($participant->isEmailConfirmed());
        self::assertFalse($participant->isPhoneConfirmed());
        self::assertFalse($participant->getConsentSmsCommunication());
        self::assertFalse($participant->isConsentInternalCommunication());
        self::assertFalse($participant->isConsentPrivacyPolicy());
        self::assertNull($participant->getUser());
        self::assertFalse($participant->isIndexable());
        self::assertNotSame($participant->getAnonymizationReminderEmailToken(), (new Participant())->getAnonymizationReminderEmailToken());
    }

    public function testConfirmationAndPendingEmailChangeHaveSeparateTokens(): void
    {
        $participant = (new Participant())->setToken('participation')->setEmail('first@example.com');
        $participant->setConfirmationToken('confirmation')->setNewEmailToConfirm('second@example.com')->setNewEmailConfirmationToken('email-change');
        self::assertFalse($participant->isEmailConfirmed());
        $participant->setConfirmationToken(null);
        self::assertTrue($participant->isEmailConfirmed());
        self::assertSame('first@example.com', $participant->getEmail());
        self::assertSame('second@example.com', $participant->getNewEmailToConfirm());
        self::assertSame('email-change', $participant->getNewEmailConfirmationToken());
        self::assertSame('participation', $participant->getToken());
    }

    public function testTransferringAssociatedContentPreservesConsentAndContent(): void
    {
        $participant = (new Participant())->setConsentSmsCommunication(true)->setConsentInternalCommunication(true)->setConsentPrivacyPolicy(true);
        $proposal = (new Proposal())->setTitle('Associated content');
        $reply = new Reply();
        $vote = new ProposalSelectionVote();
        $participant->addProposal($proposal)->addReply($reply)->addVote($vote);
        $user = new User();
        $proposal->setContributor($user);
        $reply->setContributor($user);
        $vote->setContributor($user);
        self::assertTrue($participant->getConsentSmsCommunication());
        self::assertTrue($participant->isConsentInternalCommunication());
        self::assertTrue($participant->isConsentPrivacyPolicy());
        self::assertSame([$proposal], $participant->getProposals()->toArray());
        self::assertSame([$reply], $participant->getReplies()->toArray());
        self::assertSame([$vote], $participant->getVotes()->toArray());
        self::assertSame('Associated content', $proposal->getTitle());
        self::assertNull($proposal->getParticipant());
        self::assertNull($reply->getParticipant());
        self::assertNull($vote->getParticipant());
        self::assertSame($user, $proposal->getAuthor());
        self::assertSame($user, $reply->getAuthor());
        self::assertSame($user, $vote->getUser());
    }

    public function testCollectionsAreIdempotentAndRemovalDoesNotDetachNewContributor(): void
    {
        $participant = new Participant();
        $target = new Participant();
        $proposal = new Proposal();
        $reply = new Reply();
        $vote = new ProposalSelectionVote();
        $participant->addProposal($proposal)->addProposal($proposal)->addReply($reply)->addReply($reply)->addVote($vote)->addVote($vote);
        self::assertCount(1, $participant->getProposals());
        self::assertCount(1, $participant->getReplies());
        self::assertCount(1, $participant->getVotes());
        $target->addProposal($proposal)->addReply($reply)->addVote($vote);
        $participant->removeProposal($proposal)->removeReply($reply)->removeVote($vote);
        self::assertSame($target, $proposal->getParticipant());
        self::assertSame($target, $reply->getParticipant());
        self::assertSame($target, $vote->getParticipant());
        $target->removeProposal($proposal)->removeReply($reply)->removeVote($vote);
        self::assertNull($proposal->getParticipant());
        self::assertNull($reply->getParticipant());
        self::assertNull($vote->getParticipant());
        self::assertCount(0, $participant->getProposals());
        self::assertCount(0, $participant->getReplies());
        self::assertCount(0, $participant->getVotes());
        self::assertCount(0, $target->getProposals());
        self::assertCount(0, $target->getReplies());
        self::assertCount(0, $target->getVotes());
    }
}
