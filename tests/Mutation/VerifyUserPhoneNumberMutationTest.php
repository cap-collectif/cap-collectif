<?php

namespace Capco\Tests\Mutation;

use Capco\AppBundle\Entity\UserPhoneVerificationSms;
use Capco\Tests\IdentityWebTestCase;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class VerifyUserPhoneNumberMutationTest extends IdentityWebTestCase
{
    /** @dataProvider outcomes */
    public function testVerificationPersistsOnlyAnAcceptedPhoneAndSms(string $kind, ?string $error): void
    {
        $user = $this->account()->setPhone('+33612345678')->setPhoneConfirmed('confirmed' === $kind);
        $id = $user->getId();
        $sms = (new UserPhoneVerificationSms())->setUser($user)->setPending()->setCreatedAt(new \DateTime('2020-01-02'));
        $olderSms = (new UserPhoneVerificationSms())->setUser($user)->setPending()->setCreatedAt(new \DateTime('2020-01-01'));
        $other = $this->account()->setPhone('+33612345679');
        $otherSms = (new UserPhoneVerificationSms())->setUser($other)->setPending()->setCreatedAt(new \DateTime('2020-01-03'));
        $this->em->persist($sms);
        $this->em->persist($olderSms);
        $this->em->persist($otherSms);
        if ('collision' === $kind) {
            $other->setPhone('+33612345678')->setPhoneConfirmed(true);
        }
        $this->em->flush();
        $smsId = $sms->getId();
        $olderSmsId = $olderSms->getId();
        $otherSmsId = $otherSms->getId();
        $otherId = $other->getId();
        $otherPhone = $other->getPhone();
        $provider = $this->provider(\Capco\AppBundle\GraphQL\Mutation\Sms\VerifyUserPhoneNumberMutation::class);
        if ('confirmed' === $kind) {
            $provider->expects(self::never())->method('verifySms');
        } else {
            $provider->expects(self::once())->method('verifySms')->with('+33612345678', '123456')->willReturn('provider' === $kind ? $error : null);
        }
        $this->login($user->getEmail());
        $result = $this->graphql('mutation($input: VerifyUserPhoneNumberInput!) { verifyUserPhoneNumber(input: $input) { errorCode reconciliationMode user { id } } }', ['input' => ['code' => '123456']])['verifyUserPhoneNumber'];
        self::assertSame($error, $result['errorCode']);
        self::assertSame('NONE', $result['reconciliationMode']);
        self::assertSame(null === $error ? ['id' => GlobalId::toGlobalId('User', $id)] : null, $result['user']);
        $persisted = $this->reload($id);
        self::assertSame(null === $error || 'confirmed' === $kind, $persisted->isPhoneConfirmed());
        self::assertSame(null === $error ? 'APPROVED' : 'PENDING', $this->em->find(UserPhoneVerificationSms::class, $smsId)->getStatus());
        self::assertSame('PENDING', $this->em->find(UserPhoneVerificationSms::class, $olderSmsId)->getStatus());
        self::assertSame('PENDING', $this->em->find(UserPhoneVerificationSms::class, $otherSmsId)->getStatus());
        $persistedOther = $this->em->find(\Capco\UserBundle\Entity\User::class, $otherId);
        self::assertSame($otherPhone, $persistedOther->getPhone());
        self::assertSame('collision' === $kind, $persistedOther->isPhoneConfirmed());
    }

    /** @return iterable<string, array{string, ?string}> */
    public static function outcomes(): iterable
    {
        yield 'verified' => ['verified', null];
        yield 'already confirmed' => ['confirmed', 'PHONE_ALREADY_CONFIRMED'];
        yield 'invalid code' => ['provider', 'CODE_NOT_VALID'];
        yield 'expired code' => ['provider', 'CODE_EXPIRED'];
        yield 'phone belongs to another account' => ['collision', 'PHONE_ALREADY_USED_BY_ANOTHER_USER'];
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
