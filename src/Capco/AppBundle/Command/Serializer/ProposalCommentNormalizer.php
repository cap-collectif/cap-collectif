<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProposalCommentNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_proposal_comment';

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
            && $data instanceof ProposalComment
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $fullExportData = [];
        $variant = BaseNormalizer::getVariantFromContext($context);
        $isFullExport = ExportVariantsEnum::isFull($variant);

        $commentAuthor = $object->getAuthor();
        $commentUserType = null !== $commentAuthor ? $commentAuthor->getUserType() : null;

        if ($isFullExport) {
            $fullExportData = [
                self::EXPORT_PROPOSAL_COMMENTS_ID => $object->getId(),
                self::EXPORT_PROPOSAL_COMMENTS_BODY => $object->getBody(),
                self::EXPORT_PROPOSAL_COMMENTS_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_PROPOSAL_COMMENTS_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
                self::EXPORT_PROPOSAL_COMMENTS_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_ID => $commentAuthor?->getId(),
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_USERNAME => $commentAuthor?->getUsername(),
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_IS_EMAIL_CONFIRMED => null !== $commentAuthor ? $this->getReadableBoolean($commentAuthor->isEmailConfirmed()) : null,
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_USER_TYPE_ID => $commentUserType?->getId(),
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_USER_TYPE_NAME => $commentUserType?->getName(),
                self::EXPORT_PROPOSAL_COMMENTS_AUTHOR_EMAIL => $commentAuthor?->getEmail(),
                self::EXPORT_PROPOSAL_COMMENTS_PINNED => $this->getReadableBoolean($object->isPinned()),
                self::EXPORT_PROPOSAL_COMMENTS_PUBLICATION_STATUS => $object->isPublished() ? 'Publié' : 'Non publié',
            ];
        }

        $proposal = $object->getProposal();
        $proposalNormalized = $this->proposalNormalizer->normalize(
            $proposal,
            null,
            [
                'step' => $context['step'],
                BaseNormalizer::EXPORT_VARIANT => $variant,
                'questionsResponses' => $context['questionsResponses'],
            ]
        );
        $proposalNormalized[self::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME);

        return $this->translateHeaders(array_merge((array) $proposalNormalized, $fullExportData), array_keys($context['questionsResponses']));
    }
}
