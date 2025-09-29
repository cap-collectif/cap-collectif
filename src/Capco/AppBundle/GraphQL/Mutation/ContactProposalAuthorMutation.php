<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalStatistics;
use Capco\AppBundle\Enum\ContactProposalAuthorErrorCode;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Mailer\MailerException;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ContactProposalAuthorMessage;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\CaptchaChecker;
use Capco\AppBundle\Utils\RequestGuesserInterface;
use Egulias\EmailValidator\EmailValidator;
use Egulias\EmailValidator\Validation\RFCValidation;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class ContactProposalAuthorMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly ProposalRepository $proposalRepository,
        private readonly MailerService $mailerService,
        private readonly CaptchaChecker $captchaChecker,
        private readonly EmailValidator $emailValidator,
        private readonly RequestGuesserInterface $requestGuesser
    ) {
    }

    public function __invoke(Argument $argument): array
    {
        $this->formatInput($argument);
        $proposal = $this->getProposal($argument);
        $errorLog = $this->getErrorLog(
            $proposal,
            $argument->offsetGet('captcha'),
            $this->requestGuesser->getClientIp()
        );

        if (null === $errorLog) {
            try {
                $this->sendContactMail(
                    $proposal,
                    $argument->offsetGet('senderName'),
                    $argument->offsetGet('replyEmail'),
                    $argument->offsetGet('message')
                );
            } catch (\Throwable) {
                $errorLog = ContactProposalAuthorErrorCode::SENDING_FAILED;
            }
        }

        return ['error' => $errorLog];
    }

    private function getErrorLog(?Proposal $proposal, string $captcha, string $ip): ?string
    {
        if (!$this->captchaChecker->__invoke($captcha, $ip)) {
            return ContactProposalAuthorErrorCode::INVALID_CAPTCHA;
        }
        if (!$proposal) {
            return ContactProposalAuthorErrorCode::NON_EXISTING_PROPOSAL;
        }
        if (!$proposal->getForm()->canContact()) {
            return ContactProposalAuthorErrorCode::NO_CONTACT_PROPOSAL;
        }
        if (
            !$this->emailValidator->isValid($proposal->getAuthor()->getEmail(), new RFCValidation())
        ) {
            return ContactProposalAuthorErrorCode::INVALID_EMAIL_AUTHOR;
        }

        return null;
    }

    private function sendContactMail(
        Proposal $proposal,
        string $senderName,
        string $senderEmail,
        string $message
    ): void {
        $sent = $this->mailerService->createAndSendMessage(
            ContactProposalAuthorMessage::class,
            $proposal,
            [
                'sender' => [
                    'name' => $senderName,
                    'email' => $senderEmail,
                ],
                'senderMessage' => $message,
                //'copyToAdmin' => true, @todo uncomment when viewer can consent to this copy.
            ],
            $proposal->getAuthor()
        );

        if (!$sent) {
            throw new MailerException('Le message n\'a pas pu être envoyé.');
        }

        if (!$proposal->getStatistics()) {
            $proposal->setStatistics(new ProposalStatistics(1));
        } else {
            $proposal->getStatistics()->incrementNbrOfMessagesSentToAuthor();
        }

        $this->proposalRepository->save($proposal);
    }

    private function getProposal(Argument $argument): ?Proposal
    {
        return $this->proposalRepository->find(
            GlobalId::fromGlobalId($argument->offsetGet('proposalId'))['id']
        );
    }
}
