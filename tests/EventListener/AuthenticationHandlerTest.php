<?php

namespace Capco\Tests\EventListener;

use Capco\AppBundle\Entity\UserConnection;
use Capco\Tests\IdentityWebTestCase;

/**
 * @internal
 * @runTestsInSeparateProcesses
 * @preserveGlobalState disabled
 * @phpunit-status compliant
 * @phpunit-reason Exercises HTTP outcomes and real domain data with transactional cleanup; replaces only external boundaries.
 */
final class AuthenticationHandlerTest extends IdentityWebTestCase
{
    public function testFailedLoginReportsOnlyRecentAttemptsForTheSameEmailAndIp(): void
    {
        $user = $this->account();
        foreach (['192.0.2.1', '192.0.2.1', '192.0.2.2'] as $ip) {
            $connection = (new UserConnection())->setEmail($user->getEmail())->setUser($user)->setIpAddress($ip)->setDatetime(new \DateTime('-10 minutes'))->setSuccess(false);
            $this->em->persist($connection);
        }
        foreach ([[$user->getEmail(), '-2 hours', false], [$this->uniqueEmail(), '-10 minutes', false], [$user->getEmail(), '-10 minutes', true]] as [$email, $date, $success]) {
            $connection = (new UserConnection())->setEmail($email)->setUser($user)->setIpAddress('192.0.2.1')->setDatetime(new \DateTime($date))->setSuccess($success);
            $this->em->persist($connection);
        }
        $this->em->flush();

        $this->browser->request('POST', '/login_check', [], [], ['CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '192.0.2.1'], json_encode(['username' => $user->getEmail(), 'password' => 'incorrect'], \JSON_THROW_ON_ERROR));

        self::assertSame(401, $this->browser->getResponse()->getStatusCode());
        $payload = json_decode((string) $this->browser->getResponse()->getContent(), true, 512, \JSON_THROW_ON_ERROR);
        self::assertSame('Bad credentials.', $payload['reason']);
        self::assertSame(3, $payload['failedAttempts']);
        $this->assertViewer(false);
    }
}
