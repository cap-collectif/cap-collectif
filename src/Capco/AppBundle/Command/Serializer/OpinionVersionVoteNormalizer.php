<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\OpinionVersionVote;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OpinionVersionVoteNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_opinion_version_vote';

    public function __construct(
        TranslatorInterface $translator,
        private readonly OpinionNormalizer $opinionNormalizer
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
            && $data instanceof OpinionVersionVote
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $isFullExport = $context['is_full_export'] ?? null;
        $author = $object->getAuthor();
        $voteValue = OpinionVersionVote::$voteTypesLabels[$object->getValue()];

        $opinionVersionVoteArray = [
            self::EXPORT_CONTRIBUTION_VOTES_ID => $object->getId(),
            self::EXPORT_CONTRIBUTION_VOTES_AUTHOR_ID => $author?->getId(),
            self::EXPORT_CONTRIBUTION_VOTES_VALUE => $this->translator->trans($voteValue),
        ];

        if ($isFullExport) {
            $opinionVersionVoteArray = [
                self::EXPORT_CONTRIBUTION_VOTES_ID => $object->getId(),
                self::EXPORT_CONTRIBUTION_VOTES_AUTHOR_ID => $author?->getId(),
                self::EXPORT_CONTRIBUTION_VOTES_VALUE => $this->translator->trans($voteValue),
                self::EXPORT_CONTRIBUTION_VOTES_RELATED_ID => $object->getRelated()->getId(),
                self::EXPORT_CONTRIBUTION_VOTES_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
            ];
        }

        $opinionArray = $this->opinionNormalizer->normalize($object->getOpinionVersion()->getParent(), null, ['is_full_export' => $isFullExport, 'skip' => true]);
        $opinionVersionVoteArray[self::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME);

        return $this->translateHeaders(array_merge((array) $opinionArray, $opinionVersionVoteArray));
    }
}
