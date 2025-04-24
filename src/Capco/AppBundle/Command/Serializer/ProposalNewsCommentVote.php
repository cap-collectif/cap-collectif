<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\CommentVote;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProposalNewsCommentVote extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_proposal_news_comment_vote';

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
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $fullExportData = [];
        $isFullExport = $context['is_full_export'] ?? false;

        $author = $object->getAuthor();
        $userType = $author?->getUserType();
        if ($isFullExport) {
            $fullExportData = [
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_ID => $object->getId(),
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_ID => $author?->getId(),
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USERNAME => $author?->getUsername(),
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_IS_EMAIL_CONFIRMED => $author?->isEmailConfirmed(),
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USER_TYPE_ID => $userType?->getId(),
                self::EXPORT_PROPOSAL_NEWS_COMMENTS_VOTE_AUTHOR_USER_TYPE_NAME => $userType?->getName(),
            ];
        }

        $proposalNormalized = $this->proposalNormalizer->normalize(
            $context['proposal'],
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
