<?php
namespace Capco\AppBundle\Mailer\Message\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Mailer\Message\Message;

final class ProposalAknowledgeMessage extends Message
{
    public static function create(
        Proposal $proposal,
        string $recipentEmail,
        string $stepLink,
        string $proposalLink,
        string $homepageUrl,
        ?string $confirmationUrl = null,
        string $typeOfMail,
        string $recipientName = null
    ): self {
        return new self(
            $recipentEmail,
            $recipientName,
            'acknowledgment-of-receipt',
            static::getMySubjectVars(),
            '@CapcoMail/aknowledgeProposal.html.twig',
            static::getMyTemplateVars(
                $proposal,
                $recipentEmail,
                $stepLink,
                $proposalLink,
                $homepageUrl,
                $typeOfMail,
                $confirmationUrl
            )
        );
    }

    public function getFooterTemplate()
    {
    }

    public function getFooterVars()
    {
    }

    private static function getMyTemplateVars(
        Proposal $proposal,
        string $recipentEmail,
        string $stepLink,
        string $proposalLink,
        string $homepageUrl,
        string $typeOfMail,
        ?string $confirmationUrl
    ): array {
        return [
            'projectTitle' => self::escape(
                $proposal
                    ->getStep()
                    ->getProject()
                    ->getTitle()
            ),
            'projectLink' => $stepLink,
            'proposalLink' => $proposalLink,
            'confirmationUrl' => $confirmationUrl,
            'proposalPublished' => $proposal->isPublished(),
            'proposalName' => $proposal->getTitle(),
            'homepageUrl' => $homepageUrl,
            'typeOfMail' => $typeOfMail,
            'sendAt' =>
                'create' === $typeOfMail ? $proposal->getCreatedAt() : $proposal->getUpdatedAt(),
            'endAt' => $proposal->getStep()->getEndAt(),
            'to' => self::escape($recipentEmail),
            'username' => $proposal->getAuthor()->getDisplayName(),
            'timezone' => $proposal->getCreatedAt()->getTimezone(),
            'business' => 'Cap Collectif',
            'businessUrl' => 'https://cap-collectif.com/',
            'isTimeless' => $proposal->getStep()->isTimeless(),
        ];
    }

    private static function getMySubjectVars(): array
    {
        return [];
    }
}
