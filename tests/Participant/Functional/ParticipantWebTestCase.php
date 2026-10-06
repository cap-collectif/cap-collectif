<?php

namespace Capco\Tests\Participant\Functional;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Fetcher\SmsProviderFetcher;
use Capco\AppBundle\Helper\Interfaces\SmsProviderInterface;
use Capco\Tests\UserBundle\Functional\AccountWebTestCase;
use Symfony\Component\BrowserKit\Cookie;
use Symfony\Component\HttpKernel\KernelInterface;

abstract class ParticipantWebTestCase extends AccountWebTestCase
{
    /** @var SmsProviderInterface&\PHPUnit\Framework\MockObject\MockObject */
    protected SmsProviderInterface $provider;

    protected function setUp(): void
    {
        parent::setUp();
        $this->provider = $this->createMock(SmsProviderInterface::class);
        $fetcher = $this->createStub(SmsProviderFetcher::class);
        $fetcher->method('fetch')->willReturn($this->provider);
        self::getContainer()->set(SmsProviderFetcher::class, $fetcher);
    }

    /**
     * @param array<string, mixed> $parameters
     * @param array<string, mixed> $files
     * @param array<string, mixed> $server
     */
    protected function request(string $method, string $uri, array $parameters = [], array $files = [], array $server = [], ?string $content = null): void
    {
        // HTTP actions must load persisted relations, not stale setup collections.
        $this->em->clear();
        parent::request($method, $uri, $parameters, $files, $server, $content);
    }

    protected function participationCookies(Participant $participant): void
    {
        $this->browser->getCookieJar()->set(new Cookie('CapcoParticipant', base64_encode($participant->getToken()), null, '/', 'capco.test', true));
        $this->browser->getCookieJar()->set(new Cookie('CapcoAnonReply', 'replies-present', null, '/', 'capco.test', true));
    }

    /** @return array<string, mixed> */
    protected function confirmPhone(Participant $participant): array
    {
        return $this->graphql('mutation($input: VerifyParticipantPhoneNumberInput!) { verifyParticipantPhoneNumber(input: $input) { errorCode reconciliationMode participant { id } } }', ['input' => ['token' => base64_encode($participant->getToken()), 'code' => '123456']])['verifyParticipantPhoneNumber'];
    }

    protected function useSmsProviderFor(string $mutationClass): void
    {
        $container = self::getContainer();
        $kernel = $container->get('kernel');
        $providerKernel = $this->createStub(KernelInterface::class);
        $providerKernel->method('getEnvironment')->willReturn('prod');
        // Only the mutation bypasses the test-mode SMS shortcut; HTTP and SQL stay in test.
        $container->set('kernel', $providerKernel);

        try {
            $container->get($mutationClass);
        } finally {
            $container->set('kernel', $kernel);
        }
    }
}
