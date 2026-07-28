<?php

namespace Capco\Tests\Notifier;

use Capco\AppBundle\Entity\NotificationsConfiguration\ProposalFormNotificationConfiguration;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalAdminUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Notifier\ProposalNotifier;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use PHPUnit\Framework\TestCase;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 * @coversNothing
 */
class ProposalNotifierTest extends TestCase
{
    public function testOnDeleteDoesNotSendAdminNotificationWhenDisabled(): void
    {
        $configuration = $this->createMock(ProposalFormNotificationConfiguration::class);
        $configuration->method('isOnDelete')->willReturn(false);

        $proposalForm = $this->createMock(ProposalForm::class);
        $proposalForm->method('getNotificationsConfiguration')->willReturn($configuration);

        $proposal = $this->createMock(Proposal::class);
        $proposal->method('getProposalForm')->willReturn($proposalForm);
        $proposal->method('getDeletedAt')->willReturn(new \DateTimeImmutable('2026-07-23 10:00:00'));
        $proposal->method('getAnalysts')->willReturn(new ArrayCollection());

        $mailer = $this->createMock(MailerService::class);
        $mailer->expects($this->never())->method('createAndSendMessage');

        $router = $this->createMock(RouterInterface::class);
        $router->method('generate')->willReturn('https://capco.test');

        $localeResolver = $this->createMock(LocaleResolver::class);
        $localeResolver->method('getDefaultLocaleCodeForRequest')->willReturn('fr-FR');

        $notifier = new ProposalNotifier(
            $mailer,
            $this->createMock(SiteParameterResolver::class),
            $this->createMock(ProposalAdminUrlResolver::class),
            $this->createMock(ProposalUrlResolver::class),
            $this->createMock(UrlResolver::class),
            $router,
            $this->createMock(TranslatorInterface::class),
            $this->createMock(UserUrlResolver::class),
            $this->createMock(RequestStack::class),
            $localeResolver,
            $this->createMock(UserRepository::class)
        );

        $notifier->onDelete($proposal);
    }
}
