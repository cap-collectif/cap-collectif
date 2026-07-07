<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Contribution\ContributionModerationMessage;
use Capco\AppBundle\Notifier\ContributionNotifier;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use PHPUnit\Framework\TestCase;
use Symfony\Component\Routing\RouterInterface;

/**
 * @internal
 * @coversNothing
 */
class ContributionNotifierTest extends TestCase
{
    public function testOnModerationDoesNotSendEmailWhenAuthorHasNoEmail(): void
    {
        $author = new Participant();
        $proposal = $this->createMock(Proposal::class);
        $proposal->method('getAuthor')->willReturn($author);

        $mailer = $this->createMock(MailerService::class);
        $mailer
            ->expects($this->never())
            ->method('createAndSendMessage')
        ;

        $urlResolver = $this->createMock(UrlResolver::class);
        $urlResolver
            ->expects($this->never())
            ->method('getObjectUrl')
        ;

        $this->createNotifier($mailer, $urlResolver)->onModeration($proposal);
    }

    public function testOnModerationSendsEmailWhenAuthorHasEmail(): void
    {
        $author = new Participant();
        $author->setEmail('participant@example.com');

        $proposal = $this->createMock(Proposal::class);
        $proposal->method('getAuthor')->willReturn($author);

        $urlResolver = $this->createMock(UrlResolver::class);
        $urlResolver
            ->expects($this->once())
            ->method('getObjectUrl')
            ->with($proposal, true)
            ->willReturn('https://capco.dev/proposals/test')
        ;

        $mailer = $this->createMock(MailerService::class);
        $mailer
            ->expects($this->once())
            ->method('createAndSendMessage')
            ->with(
                ContributionModerationMessage::class,
                $proposal,
                ['trashURL' => 'https://capco.dev/proposals/test'],
                $author
            )
        ;

        $this->createNotifier($mailer, $urlResolver)->onModeration($proposal);
    }

    private function createNotifier(
        MailerService $mailer,
        UrlResolver $urlResolver
    ): ContributionNotifier {
        return new ContributionNotifier(
            $mailer,
            $this->createMock(SiteParameterResolver::class),
            $urlResolver,
            $this->createMock(RouterInterface::class),
            $this->createMock(LocaleResolver::class)
        );
    }
}
