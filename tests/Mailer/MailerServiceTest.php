<?php

namespace Capco\Tests\Mailer;

use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\AbstractMessage;
use Capco\AppBundle\Mailer\SenderEmailResolver;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Symfony\Component\Mime\RawMessage;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

/**
 * @internal
 *
 * @coversNothing
 */
class MailerServiceTest extends TestCase
{
    public function testSendsLocalizedMessagesWithoutAccumulatingRecipientsAndPreservesHeaders(): void
    {
        $sentEmails = [];
        $mailer = $this->createMock(MailerInterface::class);
        $mailer
            ->expects(self::exactly(2))
            ->method('send')
            ->willReturnCallback(static function (RawMessage $message) use (&$sentEmails): void {
                self::assertInstanceOf(Email::class, $message);
                $sentEmails[] = clone $message;
            })
        ;
        $translator = $this->createMock(TranslatorInterface::class);
        $translator
            ->method('trans')
            ->willReturnCallback(static fn (
                string $id,
                array $parameters = [],
                ?string $domain = null,
                ?string $locale = null
            ): string => $id . '-' . $locale)
        ;
        $message = new class('alice@example.com', 'fr-FR', 'Alice', 'subject.key', [], 'body.key', [], 'sender@example.com', 'Cap Collectif', 'reply@example.com') extends AbstractMessage {};
        $message->addRecipient('bob@example.com', 'en-GB', 'Bob');
        $message->setCC(['cc@example.com']);
        $message->setBcc(['bcc@example.com']);

        $mailerService = new MailerService(
            $mailer,
            $this->createMock(Environment::class),
            $translator,
            $this->createMock(SiteParameterResolver::class),
            $this->createMock(RouterInterface::class),
            $this->createMock(SenderEmailResolver::class),
            $this->createMock(TokenManager::class)
        );

        self::assertTrue($mailerService->sendMessage($message));
        self::assertCount(2, $sentEmails);
        $this->assertEmail(
            $sentEmails[0],
            'alice@example.com',
            'Alice',
            'subject.key-fr-FR',
            'body.key-fr-FR'
        );
        $this->assertEmail(
            $sentEmails[1],
            'bob@example.com',
            'Bob',
            'subject.key-en-GB',
            'body.key-en-GB'
        );
    }

    private function assertEmail(
        Email $email,
        string $recipientAddress,
        string $recipientName,
        string $subject,
        string $body
    ): void {
        self::assertSame(['sender@example.com'], self::addresses($email->getFrom()));
        self::assertSame('Cap Collectif', $email->getFrom()[0]->getName());
        self::assertSame([$recipientAddress], self::addresses($email->getTo()));
        self::assertSame($recipientName, $email->getTo()[0]->getName());
        self::assertSame(['cc@example.com'], self::addresses($email->getCc()));
        self::assertSame(['bcc@example.com'], self::addresses($email->getBcc()));
        self::assertSame(['reply@example.com'], self::addresses($email->getReplyTo()));
        self::assertSame($subject, $email->getSubject());
        self::assertSame($body, $email->getHtmlBody());
    }

    /**
     * @param Address[] $addresses
     *
     * @return string[]
     */
    private static function addresses(array $addresses): array
    {
        return array_map(static fn (Address $address): string => $address->getAddress(), $addresses);
    }
}
