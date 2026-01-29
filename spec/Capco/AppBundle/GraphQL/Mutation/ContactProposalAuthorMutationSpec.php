<?php

namespace spec\Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\ProposalStatistics;
use Capco\AppBundle\Enum\ContactProposalAuthorErrorCode;
use Capco\AppBundle\GraphQL\Mutation\ContactProposalAuthorMutation;
use Capco\AppBundle\Mailer\Exception\MailerExternalServiceException;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ContactProposalAuthorMessage;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\CaptchaChecker;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Capco\Tests\phpspec\MockHelper\GraphQLMock;
use Capco\UserBundle\Entity\User;
use Egulias\EmailValidator\EmailValidator;
use Egulias\EmailValidator\Validation\RFCValidation;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use PhpSpec\ObjectBehavior;
use PhpSpec\Wrapper\Collaborator;

class ContactProposalAuthorMutationSpec extends ObjectBehavior
{
    use GraphQLMock;

    public function let(
        ProposalRepository $proposalRepository,
        MailerService $mailerService,
        CaptchaChecker $captchaChecker,
        EmailValidator $emailValidator,
        RequestGuesserInterface $requestGuesser,
        ProposalForm $form,
        Proposal $proposal,
        User $user
    ): void {
        $ip = '0.0.0.1';
        $requestGuesser->getClientIp()->willReturn($ip);
        $captchaChecker->__invoke('fake-captcha', $ip)->willReturn(true);
        $proposal->getForm()->willReturn($form);
        $proposal->getAuthor()->willReturn($user);
        $form->canContact()->willReturn(true);
        $user->getEmail()->willReturn('fake-email');
        $proposalRepository->find(GlobalId::fromGlobalId('fake-id')['id'])->willReturn($proposal);
        $emailValidator->isValid('fake-email', new RFCValidation())->willReturn(true);

        $this->beConstructedWith(
            $proposalRepository,
            $mailerService,
            $captchaChecker,
            $emailValidator,
            $requestGuesser
        );
    }

    public function it_is_initializable(): void
    {
        $this->shouldHaveType(ContactProposalAuthorMutation::class);
    }

    public function it_should_return_an_error_if_the_proposal_does_not_exist(
        ProposalRepository $proposalRepository,
        Argument $argument
    ): void {
        $this->getMockedGraphQLArgumentFormatted($argument);

        $argument = $this->mockArguments($argument);
        $proposalRepository->find(GlobalId::fromGlobalId('fake-id')['id'])->willReturn(null);

        $this->__invoke($argument)->shouldReturn(['error' => ContactProposalAuthorErrorCode::NON_EXISTING_PROPOSAL]);
    }

    public function it_should_return_an_error_if_the_captcha_is_invalid(
        Argument $argument,
        CaptchaChecker $captchaChecker
    ): void {
        $this->getMockedGraphQLArgumentFormatted($argument);

        $argument = $this->mockArguments($argument);
        $captchaChecker->__invoke('fake-captcha', '0.0.0.1')->willReturn(false);

        $this->__invoke($argument)->shouldReturn(['error' => ContactProposalAuthorErrorCode::INVALID_CAPTCHA]);
    }

    public function it_should_return_an_error_if_author_cannot_be_contacted(
        Argument $argument,
        Proposal $proposal,
        ProposalForm $form
    ): void {
        $this->getMockedGraphQLArgumentFormatted($argument);

        $argument = $this->mockArguments($argument);
        $proposal->getForm()->willReturn($form);
        $form->canContact()->willReturn(false);

        $this->__invoke($argument)->shouldReturn(['error' => ContactProposalAuthorErrorCode::NO_CONTACT_PROPOSAL]);
    }

    public function it_should_return_an_error_if_the_email_is_invalid(
        Argument $argument,
        EmailValidator $emailValidator
    ): void {
        $this->getMockedGraphQLArgumentFormatted($argument);

        $argument = $this->mockArguments($argument);

        $emailValidator->isValid('fake-email', new RFCValidation())->willReturn(false);

        $this->__invoke($argument)->shouldReturn(['error' => ContactProposalAuthorErrorCode::INVALID_EMAIL_AUTHOR]);
    }

    public function it_should_return_an_error_if_the_email_cannot_be_sent(
        Argument $argument,
        Proposal $proposal,
        User $user,
        MailerService $mailerService
    ): void {
        $this->getMockedGraphQLArgumentFormatted($argument);

        $argument = $this->mockArguments($argument);

        $mailerService->createAndSendMessage(ContactProposalAuthorMessage::class, $proposal, [
            'sender' => [
                'name' => 'fake-sender-name',
                'email' => 'fake-email',
            ],
            'senderMessage' => 'fake-message',
        ], $user)->willThrow(new MailerExternalServiceException());

        $this->__invoke($argument)->shouldReturn(['error' => ContactProposalAuthorErrorCode::SENDING_FAILED]);
    }

    public function it_should_attach_statistics_to_proposal_on_first_message_sent(
        Argument $argument,
        Proposal $proposal,
        ProposalRepository $proposalRepository,
        User $user,
        MailerService $mailerService
    ): void {
        $this->getMockedGraphQLArgumentFormatted($argument);

        $argument = $this->mockArguments($argument);
        $proposal->getStatistics()->willReturn(null);
        $proposal->setStatistics(new ProposalStatistics(1))->shouldBeCalled();
        $proposalRepository->save($proposal)->shouldBeCalled()->willReturn(true);
        $mailerService->createAndSendMessage(ContactProposalAuthorMessage::class, $proposal, [
            'sender' => [
                'name' => 'fake-sender-name',
                'email' => 'fake-email',
            ],
            'senderMessage' => 'fake-message',
        ], $user)->willReturn(true);

        $this->__invoke($argument)->shouldReturn(['error' => null]);
    }

    public function it_should_increment_number_of_message_sent_if_statistics_already_set(
        Argument $argument,
        Proposal $proposal,
        ProposalRepository $proposalRepository,
        User $user,
        MailerService $mailerService,
        ProposalStatistics $statistics
    ): void {
        $this->getMockedGraphQLArgumentFormatted($argument);

        $argument = $this->mockArguments($argument);
        $proposal->getStatistics()->willReturn($statistics);
        $statistics->incrementNbrOfMessagesSentToAuthor()->shouldBeCalled();
        $proposalRepository->save($proposal)->shouldBeCalled()->willReturn(true);
        $mailerService->createAndSendMessage(ContactProposalAuthorMessage::class, $proposal, [
            'sender' => [
                'name' => 'fake-sender-name',
                'email' => 'fake-email',
            ],
            'senderMessage' => 'fake-message',
        ], $user)->willReturn(true);

        $this->__invoke($argument)->shouldReturn(['error' => null]);
    }

    /**
     * @return Collaborator&Argument
     */
    private function mockArguments(Argument $argument)
    {
        $argument->offsetGet('proposalId')->willReturn('fake-id');
        $argument->offsetGet('captcha')->willReturn('fake-captcha');
        $argument->offsetGet('senderName')->willReturn('fake-sender-name');
        $argument->offsetGet('replyEmail')->willReturn('fake-email');
        $argument->offsetGet('message')->willReturn('fake-message');

        return $argument;
    }
}
