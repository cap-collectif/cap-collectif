<?php

namespace Capco\Tests\Mutation;

use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class SendSmsPhoneValidationCodeMutationTest extends IdentityWebTestCase
{
    /** @dataProvider outcomes */
    public function testOnlyAcceptedSmsRequestsCreateAPendingVerification(string $kind, int $count, bool $recent, ?string $error): void
    {
        $user = $this->account()->setPhone('+33612345678')->setPhoneConfirmed('confirmed' === $kind);
        $id = $user->getId();
        for ($i = 0; $i < $count; ++$i) {
            $sms = (new \Capco\AppBundle\Entity\UserPhoneVerificationSms())->setUser($user)->setPending()->setCreatedAt(new \DateTime($recent ? 'now' : '2000-01-01'));
            $this->em->persist($sms);
        }
        $neighbor = $this->account();
        $neighborId = $neighbor->getId();
        for ($i = 0; $i < 2; ++$i) {
            $sms = (new \Capco\AppBundle\Entity\UserPhoneVerificationSms())->setUser($neighbor)->setPending();
            $this->em->persist($sms);
        }
        $this->em->flush();
        $provider = $this->provider(\Capco\AppBundle\GraphQL\Mutation\Sms\SendSmsPhoneValidationCodeMutation::class);
        if (\in_array($kind, ['confirmed', 'limited'], true)) {
            $provider->expects(self::never())->method('sendVerificationSms');
        } else {
            $provider->expects(self::once())->method('sendVerificationSms')->with('+33612345678')->willReturn($error);
        }
        $this->login($user->getEmail());
        $result = $this->graphql('mutation { sendSmsPhoneValidationCode(input: {}) { errorCode } }')['sendSmsPhoneValidationCode'];
        self::assertSame($error, $result['errorCode']);
        $user = $this->reload($id);
        $stored = $this->em->getRepository(\Capco\AppBundle\Entity\UserPhoneVerificationSms::class)->findBy(['user' => $user]);
        self::assertCount($count + (null === $error ? 1 : 0), $stored);
        foreach ($stored as $sms) {
            self::assertSame('PENDING', $sms->getStatus());
        }
        self::assertSame('confirmed' === $kind, $user->isPhoneConfirmed());
        self::assertCount(2, $this->em->getRepository(\Capco\AppBundle\Entity\UserPhoneVerificationSms::class)->findBy(['user' => $neighborId]));
    }

    /** @return iterable<string, array{string, int, bool, ?string}> */
    public static function outcomes(): iterable
    {
        yield 'first SMS despite another accounts recent attempts' => ['sent', 0, true, null];
        yield 'one recent attempt still allows a retry' => ['sent', 1, true, null];
        yield 'old attempts do not prevent a retry' => ['sent', 2, false, null];
        yield 'already confirmed' => ['confirmed', 0, true, 'PHONE_ALREADY_CONFIRMED'];
        yield 'two recent attempts reach the retry limit' => ['limited', 2, true, 'RETRY_LIMIT_REACHED'];
        yield 'provider server error' => ['provider', 0, true, 'SERVER_ERROR'];
        yield 'invalid phone' => ['provider', 0, true, 'INVALID_NUMBER'];
    }

    /** @param class-string $mutation */
    private function provider(string $mutation): \Capco\AppBundle\Helper\Interfaces\SmsProviderInterface
    {
        $provider = $this->createMock(\Capco\AppBundle\Helper\Interfaces\SmsProviderInterface::class);
        $fetcher = $this->createStub(\Capco\AppBundle\Fetcher\SmsProviderFetcher::class);
        $fetcher->method('fetch')->willReturn($provider);
        self::getContainer()->set(\Capco\AppBundle\Fetcher\SmsProviderFetcher::class, $fetcher);
        $this->useProviderEnvironment($mutation);

        return $provider;
    }
}
