<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\PostAuthor;
use Capco\AppBundle\Entity\Proposal;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ProposalNewsNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private const EXPORT_CONTRIBUTION_TYPE_NAME = 'export_contribution_type_proposal_news';

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
            && $data instanceof Post
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $fullExportData = [];
        $isFullExport = false;

        if ($context && isset($context['is_full_export'])) {
            $isFullExport = $context['is_full_export'];
        }

        /** @var Post $object */
        $postAuthors = $object->getAuthors();
        $authorsValues = [];
        /** @var PostAuthor $postAuthor */
        foreach ($postAuthors as $postAuthor) {
            $author = $postAuthor->getAuthor();

            if (!$author instanceof User) {
                continue;
            }

            $authorsValues['id'][] = $postAuthor->getId();
            $authorsValues['username'][] = $postAuthor->getUsername();
            $authorsValues['isEmailConfirmed'][] = $this->getReadableBoolean($author->isEmailConfirmed());
            $authorsValues['userTypeId'][] = $author->getUserType()?->getId();
            $authorsValues['userTypeName'][] = $author->getUserType()?->getName();
        }

        if ([] !== $authorsValues) {
            $postAuthors = null;
            foreach ($authorsValues as $key => $value) {
                $postAuthors[$key] = implode(', ', $value);
            }
        }

        /** @var Proposal $proposal */
        $proposal = $object
            ->getProposals()
            ->filter(fn ($proposal) => $proposal->getId() === $object->proposalId)
            ->first()
        ;

        $proposalProject = $proposal->getProject();

        if ($isFullExport) {
            $fullExportData = [
                self::EXPORT_PROPOSAL_NEWS_ID => $object->getId(),
                self::EXPORT_PROPOSAL_NEWS_TITLE => $object->getTitle(),
                self::EXPORT_PROPOSAL_NEWS_THEMES => $proposal->getTheme(),
                self::EXPORT_PROPOSAL_NEWS_LINKED_PROJECTS => $proposalProject?->getTitle(),
                self::EXPORT_PROPOSAL_NEWS_LINKED_PROPOSAL => $proposal->getTitle(),
                self::EXPORT_PROPOSAL_NEWS_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_PROPOSAL_NEWS_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                self::EXPORT_PROPOSAL_NEWS_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
                self::EXPORT_PROPOSAL_NEWS_PUBLICATION_STATUS => $object->getIsPublished() ? 'Publié' : 'Non publié',
                self::EXPORT_PROPOSAL_NEWS_COMMENTABLE => $this->getReadableBoolean($object->isCommentable()),
                self::EXPORT_PROPOSAL_NEWS_DISPLAYED_ON_BLOG => $this->getReadableBoolean($object->isDisplayedOnBlog()),
                self::EXPORT_PROPOSAL_NEWS_AUTHORS_ID => $postAuthors['id'],
                self::EXPORT_PROPOSAL_NEWS_AUTHORS_USERNAME => $postAuthors['username'],
                self::EXPORT_PROPOSAL_NEWS_AUTHORS_IS_EMAIL_CONFIRMED => $postAuthors['isEmailConfirmed'],
                self::EXPORT_PROPOSAL_NEWS_AUTHORS_USER_TYPE_ID => $postAuthors['userTypeId'],
                self::EXPORT_PROPOSAL_NEWS_AUTHORS_USER_TYPE_NAME => $postAuthors['userTypeName'],
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
