<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Entity\Responses\AbstractResponse;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\GraphQL\Resolver\Type\FormattedValueResponseTypeResolver;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ReplyAnonymousNormalizer extends BaseNormalizer implements NormalizerInterface
{
    public function __construct(
        TranslatorInterface $translator,
        private readonly FormattedValueResponseTypeResolver $resolver
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
            && $data instanceof ReplyAnonymous
            && !isset($context['groups']);
    }

    /**
     * @param ReplyAnonymous       $object
     * @param null|string          $format
     * @param array<array<string>> $context
     *
     * @return array<string>
     */
    public function normalize($object, $format = null, array $context = []): array
    {
        $isFullExport = false;

        if ($context && isset($context['is_full_export'])) {
            $isFullExport = $context['is_full_export'];
        }

        /** @var ReplyAnonymous $object */
        $responseArray = [
            self::EXPORT_CONTRIBUTION_TYPE => $this->translator->trans(self::EXPORT_CONTRIBUTION_TYPE_REPLY_ANONYMOUS),
            self::EXPORT_CONTRIBUTION_ID => $object->getId(),
            self::EXPORT_CONTRIBUTION_AUTHOR_ID => null,
            self::EXPORT_CONTRIBUTION_PUBLISHED_AT => $this->getNullableDatetime($object->getPublishedAt()),
        ];

        if ($isFullExport) {
            $fullUserArray = [
                self::EXPORT_CONTRIBUTION_PUBLISHED => $this->getReadableBoolean($object->isPublished()),
                self::EXPORT_CONTRIBUTION_AUTHOR => null,
                self::EXPORT_CONTRIBUTION_AUTHOR_EMAIL => null,
                self::EXPORT_CONTRIBUTION_AUTHOR_PHONE => null,
                self::EXPORT_CONTRIBUTION_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
                self::EXPORT_CONTRIBUTION_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
                self::EXPORT_CONTRIBUTION_ANONYMOUS => $this->getReadableBoolean(false),
                self::EXPORT_CONTRIBUTION_DRAFT => $this->getReadableBoolean($object->isDraft()),
                self::EXPORT_CONTRIBUTION_UNDRAFT_AT => null,
                self::EXPORT_CONTRIBUTION_ACCOUNT => $this->getReadableBoolean($object->isEmailConfirmed()),
                self::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL => $object->getParticipantEmail(),
                self::EXPORT_CONTRIBUTION_NO_ACCOUNT_EMAIL_CONFIRMED => $this->getReadableBoolean($object->isEmailConfirmed()),
                self::EXPORT_CONTRIBUTION_INTERNAL_COMM => null,
            ];

            $responseArray = array_merge($responseArray, $fullUserArray);
        }

        /** @var AbstractResponse $response */
        foreach ($object->getResponses() as $response) {
            $question = $response->getQuestion();

            if (null === $question) {
                continue;
            }

            $responseArray[$question->getTitle()] =
                $response instanceof ValueResponse ?
                    $this->resolver->__invoke($response) :
                    null
            ;
        }

        return $this->translateHeaders($responseArray);
    }
}
