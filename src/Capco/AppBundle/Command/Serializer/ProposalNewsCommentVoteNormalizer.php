<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProposalNewsCommentVoteNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_proposal_news_comment_vote';

    public function __construct(
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
        $variant = BaseNormalizer::getVariantFromContext($context);
        $isFullExport = ExportVariantsEnum::isFull($variant);

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

        $fullExportData[self::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME);

        return $this->translateHeaders(array_merge($fullExportData, array_keys($context['questionsResponses'])));
    }
}
