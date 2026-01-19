<?php

namespace Capco\AppBundle\Command\Export\DataTransformer;

use Capco\AppBundle\Enum\ExportHeaders;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExportProposalVoteFullDataTransformer
{
    public function __construct(
        private readonly TranslatorInterface $translator,
    ) {
    }

    /**
     * @param array<string, mixed> $proposal
     *
     * @return array<string, mixed>
     */
    public function transformProposal(array $proposal): array
    {
        return $proposal;
    }

    /**
     * @param array<string, mixed>  $vote
     * @param array<string, string> $translatedKeys
     *
     * @return array<string, mixed>
     */
    public function transformVote(array $vote, string $contributionTypeTranslated, array $translatedKeys): array
    {
        return [
            $translatedKeys['created_at'] => $vote['created_at'],
            $translatedKeys['publishedAt'] => $vote['publishedAt'],
            $translatedKeys['published'] => $vote['published'],
            $translatedKeys['is_accounted'] => $vote['is_accounted'],
            $translatedKeys['private'] => $vote['private'],
            $translatedKeys['author_id'] => $vote['author_id'],
            $translatedKeys['author_username'] => $vote['author_username'],
            $translatedKeys['author_email_confirmed'] => $vote['author_email_confirmed'],
            $translatedKeys['author_phone_confirmed'] => $vote['author_phone_confirmed'],
            $translatedKeys['user_type_id'] => $vote['user_type_id'],
            $translatedKeys['user_type_name'] => $vote['user_type_name'],
            $translatedKeys['vote_id'] => $vote['vote_id'],
            $translatedKeys['ranking'] => $vote['position'] + 1,
            $translatedKeys['contribution_type'] => $contributionTypeTranslated,
        ];
    }

    /**
     * @return array<string, string>
     */
    public function getTranslatedKeys(): array
    {
        return [
            'created_at' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_CREATED_AT),
            'publishedAt' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_PUBLISHED_AT),
            'published' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_PUBLISHED),
            'is_accounted' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_ACCOUNTED),
            'private' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_ANONYMOUS),
            'author_id' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_ID),
            'author_username' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_USERNAME),
            'author_email_confirmed' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_IS_EMAIL_CONFIRMED),
            'author_phone_confirmed' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_IS_PHONE_CONFIRMED),
            'user_type_id' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_USER_TYPE_ID),
            'user_type_name' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_AUTHOR_USER_TYPE_NAME),
            'vote_id' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_ID),
            'ranking' => $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_RANKING),
            'contribution_type' => $this->translator->trans(ExportHeaders::EXPORT_CONTRIBUTION_TYPE),
        ];
    }
}
