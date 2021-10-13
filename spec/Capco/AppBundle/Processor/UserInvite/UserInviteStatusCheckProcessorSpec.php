<?php

namespace spec\Capco\AppBundle\Processor\UserInvite;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Exception\UserInviteMessageQueuedException;
use Capco\AppBundle\Mailer\SenderEmailDomains\MailjetClient;
use Capco\AppBundle\Mailer\SenderEmailDomains\MandrillClient;
use Capco\AppBundle\Mailer\Transport\MailjetTransport;
use Capco\AppBundle\Mailer\Transport\MandrillTransport;
use Capco\AppBundle\Processor\UserInvite\UserInviteStatusCheckProcessor;
use Capco\AppBundle\Repository\UserInviteRepository;
use Doctrine\ORM\EntityManagerInterface;
use GuzzleHttp\Psr7\Stream;
use PhpSpec\ObjectBehavior;
use Psr\Http\Message\ResponseInterface;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class UserInviteStatusCheckProcessorSpec extends ObjectBehavior
{
    public function let(
        EntityManagerInterface $entityManager,
        UserInviteRepository $repository,
        MailjetClient $mailjetClient,
        MandrillClient $mandrillClient,
        Publisher $publisher
    ): void {
        $this->beConstructedWith(
            $entityManager,
            $repository,
            $mailjetClient,
            $mandrillClient,
            $publisher
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(UserInviteStatusCheckProcessor::class);
    }

    public function it_process_sent_message_with_mailjet(
        MailjetClient $mailjetClient,
        UserInviteRepository $repository,
        UserInvite $userInvite,
        ResponseInterface $response,
        Stream $body,
        EntityManagerInterface $entityManager
    ): void {
        $message = $this->initObjects(
            $userInvite,
            $repository,
            $response,
            $body,
            MailjetTransport::class
        );
        $body->getContents()->willReturn(
            json_encode([
                'Data' => [['Status' => 'sent']],
            ])
        );
        $mailjetClient->get('message/456')->willReturn($response);
        $userInvite
            ->setInternalStatus(UserInvite::SENT)
            ->shouldBeCalled()
            ->willReturn($userInvite);
        $entityManager->flush()->shouldBeCalled();
        $this->process($message, []);
    }

    public function it_process_queued_message_with_mailjet(
        MailjetClient $mailjetClient,
        UserInviteRepository $repository,
        UserInvite $userInvite,
        ResponseInterface $response,
        Stream $body
    ): void {
        $message = $this->initObjects(
            $userInvite,
            $repository,
            $response,
            $body,
            MailjetTransport::class
        );
        $body->getContents()->willReturn(
            json_encode([
                'Data' => [['Status' => 'queued']],
            ])
        );
        $mailjetClient->get('message/456')->willReturn($response);
        $this->shouldThrow(
            new UserInviteMessageQueuedException(
                UserInviteMessageQueuedException::MESSAGE_DEFAULT_QUEUED
            )
        )->during('process', [$message, []]);
    }

    public function it_process_failed_message_with_mailjet(
        MailjetClient $mailjetClient,
        UserInviteRepository $repository,
        UserInvite $userInvite,
        ResponseInterface $response,
        Stream $body,
        EntityManagerInterface $entityManager
    ): void {
        $message = $this->initObjects(
            $userInvite,
            $repository,
            $response,
            $body,
            MailjetTransport::class
        );
        $body->getContents()->willReturn(
            json_encode([
                'Data' => [['Status' => 'bounced']],
            ])
        );
        $mailjetClient->get('message/456')->willReturn($response);
        $userInvite
            ->setInternalStatus(UserInvite::SEND_FAILURE)
            ->shouldBeCalled()
            ->willReturn($userInvite);
        $entityManager->flush()->shouldBeCalled();
        $this->process($message, []);
    }

    public function it_process_sent_message_with_mandrill(
        MandrillClient $mandrillClient,
        UserInviteRepository $repository,
        UserInvite $userInvite,
        ResponseInterface $response,
        Stream $body,
        EntityManagerInterface $entityManager
    ): void {
        $message = $this->initObjects(
            $userInvite,
            $repository,
            $response,
            $body,
            MandrillTransport::class
        );
        $body->getContents()->willReturn(
            json_encode([
                'state' => 'sent',
            ])
        );
        $mandrillClient->post('messages/info', ['id' => 456])->willReturn($response);
        $userInvite
            ->setInternalStatus(UserInvite::SENT)
            ->shouldBeCalled()
            ->willReturn($userInvite);
        $entityManager->flush()->shouldBeCalled();
        $this->process($message, []);
    }

    public function it_process_queued_message_with_mandrill(
        MandrillClient $mandrillClient,
        UserInviteRepository $repository,
        UserInvite $userInvite,
        ResponseInterface $response,
        Stream $body
    ): void {
        $message = $this->initObjects(
            $userInvite,
            $repository,
            $response,
            $body,
            MandrillTransport::class
        );
        $body->getContents()->willReturn(
            json_encode([
                'state' => 'queued',
            ])
        );
        $mandrillClient->post('messages/info', ['id' => 456])->willReturn($response);
        $this->shouldThrow(
            new UserInviteMessageQueuedException(
                UserInviteMessageQueuedException::MESSAGE_DEFAULT_QUEUED
            )
        )->during('process', [$message, []]);
    }

    public function it_process_failed_message_with_mandrill(
        MandrillClient $mandrillClient,
        UserInviteRepository $repository,
        UserInvite $userInvite,
        ResponseInterface $response,
        Stream $body,
        EntityManagerInterface $entityManager
    ): void {
        $message = $this->initObjects(
            $userInvite,
            $repository,
            $response,
            $body,
            MandrillTransport::class
        );
        $body->getContents()->willReturn(
            json_encode([
                'state' => 'failed',
            ])
        );
        $mandrillClient->post('messages/info', ['id' => 456])->willReturn($response);
        $userInvite
            ->setInternalStatus(UserInvite::SEND_FAILURE)
            ->shouldBeCalled()
            ->willReturn($userInvite);
        $entityManager->flush()->shouldBeCalled();
        $this->process($message, []);
    }

    private function initObjects(
        UserInvite $userInvite,
        UserInviteRepository $repository,
        ResponseInterface $response,
        Stream $body,
        string $transportClass
    ): Message {
        $message = new Message(json_encode(['id' => 123, 'provider' => $transportClass]));
        if (MailjetTransport::class === $transportClass) {
            $userInvite->getMailjetId()->willReturn(456);
        } else {
            $userInvite->getMandrillId()->willReturn(456);
        }
        $repository->find(123)->willReturn($userInvite);
        $response
            ->getBody()
            ->shouldBeCalled()
            ->willReturn($body);

        return $message;
    }
}
