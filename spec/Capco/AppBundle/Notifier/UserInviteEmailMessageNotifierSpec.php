<?php

namespace spec\Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\UserInviteEmailMessage;
use Capco\AppBundle\Exception\UserInviteMessageQueuedException;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\SenderEmailDomains\MailjetClient;
use Capco\AppBundle\Mailer\SenderEmailDomains\MandrillClient;
use Capco\AppBundle\Mailer\Transport\MailjetTransport;
use Capco\AppBundle\Mailer\Transport\MandrillTransport;
use Capco\AppBundle\Notifier\UserInviteEmailMessageNotifier;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Doctrine\ORM\EntityManagerInterface;
use GuzzleHttp\Psr7\Stream;
use PhpSpec\ObjectBehavior;
use Psr\Http\Message\ResponseInterface;
use Psr\Log\LoggerInterface;
use Swarrot\SwarrotBundle\Broker\Publisher;
use Symfony\Component\Routing\RouterInterface;

class UserInviteEmailMessageNotifierSpec extends ObjectBehavior
{
    public function let(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        Publisher $publisher,
        EntityManagerInterface $entityManager,
        LoggerInterface $logger,
        MailjetClient $mailjetClient,
        MandrillClient $mandrillClient
    ): void {
        $localeResolver->getDefaultLocaleCodeForRequest()->willReturn('fr');
        $router->generate('app_homepage', ['_locale' => 'fr'], 0)->willReturn('/');
        $siteParams->getValue('global.site.url')->willReturn('test');
        $siteParams->getValue('global.site.fullname')->willReturn('test');
        $this->beConstructedWith(
            $mailer,
            $siteParams,
            $router,
            $localeResolver,
            $publisher,
            $entityManager,
            $logger,
            $mailjetClient,
            $mandrillClient
        );
    }

    public function it_is_initialisable(): void
    {
        $this->shouldHaveType(UserInviteEmailMessageNotifier::class);
    }

    public function it_process_sent_message_with_mailjet(
        MailjetClient $mailjetClient,
        UserInviteEmailMessage $emailMessage,
        ResponseInterface $response,
        Stream $body,
        EntityManagerInterface $entityManager
    ): void {
        $response = $this->initResponse($response, $body, 'sent', MailjetTransport::class);
        $emailMessage->getMailjetId()->willReturn('456');
        $mailjetClient->get('message/456')->willReturn($response);
        $emailMessage
            ->setInternalStatus(UserInviteEmailMessage::SENT)
            ->shouldBeCalled()
            ->willReturn($emailMessage);
        $emailMessage->getId()->willReturn('123');
        $entityManager->flush()->shouldBeCalled();
        $this->onStatusCheckInvitation($emailMessage, MailjetTransport::class);
    }

    public function it_process_queued_message_with_mailjet(
        MailjetClient $mailjetClient,
        UserInviteEmailMessage $emailMessage,
        ResponseInterface $response,
        Stream $body
    ): void {
        $response = $this->initResponse($response, $body, 'queued', MailjetTransport::class);
        $mailjetClient->get('message/456')->willReturn($response);
        $emailMessage->getMailjetId()->willReturn('456');
        $this->shouldThrow(
            new UserInviteMessageQueuedException(
                UserInviteMessageQueuedException::MESSAGE_DEFAULT_QUEUED
            )
        )->during('onStatusCheckInvitation', [$emailMessage, MailjetTransport::class]);
    }

    public function it_process_failed_message_with_mailjet(
        MailjetClient $mailjetClient,
        UserInviteEmailMessage $emailMessage,
        ResponseInterface $response,
        Stream $body,
        EntityManagerInterface $entityManager
    ): void {
        $response = $this->initResponse($response, $body, 'bounced', MailjetTransport::class);
        $mailjetClient->get('message/456')->willReturn($response);
        $emailMessage->getId()->willReturn('123');
        $emailMessage->getMailjetId()->willReturn('456');
        $emailMessage
            ->setInternalStatus(UserInviteEmailMessage::SEND_FAILURE)
            ->shouldBeCalled()
            ->willReturn($emailMessage);
        $entityManager->flush()->shouldBeCalled();
        $this->onStatusCheckInvitation($emailMessage, MailjetTransport::class);
    }

    public function it_process_sent_message_with_mandrill(
        MandrillClient $mandrillClient,
        UserInviteEmailMessage $emailMessage,
        ResponseInterface $response,
        Stream $body,
        EntityManagerInterface $entityManager
    ): void {
        $response = $this->initResponse($response, $body, 'sent', MandrillTransport::class);
        $mandrillClient->post('messages/info', ['id' => 456])->willReturn($response);
        $emailMessage
            ->setInternalStatus(UserInviteEmailMessage::SENT)
            ->shouldBeCalled()
            ->willReturn($emailMessage);
        $emailMessage->getId()->willReturn('123');
        $emailMessage->getMandrillId()->willReturn('456');
        $entityManager->flush()->shouldBeCalled();
        $this->onStatusCheckInvitation($emailMessage, MandrillTransport::class);
    }

    public function it_process_queued_message_with_mandrill(
        MandrillClient $mandrillClient,
        UserInviteEmailMessage $emailMessage,
        ResponseInterface $response,
        Stream $body
    ): void {
        $response = $this->initResponse($response, $body, 'queued', MandrillTransport::class);
        $emailMessage->getMandrillId()->willReturn('456');
        $mandrillClient->post('messages/info', ['id' => 456])->willReturn($response);
        $this->shouldThrow(
            new UserInviteMessageQueuedException(
                UserInviteMessageQueuedException::MESSAGE_DEFAULT_QUEUED
            )
        )->during('onStatusCheckInvitation', [$emailMessage, MandrillTransport::class]);
    }

    public function it_process_failed_message_with_mandrill(
        MandrillClient $mandrillClient,
        UserInviteEmailMessage $emailMessage,
        ResponseInterface $response,
        Stream $body,
        EntityManagerInterface $entityManager
    ): void {
        $response = $this->initResponse($response, $body, 'failed', MandrillTransport::class);
        $mandrillClient->post('messages/info', ['id' => 456])->willReturn($response);
        $emailMessage
            ->setInternalStatus(UserInviteEmailMessage::SEND_FAILURE)
            ->shouldBeCalled()
            ->willReturn($emailMessage);
        $emailMessage->getMandrillId()->willReturn('456');
        $emailMessage->getId()->willReturn('123');
        $entityManager->flush()->shouldBeCalled();
        $this->onStatusCheckInvitation($emailMessage, MandrillTransport::class);
    }

    private function initResponse(
        ResponseInterface $response,
        Stream $body,
        string $status,
        string $providerClass
    ): ResponseInterface {
        $bodyData = [];
        if (MailjetTransport::class === $providerClass) {
            $bodyData = ['Data' => [['Status' => $status]]];
        }

        if (MandrillTransport::class === $providerClass) {
            $bodyData = ['state' => $status];
        }
        $body->getContents()->willReturn(json_encode($bodyData));
        $response
            ->getBody()
            ->shouldBeCalled()
            ->willReturn($body);

        return $response->getWrappedObject();
    }
}
