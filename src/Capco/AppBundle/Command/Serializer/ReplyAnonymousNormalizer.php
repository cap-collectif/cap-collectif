<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\ReplyAnonymous;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ReplyAnonymousNormalizer extends BaseNormalizer implements NormalizerInterface
{
    public function __construct(TranslatorInterface $translator)
    {
        parent::__construct($translator);
    }

    public function supportsNormalization($data, $format = null, array $context = []): bool
    {
        return isset($context[self::IS_EXPORT_NORMALIZER]) && $data instanceof ReplyAnonymous;
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $isFullExport = false;

        if ($context && isset($context['is_full_export'])) {
            $isFullExport = $context['is_full_export'];
        }

        /** @var ReplyAnonymous $object */
        $userArray = [
            self::EXPORT_PARTICIPANT_USER_ID => null,
            self::EXPORT_PARTICIPANT_USERNAME => null,
            self::EXPORT_PARTICIPANT_USER_EMAIL => $object->getParticipantEmail(),
            self::EXPORT_PARTICIPANT_CONSENT_INTERNAL_COMMUNICATION => $this->getReadableBoolean($object->isEmailConfirmed()),
            self::EXPORT_PARTICIPANT_PHONE => null,
            self::EXPORT_PARTICIPANT_TYPE => null,
            self::EXPORT_PARTICIPANT_FIRSTNAME => null,
            self::EXPORT_PARTICIPANT_LASTNAME => null,
            self::EXPORT_PARTICIPANT_DATE_OF_BIRTH => null,
            self::EXPORT_PARTICIPANT_POSTAL_ADDRESS => null,
            self::EXPORT_PARTICIPANT_ZIP_CODE => null,
            self::EXPORT_PARTICIPANT_CITY => null,
            self::EXPORT_PARTICIPANT_PROFILE_URL => null,
            self::EXPORT_PARTICIPANT_IDENTIFICATION_CODE => null,
        ];

        if ($isFullExport) {
            $fullExportData = [
                self::EXPORT_PARTICIPANT_USER_CREATED_AT => null,
                self::EXPORT_PARTICIPANT_USER_UPDATED_AT => null,
                self::EXPORT_PARTICIPANT_USER_LAST_LOGIN => null,
                self::EXPORT_PARTICIPANT_USER_ROLES_TEXT => null,
                self::EXPORT_PARTICIPANT_USER_ENABLED => null,
                self::EXPORT_PARTICIPANT_USER_IS_EMAIL_CONFIRMED => null,
                self::EXPORT_PARTICIPANT_USER_LOCKED => null,
                self::EXPORT_PARTICIPANT_USER_IS_PHONE_CONFIRMED => null,
                self::EXPORT_PARTICIPANT_GENDER => null,
                self::EXPORT_PARTICIPANT_WEBSITE_URL => null,
                self::EXPORT_PARTICIPANT_BIOGRAPHY => null,
                self::EXPORT_PARTICIPANT_IS_FRANCE_CONNECT_ASSOCIATED => null,
            ];

            $userArray = array_merge($userArray, $fullExportData);
        }

        return $this->translateHeaders($userArray);
    }
}
