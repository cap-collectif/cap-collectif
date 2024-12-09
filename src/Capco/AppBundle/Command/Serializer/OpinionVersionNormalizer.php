<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class OpinionVersionNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_opinion_version';

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
            && $data instanceof OpinionVersion
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $isFullExport = $context['is_full_export'] ?? null;
        $author = $object->getAuthor();
        $votes = $object->getVotes();

        $opinionVersionArrayFisrtPart = [
            self::EXPORT_CONTRIBUTION_VERSIONS_ID => $object->getId(),
            self::EXPORT_CONTRIBUTION_VERSIONS_AUTHOR_ID => null !== $author ? $author->getId() : null,
            self::EXPORT_CONTRIBUTION_VERSIONS_TITLE => $object->getTitle(),
            self::EXPORT_CONTRIBUTION_VERSIONS_EXPLANATION => $object->getComment(),
            self::EXPORT_CONTRIBUTION_VERSIONS_BODY_TEXT => $object->getBodyText(),
        ];

        $opinionVersionArrayLastPart = [
            self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT => null !== $votes ? $votes->count() : null,
            self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_OK => $this->getVoteCountPerOpinionVersion(
                $object,
                $object->getStep(),
                OpinionVersionVote::VOTE_OK
            ),
            self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_MITIGE => $this->getVoteCountPerOpinionVersion(
                $object,
                $object->getStep(),
                OpinionVersionVote::VOTE_MITIGE
            ),
            self::EXPORT_CONTRIBUTION_VERSIONS_VOTES_COUNT_NOK => $this->getVoteCountPerOpinionVersion(
                $object,
                $object->getStep(),
                OpinionVersionVote::VOTE_NOK
            ),
        ];

        $opinionVersionArray = $isFullExport
            ? array_merge(
                $opinionVersionArrayFisrtPart,
                [
                    self::EXPORT_CONTRIBUTION_VERSIONS_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                    self::EXPORT_CONTRIBUTION_VERSIONS_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                ],
                $opinionVersionArrayLastPart
            )
            : array_merge($opinionVersionArrayFisrtPart, $opinionVersionArrayLastPart);

        $opinionArray = $this->opinionNormalizer->normalize($object->getParent(), null, ['is_full_export' => $isFullExport, 'skip' => true]);
        $opinionVersionArray[self::EXPORT_CONTRIBUTION_TYPE] = $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_NAME);

        return $this->translateHeaders(array_merge((array) $opinionArray, $opinionVersionArray));
    }

    private function getVoteCountPerOpinionVersion(OpinionVersion $opinionVersion, ConsultationStep $consultationStep, int $filterValue): int
    {
        $filterClosure = fn (OpinionVersionVote $vote) => null !== $vote->getStep()
            && $vote->getStep()->getId() === $consultationStep->getId()
            && $vote->getIsAccounted()
            && ($vote->getValue() === $filterValue);

        return $opinionVersion->getVotes()->filter($filterClosure)->count();
    }
}
