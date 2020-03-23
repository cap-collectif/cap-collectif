<?php


namespace Capco\AppBundle\GraphQL\Mutation;


use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Enum\ContactProposalAuthorErrorCode;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ContactProposalAuthorMessage;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class ContactProposalAuthorMutation implements MutationInterface
{
    private $proposalRepository;
    private $mailerService;

    public function __construct(ProposalRepository $proposalRepository, MailerService $mailerService)
    {
        $this->proposalRepository = $proposalRepository;
        $this->mailerService = $mailerService;
    }

    public function __invoke(Argument $argument): array
    {
        $proposalId = $argument->offsetGet('proposalId');
        $proposal = $this->proposalRepository->find($proposalId);
        $errorLog = $this->getErrorLog($proposal);

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

    private function getErrorLog(?Proposal $proposal): ?string
    {
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
                'copyToAdmin' => true,
            ],
            $proposal->getAuthor()
        );
    }
}
