<?php

namespace Capco\Tests\Participant\Functional;

use Capco\AppBundle\Entity\Mediator;
use Capco\AppBundle\Entity\MediatorParticipantStep;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ParticipantPhoneVerificationSms;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\GraphQL\Mutation\Participant\VerifyParticipantPhoneNumberMutation;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason HTTP mutations verify persisted identity effects, authorization and sessions with controlled SMS delivery.
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class ParticipantMutationTest extends ParticipantWebTestCase
{
    /** @dataProvider verificationErrors */
    public function testProviderVerificationErrorHasNoPersistedEffect(string $code): void
    {
        $participant = $this->participant()->setPhone('+33609988777');
        $id = $participant->getId();
        $sms = (new ParticipantPhoneVerificationSms())->setParticipant($participant)->setPending()->setCreatedAt(new \DateTime());
        $this->em->persist($sms);
        $this->em->flush();
        $smsId = $sms->getId();
        $this->provider->expects($this->once())->method('verifySms')->with('+33609988777', '123456')->willReturn($code);
        $this->useSmsProviderFor(VerifyParticipantPhoneNumberMutation::class);
        $result = $this->verifyPhone(base64_encode($participant->getToken()));
        self::assertSame($code, $result['errorCode']);
        self::assertSame('NONE', $result['reconciliationMode']);
        $this->em->clear();
        $persisted = $this->em->find(Participant::class, $id);
        self::assertFalse($persisted->isPhoneConfirmed());
        self::assertSame('+33609988777', $persisted->getPhone());
        self::assertSame(ParticipantPhoneVerificationSms::PENDING, $this->em->find(ParticipantPhoneVerificationSms::class, $smsId)->getStatus());
        $this->assertViewer(false);
    }

    /** @return iterable<string, array{string}> */
    public static function verificationErrors(): iterable
    {
        foreach (['CODE_EXPIRED', 'CODE_NOT_VALID', 'RETRY_LIMIT_REACHED', 'SERVER_ERROR'] as $code) {
            yield $code => [$code];
        }
    }

    public function testVerifiedCodePersistsApprovalAndPhone(): void
    {
        $participant = $this->participant()->setPhone('+33609988773');
        $id = $participant->getId();
        $sms = (new ParticipantPhoneVerificationSms())->setParticipant($participant)->setPending()->setCreatedAt(new \DateTime());
        $this->em->persist($sms);
        $this->em->flush();
        $smsId = $sms->getId();
        $this->provider->expects($this->once())->method('verifySms')->with('+33609988773', '123456')->willReturn(null);
        $this->useSmsProviderFor(VerifyParticipantPhoneNumberMutation::class);
        $result = $this->verifyPhone(base64_encode($participant->getToken()));
        self::assertNull($result['errorCode']);
        self::assertSame('NONE', $result['reconciliationMode']);
        $this->em->clear();
        self::assertTrue($this->em->find(Participant::class, $id)->isPhoneConfirmed());
        self::assertSame(ParticipantPhoneVerificationSms::APPROVED, $this->em->find(ParticipantPhoneVerificationSms::class, $smsId)->getStatus());
    }

    public function testPhoneConfirmationPersistsAndRejectsReplay(): void
    {
        $participant = $this->participant();
        $id = $participant->getId();
        $token = base64_encode($participant->getToken());
        $updated = $this->graphql('mutation($input: UpdateParticipantInput!) { updateParticipant(input: $input) { participant { phone } validationErrors } }', ['input' => ['token' => $token, 'phone' => '+33609988776']]);
        self::assertNull($updated['updateParticipant']['validationErrors']);
        self::assertSame('+33609988776', $updated['updateParticipant']['participant']['phone']);
        $send = $this->graphql('mutation($input: SendParticipantPhoneValidationCodeInput!) { sendParticipantPhoneValidationCode(input: $input) { errorCode } }', ['input' => ['token' => $token, 'phone' => '0609988776']]);
        self::assertNull($send['sendParticipantPhoneValidationCode']['errorCode']);
        // The test environment deliberately bypasses provider validation.
        $result = $this->verifyPhone($token);
        self::assertNull($result['errorCode']);
        self::assertSame('NONE', $result['reconciliationMode']);
        self::assertSame(GlobalId::toGlobalId('Participant', $id), $result['participant']['id']);
        $this->em->clear();
        $persisted = $this->em->find(Participant::class, $id);
        self::assertTrue($persisted->isPhoneConfirmed());
        self::assertSame('+33609988776', $persisted->getPhone());
        self::assertSame('PHONE_ALREADY_CONFIRMED', $this->verifyPhone($token)['errorCode']);
        $sendAgain = $this->graphql('mutation($input: SendParticipantPhoneValidationCodeInput!) { sendParticipantPhoneValidationCode(input: $input) { errorCode } }', ['input' => ['token' => $token, 'phone' => '+33609988776']]);
        self::assertSame('PHONE_ALREADY_CONFIRMED', $sendAgain['sendParticipantPhoneValidationCode']['errorCode']);
        $this->em->clear();
        $persisted = $this->em->find(Participant::class, $id);
        self::assertInstanceOf(Participant::class, $persisted);
        self::assertTrue($persisted->isPhoneConfirmed());
        self::assertSame('+33609988776', $persisted->getPhone());
        self::assertCount(0, $this->em->getRepository(ParticipantPhoneVerificationSms::class)->findBy(['participant' => $persisted]));
    }

    public function testSmsRetryLimitReturnsExplicitCodeWithoutCreatingAnotherSms(): void
    {
        $participant = $this->participant();
        for ($i = 0; $i < 2; ++$i) {
            $sms = (new ParticipantPhoneVerificationSms())->setParticipant($participant)->setPending()->setCreatedAt(new \DateTime());
            $this->em->persist($sms);
        }
        $this->em->flush();
        $result = $this->graphql('mutation($input: SendParticipantPhoneValidationCodeInput!) { sendParticipantPhoneValidationCode(input: $input) { errorCode } }', ['input' => ['token' => base64_encode($participant->getToken()), 'phone' => '+33609988776']]);
        self::assertSame('RETRY_LIMIT_REACHED', $result['sendParticipantPhoneValidationCode']['errorCode']);
        $id = $participant->getId();
        $this->em->clear();
        $persisted = $this->em->find(Participant::class, $id);
        self::assertCount(2, $this->em->getRepository(ParticipantPhoneVerificationSms::class)->findBy(['participant' => $persisted]));
        self::assertFalse($persisted->isPhoneConfirmed());
    }

    public function testUnknownPhoneTokenIsGraphqlErrorWithoutCreatingParticipant(): void
    {
        $repository = $this->em->getRepository(Participant::class);
        $count = $repository->count([]);
        $result = $this->graphResponse('mutation($input: VerifyParticipantPhoneNumberInput!) { verifyParticipantPhoneNumber(input: $input) { errorCode } }', ['input' => ['token' => base64_encode('missing'), 'code' => '123456']]);
        self::assertNotEmpty($result['errors']);
        self::assertSame(['verifyParticipantPhoneNumber'], $result['errors'][0]['path']);
        self::assertSame('Participant not found.', $result['errors'][0]['message']);
        self::assertSame($count, $repository->count([]));
    }

    public function testConfirmedPhoneAuthenticatesExistingUser(): void
    {
        $user = $this->account();
        $user->setPhone('+33609988775')->setPhoneConfirmed(true);
        $participant = $this->participant()->setPhone('+33609988775');
        $this->em->flush();
        $result = $this->verifyPhone(base64_encode($participant->getToken()));
        self::assertSame('USER_AUTHENTICATED', $result['reconciliationMode']);
        self::assertNull($result['errorCode']);
        self::assertNull($result['participant']);
        $viewer = $this->graphql('{ viewer { id } }');
        self::assertSame(GlobalId::toGlobalId('User', $user->getId()), $viewer['viewer']['id']);
    }

    public function testMatchingParticipantRotatesTokenAndKeepsTargetConsent(): void
    {
        $target = $this->participant()->setPhone('+33609988774')->setPhoneConfirmed(true)->setConsentPrivacyPolicy(true);
        $oldToken = $target->getToken();
        $source = $this->participant()->setPhone('+33609988774');
        $sourceId = $source->getId();
        $targetId = $target->getId();
        $newToken = $source->getToken();
        $sms = (new ParticipantPhoneVerificationSms())->setParticipant($source)->setPending()->setCreatedAt(new \DateTime());
        $this->em->persist($sms);
        $this->em->flush();
        $smsId = $sms->getId();
        $result = $this->verifyPhone(base64_encode($newToken));
        self::assertSame('PARTICIPANT_MERGED', $result['reconciliationMode']);
        self::assertNull($result['errorCode']);
        self::assertSame(GlobalId::toGlobalId('Participant', $targetId), $result['participant']['id']);
        $this->em->clear();
        self::assertNull($this->em->find(Participant::class, $sourceId));
        $persisted = $this->em->find(Participant::class, $targetId);
        self::assertSame($newToken, $persisted->getToken());
        self::assertTrue($persisted->isConsentPrivacyPolicy());
        $transferredSms = $this->em->find(ParticipantPhoneVerificationSms::class, $smsId);
        self::assertSame($targetId, $transferredSms->getParticipant()->getId());
        self::assertSame(ParticipantPhoneVerificationSms::PENDING, $transferredSms->getStatus());
        self::assertNull($this->em->getRepository(Participant::class)->findOneBy(['token' => $oldToken]));
        self::assertSame('PHONE_ALREADY_CONFIRMED', $this->verifyPhone(base64_encode($newToken))['errorCode']);
        $this->assertViewer(false);
    }

    public function testCharacterizationGapPhoneMergeDeletesReplyOnClosedStep(): void
    {
        $target = $this->participant()->setPhone('+33609988772')->setPhoneConfirmed(true);
        $source = $this->participant()->setPhone('+33609988772');
        $step = $this->em->getRepository(QuestionnaireStep::class)->find('questionnairestep1');
        self::assertInstanceOf(QuestionnaireStep::class, $step);
        $step->setTimeless(false)->setStartAt(new \DateTime('2020-01-01'))->setEndAt(new \DateTime('2020-01-02'));
        $reply = (new Reply())->setQuestionnaire($step->getQuestionnaire());
        $source->addReply($reply);
        $this->em->persist($reply);
        $this->em->flush();
        $replyId = $reply->getId();
        $result = $this->verifyPhone(base64_encode($source->getToken()));
        self::assertSame('PARTICIPANT_MERGED', $result['reconciliationMode']);
        self::assertNull($result['errorCode']);
        $this->em->clear();
        // Reconciliation skips closed steps, but removing the source cascades to its replies.
        self::assertNull($this->em->find(Reply::class, $replyId));
        self::assertInstanceOf(Participant::class, $this->em->find(Participant::class, $target->getId()));
    }

    /** @dataProvider deletionAccess */
    public function testDeletionAuthorizationAndPersistedOutcome(string $identity, bool $linked, bool $allowed): void
    {
        $owner = $this->account();
        $participant = $this->participant();
        $neighbor = $this->participant()->setPhone('+33609988767');
        $neighborId = $neighbor->getId();
        $participantId = $participant->getId();
        $token = base64_encode($participant->getToken());
        $step = $this->em->getRepository(SelectionStep::class)->find('selectionstep1');
        self::assertInstanceOf(SelectionStep::class, $step);
        $mediator = (new Mediator())->setUser($owner)->setStep($step);
        $this->em->persist($mediator);
        if ($linked) {
            $link = (new MediatorParticipantStep())->setMediator($mediator)->setParticipant($participant)->setStep($step);
            $this->em->persist($link);
        }
        $this->em->flush();
        if ('anonymous' !== $identity) {
            $this->login('owner' === $identity ? $owner->getEmail() : $this->account()->getEmail());
        }
        $result = $this->graphResponse('mutation($input: DeleteParticipantInput!) { deleteParticipant(input: $input) { deletedParticipantId } }', ['input' => ['participantToken' => $token, 'mediatorId' => GlobalId::toGlobalId('Mediator', $mediator->getId())]]);
        $this->em->clear();
        self::assertSame('+33609988767', $this->em->find(Participant::class, $neighborId)->getPhone());
        if ($allowed) {
            self::assertArrayNotHasKey('errors', $result);
            self::assertSame(GlobalId::toGlobalId('Participant', $participantId), $result['data']['deleteParticipant']['deletedParticipantId']);
            self::assertNull($this->em->find(Participant::class, $participantId));
            self::assertCount(0, $this->em->getRepository(MediatorParticipantStep::class)->findBy(['participant' => $participantId]));
            $replay = $this->graphResponse('mutation($input: DeleteParticipantInput!) { deleteParticipant(input: $input) { deletedParticipantId } }', ['input' => ['participantToken' => $token, 'mediatorId' => GlobalId::toGlobalId('Mediator', $mediator->getId())]]);
            self::assertNotEmpty($replay['errors']);
            self::assertSame('Participant not found.', $replay['errors'][0]['message']);
        } else {
            $errors = $result['errors'] ?? $result['extensions']['warnings'] ?? [];
            self::assertNotEmpty($errors);
            self::assertSame(['deleteParticipant'], $errors[0]['path']);
            // Anonymous access currently causes a type error before authorization can refuse it.
            self::assertSame('anonymous' === $identity ? 'Internal server Error' : 'Access denied to this field.', $errors[0]['message']);
            self::assertNull($result['data']['deleteParticipant'] ?? null);
            $retained = $this->em->find(Participant::class, $participantId);
            self::assertInstanceOf(Participant::class, $retained);
            self::assertSame($token, base64_encode($retained->getToken()));
            self::assertCount($linked ? 1 : 0, $this->em->getRepository(MediatorParticipantStep::class)->findBy(['participant' => $retained]));
        }
    }

    /** @return iterable<string, array{string, bool, bool}> */
    public static function deletionAccess(): iterable
    {
        yield 'linked owner' => ['owner', true, true];
        yield 'unlinked owner' => ['owner', false, false];
        yield 'other user' => ['other', true, false];
        yield 'CharacterizationGap anonymous' => ['anonymous', true, false];
    }

    private function participant(): Participant
    {
        $participant = (new Participant())->setToken(bin2hex(random_bytes(24)));
        $this->em->persist($participant);
        $this->em->flush();

        return $participant;
    }

    /** @return array<string, mixed> */
    private function verifyPhone(string $token): array
    {
        return $this->graphql('mutation($input: VerifyParticipantPhoneNumberInput!) { verifyParticipantPhoneNumber(input: $input) { errorCode reconciliationMode participant { id } } }', ['input' => ['token' => $token, 'code' => '123456']])['verifyParticipantPhoneNumber'];
    }
}
