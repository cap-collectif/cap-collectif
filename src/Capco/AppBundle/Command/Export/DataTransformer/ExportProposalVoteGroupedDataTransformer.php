<?php

namespace Capco\AppBundle\Command\Export\DataTransformer;

use Capco\AppBundle\Entity\Steps\ProposalStepInterface;
use Capco\AppBundle\Enum\ExportHeaders;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\AppBundle\Service\CsvDataFormatter;
use Symfony\Contracts\Translation\TranslatorInterface;

class ExportProposalVoteGroupedDataTransformer
{
    public function __construct(
        private readonly TranslatorInterface $translator,
        private readonly CsvDataFormatter $csvDataFormatter,
        private readonly UserUrlResolver $userUrlResolver,
    ) {
    }

    /**
     * @param array<string, mixed> $proposal
     *
     * @return array<string, mixed>
     */
    public function transformProposal(array $proposal): array
    {
        $proposalHeadersToKeep = array_flip(array_map(
            fn ($header) => $this->translator->trans($header),
            [
                ExportHeaders::EXPORT_PROPOSAL_REFERENCE,
                ExportHeaders::EXPORT_PROPOSAL_TITLE,
                ExportHeaders::EXPORT_PROPOSAL_LINK,
            ]
        ));

        return array_intersect_key($proposal, $proposalHeadersToKeep);
    }

    /**
     * @param array<string, mixed>                                            $vote
     * @param array{votes: array<string, int>, proposals: array<string, int>} $userStats
     * @param array<string, string>                                           $translatedKeys
     *
     * @return array<string, mixed>
     */
    public function transformVote(array $vote, string $contributionTypeTranslated, ProposalStepInterface $step, array $userStats, array $translatedKeys): array
    {
        $authorId = $vote['author_id'];

        $data = [
            $translatedKeys['author_id'] => $authorId,
            $translatedKeys['author_username'] => $vote['author_username'],
            $translatedKeys['author_email'] => $vote['author_email'],
            $translatedKeys['author_consent'] => $this->csvDataFormatter->getReadableBoolean($vote['author_consent_internal_communication']),
            $translatedKeys['author_phone'] => $vote['author_phone'],
            $translatedKeys['user_type_name'] => $vote['user_type_name'],
            $translatedKeys['author_firstname'] => $vote['author_firstname'],
            $translatedKeys['author_lastname'] => $vote['author_lastname'],
            $translatedKeys['author_date_of_birth'] => $vote['author_date_of_birth'],
            $translatedKeys['author_postal_address'] => $vote['author_postal_address'],
            $translatedKeys['author_zip_code'] => $vote['author_zip_code'],
            $translatedKeys['author_city'] => $vote['author_city'],
            $translatedKeys['author_profile_url'] => $this->userUrlResolver->getBySlug($vote['author_slug']),
            $translatedKeys['author_identification_code'] => $vote['author_identification_code'],
            $translatedKeys['author_total_proposals'] => $userStats['proposals'][$authorId] ?? 0,
            $translatedKeys['contribution_type'] => $contributionTypeTranslated,
        ];

        if ($step->isVotable()) {
            $data[$translatedKeys['author_total_votes']] = $userStats['votes'][$authorId] ?? 0;
            $data[$translatedKeys['vote_id']] = $vote['vote_id'];
            $data[$translatedKeys['ranking']] = $vote['position'] + 1;
            $data[$translatedKeys['created_at']] = $vote['created_at'];
            $data[$translatedKeys['publishedAt']] = $vote['publishedAt'];
            $data[$translatedKeys['published']] = $vote['published'];
        }

        return $data;
    }

    /**
     * @return array<string, string>
     */
    public function getTranslatedKeys(ProposalStepInterface $step): array
    {
        $keys = [
            'author_id' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_USER_ID),
            'author_username' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_USERNAME),
            'author_email' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_USER_EMAIL),
            'author_consent' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_CONSENT_INTERNAL_COMMUNICATION),
            'author_phone' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_PHONE),
            'user_type_name' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_TYPE),
            'author_firstname' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_FIRSTNAME),
            'author_lastname' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_LASTNAME),
            'author_date_of_birth' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_DATE_OF_BIRTH),
            'author_postal_address' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_POSTAL_ADDRESS),
            'author_zip_code' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_ZIP_CODE),
            'author_city' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_CITY),
            'author_profile_url' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_PROFILE_URL),
            'author_identification_code' => $this->translator->trans(ExportHeaders::EXPORT_PARTICIPANT_IDENTIFICATION_CODE),
            'author_total_proposals' => $this->translator->trans(ExportHeaders::EXPORT_USER_TOTAL_PROPOSALS),
            'contribution_type' => $this->translator->trans(ExportHeaders::EXPORT_CONTRIBUTION_TYPE),
        ];

        if ($step->isVotable()) {
            $keys['author_total_votes'] = $this->translator->trans(ExportHeaders::EXPORT_USER_TOTAL_VOTES);
            $keys['vote_id'] = $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_ID);
            $keys['ranking'] = $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_RANKING);
            $keys['created_at'] = $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_CREATED_AT);
            $keys['publishedAt'] = $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_PUBLISHED_AT);
            $keys['published'] = $this->translator->trans(ExportHeaders::EXPORT_PROPOSAL_VOTES_PUBLISHED);
        }

        return $keys;
    }
}
