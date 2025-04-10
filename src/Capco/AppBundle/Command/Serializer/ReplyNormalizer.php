<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\Media;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\MediaResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\GraphQL\Resolver\Media\MediaUrlResolver;
use Capco\AppBundle\GraphQL\Resolver\Type\FormattedValueResponseTypeResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ReplyNormalizer extends BaseNormalizer implements NormalizerInterface
{
    public function __construct(
        TranslatorInterface $translator,
        private readonly FormattedValueResponseTypeResolver $formattedValueResponseTypeResolver,
        private readonly MediaUrlResolver $mediaUrlResolver
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
            && $data instanceof Reply
            && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $isFullExport = false;

        if ($context && isset($context['is_full_export'])) {
            $isFullExport = $context['is_full_export'];
        }

        /** @var User $user */
        $user = $object->getAuthor();

        $responseArray = [
            self::EXPORT_CONTRIBUTION_TYPE => $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_REPLY),
            self::EXPORT_CONTRIBUTION_ID => $object->getId(),
            self::EXPORT_CONTRIBUTION_AUTHOR_ID => $user->getId(),
            self::EXPORT_CONTRIBUTION_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
        ];

        if ($isFullExport) {
            $fullUserArray = [
                self::EXPORT_CONTRIBUTION_PUBLISHED => $this->getReadableBoolean($object->isPublished()),
                self::EXPORT_CONTRIBUTION_AUTHOR => $user->getUsername(),
                self::EXPORT_CONTRIBUTION_AUTHOR_EMAIL => $user->getEmail(),
                self::EXPORT_CONTRIBUTION_AUTHOR_PHONE => $user->getPhone(),
                self::EXPORT_CONTRIBUTION_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_CONTRIBUTION_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                self::EXPORT_CONTRIBUTION_ANONYMOUS => $this->getReadableBoolean(false),
                self::EXPORT_CONTRIBUTION_DRAFT => $this->getReadableBoolean($object->isDraft()),
                self::EXPORT_CONTRIBUTION_UNDRAFT_AT => $this->getNullableDatetime($object->getUndraftAt()),
                self::EXPORT_CONTRIBUTION_ACCOUNT => $this->getReadableBoolean($user->isEmailConfirmed()),
                self::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL => '',
                self::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_CONFIRMED => '',
                self::EXPORT_CONTRIBUTION_INTERNAL_COMM => $this->getReadableBoolean($user->isConsentInternalCommunication()),
            ];

            $responseArray = array_merge($responseArray, $fullUserArray);
        }

        $keyCounters = [];

        /** @var AbstractResponse $response */
        foreach ($object->getResponses() as $response) {
            $questionTitle = $response->getQuestion()?->getTitle();
            if (null === $questionTitle) {
                continue;
            }

            if (!isset($keyCounters[$questionTitle])) {
                $keyCounters[$questionTitle] = 0;
            }

            if ($keyCounters[$questionTitle] > 0) {
                $questionTitle = sprintf('%s (%d)', $questionTitle, $keyCounters[$questionTitle]);
            }

            ++$keyCounters[$response->getQuestion()?->getTitle()];

            if ($response instanceof MediaResponse) {
                $mediaUrls = array_map(
                    fn (Media $media) => $this->mediaUrlResolver->__invoke($media),
                    $response->getMedias()->toArray()
                );
                $responseArray[$questionTitle] = implode(', ', $mediaUrls);
            } elseif ($response instanceof ValueResponse) {
                $responseArray[$questionTitle] = $this->formattedValueResponseTypeResolver->__invoke($response);
            } else {
                $responseArray[$questionTitle] = null;
            }
        }

        return $this->translateHeaders($responseArray);
    }
}
