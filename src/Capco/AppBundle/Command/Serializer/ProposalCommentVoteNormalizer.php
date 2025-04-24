<?php

declare(strict_types=1);

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\ProposalComment;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProposalCommentVoteNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_proposal_comment_vote';

    public function __construct(
        private readonly ProposalNormalizer $proposalNormalizer,
        TranslatorInterface $translator
    ) {
        parent::__construct($translator);
    }

    /**
     * @param array<string, null|bool|string> $context
     * @param mixed                           $data
     * @param null|mixed                      $format
     */
    public function supportsNormalization($data, $format = null, array $context = []): bool
    {
        return isset($context[self::IS_EXPORT_NORMALIZER])
            && $data instanceof CommentVote
            && $data->getRelated() instanceof ProposalComment
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $fullExportData = [];
        $isFullExport = $context['is_full_export'] ?? false;

        $commentAuthor = $object->getAuthor();
        $commentAuthorUserType = $commentAuthor?->getUserType();

        if ($isFullExport) {
            $fullExportData = [
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_ID => $object->getId(),
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_ID => $commentAuthor?->getId(),
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USERNAME => $commentAuthor?->getUsername(),
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_IS_EMAIL_CONFIRMED => null !== $commentAuthor ? $this->getReadableBoolean($commentAuthor->isEmailConfirmed()) : null,
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USER_TYPE_ID => $commentAuthorUserType ? $commentAuthorUserType->getId() : null,
                self::EXPORT_PROPOSAL_COMMENTS_VOTE_AUTHOR_USER_TYPE_NAME => $commentAuthorUserType ? $commentAuthorUserType->getName() : null,
            ];
        }

        $proposal = $object->getProposal();
        $proposalNormalized = $this->proposalNormalizer->normalize(
            $proposal,
            null,
            [
                'step' => $context['step'],
                'is_full_export' => $isFullExport,
                'questionsResponses' => $context['questionsResponses'],
            ]
        );
        $proposalNormalized[self::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME);

        return $this->translateHeaders(array_merge((array) $proposalNormalized, $fullExportData), array_keys($context['questionsResponses']));
    }
}
