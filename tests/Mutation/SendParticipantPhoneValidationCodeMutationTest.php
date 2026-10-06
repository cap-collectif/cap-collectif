<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\ParticipantPhoneVerificationSms;
use Capco\AppBundle\GraphQL\Mutation\Participant\SendParticipantPhoneValidationCodeMutation;
use Capco\Tests\Participant\Functional\ParticipantWebTestCase;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason HTTP SMS outcomes assert persisted requests and refusal effects with a controlled external provider.
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 */
final class SendParticipantPhoneValidationCodeMutationTest extends ParticipantWebTestCase
{
    /** @dataProvider sends */
    public function testSmsOutcomes(bool $confirmed, int $recentCount, string $env, ?string $providerError, ?string $expected, bool $sends): void
    {
        $participant = (new Participant())->setToken(bin2hex(random_bytes(24)))->setPhone('+33609988770')->setPhoneConfirmed($confirmed);
        $neighbor = (new Participant())->setToken(bin2hex(random_bytes(24)))->setPhone('+33609988769');
        $this->em->persist($participant);
        $this->em->persist($neighbor);
        for ($i = 0; $i < $recentCount; ++$i) {
            $this->em->persist((new ParticipantPhoneVerificationSms())->setParticipant($participant)->setPending()->setCreatedAt(new \DateTime()));
        }
        $this->em->flush();
        $id = $participant->getId();
        $neighborId = $neighbor->getId();
        $this->provider->expects($sends ? $this->once() : $this->never())->method('sendVerificationSms')->with('+33601010101')->willReturn($providerError);
        if ('prod' === $env) {
            $this->useSmsProviderFor(SendParticipantPhoneValidationCodeMutation::class);
        }

        $result = $this->graphql('mutation($input: SendParticipantPhoneValidationCodeInput!) { sendParticipantPhoneValidationCode(input: $input) { errorCode } }', ['input' => ['token' => base64_encode($participant->getToken()), 'phone' => '0601010101']]);

        self::assertSame(['errorCode' => $expected], $result['sendParticipantPhoneValidationCode']);
        $this->em->clear();
        $persisted = $this->em->find(Participant::class, $id);
        self::assertInstanceOf(Participant::class, $persisted);
        $success = $sends && null === $providerError;
        self::assertSame($success ? '+33601010101' : '+33609988770', $persisted->getPhone());
        self::assertSame($confirmed, $persisted->isPhoneConfirmed());
        $requests = $this->em->getRepository(ParticipantPhoneVerificationSms::class)->findBy(['participant' => $persisted]);
        self::assertCount($recentCount + ($success ? 1 : 0), $requests);
        foreach ($requests as $sms) {
            self::assertSame(ParticipantPhoneVerificationSms::PENDING, $sms->getStatus());
            self::assertSame($id, $sms->getParticipant()->getId());
        }
        self::assertSame('+33609988769', $this->em->find(Participant::class, $neighborId)->getPhone());
    }

    /** @return iterable<string, array{bool, int, string, ?string, ?string, bool}> */
    public static function sends(): iterable
    {
        yield 'already confirmed' => [true, 0, 'prod', null, 'PHONE_ALREADY_CONFIRMED', false];
        yield 'retry boundary' => [false, 2, 'prod', null, 'RETRY_LIMIT_REACHED', false];
        yield 'retry exceeded' => [false, 3, 'prod', null, 'RETRY_LIMIT_REACHED', false];
        yield 'first send' => [false, 0, 'prod', null, null, true];
        yield 'one retry allowed' => [false, 1, 'prod', null, null, true];
        yield 'invalid number' => [false, 0, 'prod', 'INVALID_NUMBER', 'INVALID_NUMBER', true];
        yield 'provider failure' => [false, 0, 'prod', 'SERVER_ERROR', 'SERVER_ERROR', true];
        yield 'test environment bypass' => [false, 0, 'test', null, null, false];
    }
}
