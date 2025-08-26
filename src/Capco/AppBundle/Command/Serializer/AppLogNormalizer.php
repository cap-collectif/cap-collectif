<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\AppLog;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class AppLogNormalizer extends BaseNormalizer implements NormalizerInterface
{
    public function __construct(TranslatorInterface $translator)
    {
        parent::__construct($translator);
    }

    /**
     * @param array<string, string> $context
     */
    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        return isset($context[self::IS_EXPORT_NORMALIZER]) && $data instanceof AppLog;
    }

    /**
     * @param mixed $object
     *
     * @return string[]
     */
    public function normalize($object, ?string $format = null, array $context = []): array
    {
        $logs = [
            self::EXPORT_APP_LOG_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
            self::EXPORT_APP_LOG_USER_USERNAME => $object->getUser()->getUsername(),
            self::EXPORT_APP_LOG_USER_EMAIL => $object->getUser()->getEmail(),
            self::EXPORT_APP_LOG_IP => $object->getIp(),
            self::EXPORT_APP_LOG_ACTION_TYPE => $object->getActionType(),
            self::EXPORT_APP_LOG_DESCRIPTION => $object->getDescription(),
        ];

        return $this->translateHeaders($logs);
    }
}
