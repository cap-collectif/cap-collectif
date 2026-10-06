<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\Exception\UserInviteMessageQueuedException;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\SenderEmailDomains\MailjetClient;
use Capco\AppBundle\Mailer\SenderEmailDomains\MandrillClient;
use Capco\AppBundle\Notifier\UserInviteEmailMessageNotifier;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamInterface;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Routing\RouterInterface;

/**
 * @internal
 * @phpunit-status compliant
 * @phpunit-reason Checks provider status mapping on a real message through the public API; does not claim SQL persistence.
 */
class UserInviteEmailMessageNotifierTest extends TestCase
{
    /** @dataProvider deliveredStatuses */
    public function testProviderStatusUpdatesTheInvitationMessage(string $provider, string $status, bool $failed, string $expectedStatus, string $mailerId): void
    {
        [$notifier, $dependencies] = $this->createNotifier();
        $message = (new UserInviteEmailMessage(new \Capco\AppBundle\Entity\UserInvite()))->setMailerId($mailerId);
        if ('mailjet' === $provider) {
            $dependencies['mailjet']->expects($this->atLeastOnce())->method('get')->with('message/' . $mailerId)->willReturn($this->response(['Data' => [['Status' => $status]]]));
            $dependencies['mandrill']->expects($this->never())->method('post');
            $transport = \Capco\AppBundle\Mailer\Transport\MailjetTransport::class;
        } else {
            $dependencies['mandrill']->expects($this->atLeastOnce())->method('post')->with('messages/info', ['id' => $mailerId])->willReturn($this->response(['state' => $status]));
            $dependencies['mailjet']->expects($this->never())->method('get');
            $transport = \Capco\AppBundle\Mailer\Transport\MandrillTransport::class;
        }

        self::assertSame($failed, $notifier->onStatusCheckInvitation($message, $transport));
        self::assertSame($expectedStatus, $message->getInternalStatus());
    }

    /** @return iterable<string, array{string, string, bool, string, string}> */
    public static function deliveredStatuses(): iterable
    {
        yield 'Mailjet sent' => ['mailjet', MailjetClient::STATUS_SENT, false, UserInviteEmailMessage::SENT, '456'];
        yield 'Mailjet opened' => ['mailjet', MailjetClient::STATUS_OPENED, false, UserInviteEmailMessage::SENT, '789'];
        yield 'Mailjet clicked' => ['mailjet', MailjetClient::STATUS_CLICKED, false, UserInviteEmailMessage::SENT, '901'];
        yield 'Mailjet bounced' => ['mailjet', 'bounced', true, UserInviteEmailMessage::SEND_FAILURE, '123'];
        yield 'Mandrill sent' => ['mandrill', MandrillClient::STATUS_SENT, false, UserInviteEmailMessage::SENT, '456'];
        yield 'Mandrill different message' => ['mandrill', MandrillClient::STATUS_SENT, false, UserInviteEmailMessage::SENT, 'another-message'];
        yield 'Mandrill failed' => ['mandrill', 'failed', true, UserInviteEmailMessage::SEND_FAILURE, '789'];
    }

    /** @dataProvider queuedProviders */
    public function testQueuedProviderStatusKeepsTheInvitationWaiting(string $provider, string $mailerId): void
    {
        [$notifier, $dependencies] = $this->createNotifier();
        $message = (new UserInviteEmailMessage(new \Capco\AppBundle\Entity\UserInvite()))->setMailerId($mailerId);
        if ('mailjet' === $provider) {
            $dependencies['mailjet']->expects($this->atLeastOnce())->method('get')->with('message/' . $mailerId)->willReturn($this->response(['Data' => [['Status' => MailjetClient::STATUS_QUEUED]]]));
            $dependencies['mandrill']->expects($this->never())->method('post');
            $transport = \Capco\AppBundle\Mailer\Transport\MailjetTransport::class;
        } else {
            $dependencies['mandrill']->expects($this->atLeastOnce())->method('post')->with('messages/info', ['id' => $mailerId])->willReturn($this->response(['state' => MandrillClient::STATUS_QUEUED]));
            $dependencies['mailjet']->expects($this->never())->method('get');
            $transport = \Capco\AppBundle\Mailer\Transport\MandrillTransport::class;
        }

        try {
            $notifier->onStatusCheckInvitation($message, $transport);
            self::fail('A queued message must be retried.');
        } catch (UserInviteMessageQueuedException) {
            self::assertSame(UserInviteEmailMessage::WAITING_SENDING, $message->getInternalStatus());
        }
    }

    /** @return iterable<string, array{string, string}> */
    public static function queuedProviders(): iterable
    {
        yield 'Mailjet queued' => ['mailjet', '456'];
        yield 'Mandrill queued' => ['mandrill', 'queued-message'];
    }

    /** @param array<string, mixed> $bodyData */
    private function response(array $bodyData): ResponseInterface
    {
        $body = $this->createStub(StreamInterface::class);
        $body->method('getContents')->willReturn(json_encode($bodyData, \JSON_THROW_ON_ERROR));
        $response = $this->createStub(ResponseInterface::class);
        $response->method('getBody')->willReturn($body);

        return $response;
    }

    /** @return array{UserInviteEmailMessageNotifier, array<string, mixed>} */
    private function createNotifier(): array
    {
        $entityManager = $this->createStub(EntityManagerInterface::class);
        $mailjet = $this->createMock(MailjetClient::class);
        $mandrill = $this->createMock(MandrillClient::class);
        $notifier = new UserInviteEmailMessageNotifier(
            $this->createStub(MailerService::class),
            $this->createStub(SiteParameterResolver::class),
            $this->createStub(RouterInterface::class),
            $this->createStub(LocaleResolver::class),
            $this->createStub(Publisher::class),
            $entityManager,
            $this->createStub(LoggerInterface::class),
            $mailjet,
            $mandrill
        );

        return [$notifier, compact('entityManager', 'mailjet', 'mandrill')];
    }
}
