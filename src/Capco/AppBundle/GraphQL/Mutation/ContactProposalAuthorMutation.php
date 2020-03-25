<?php


namespace Capco\AppBundle\GraphQL\Mutation;


use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ContactProposalAuthorErrorCode;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ContactProposalAuthorMessage;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Security\CaptchaChecker;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use ReCaptcha\ReCaptcha;
use Symfony\Component\HttpFoundation\RequestStack;

class ContactProposalAuthorMutation implements MutationInterface
{
    private $proposalRepository;
    private $mailerService;
    private $captchaChecker;

    public function __construct(
        ProposalRepository $proposalRepository,
        MailerService $mailerService,
        CaptchaChecker $captchaChecker
    ) {
        $this->proposalRepository = $proposalRepository;
        $this->mailerService = $mailerService;
        $this->captchaChecker = $captchaChecker;
    }

    public function __invoke(Argument $argument, RequestStack $requestStack): array
    {
        $proposalId = GlobalId::fromGlobalId($argument->offsetGet('proposalId'))['id'];
        $proposal = $this->proposalRepository->find($proposalId);
        $errorLog = $this->getErrorLog(
            $proposal,
            $argument->offsetGet('captcha'),
            $requestStack->getMasterRequest()->getClientIp()
        );

        if (is_null($errorLog)) {
            $this->sendContactMail(
                $proposal,
                $argument->offsetGet('senderName'),
                $argument->offsetGet('replyEmail'),
                $argument->offsetGet('message')
            );
        }

        return ["error" => $errorLog];
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
        return null;
    }

    private function sendContactMail(
        Proposal    $proposal,
        string      $senderName,
        string      $senderEmail,
        string      $message
    ): void {
        $this->mailerService->createAndSendMessage(
            ContactProposalAuthorMessage::class,
            $proposal,
            [
                'sender' => [
                    'name' => $senderName,
                    'email' => $senderEmail
                ],
                'senderMessage' => $message,
                //'copyToAdmin' => true, @todo uncomment when viewer can consent to this copy.
            ],
            $proposal->getAuthor()
        );
    }
}
