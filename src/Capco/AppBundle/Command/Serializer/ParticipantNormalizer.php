<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\GraphQL\Resolver\User\UserRolesTextResolver;
use Capco\AppBundle\GraphQL\Resolver\User\UserUrlResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ParticipantNormalizer extends BaseNormalizer implements NormalizerInterface
{
    public function __construct(
        private readonly UserRolesTextResolver $userRolesTextResolver,
        private readonly UserUrlResolver $userUrlResolver,
        TranslatorInterface $translator
    ) {
        parent::__construct($translator);
    }

    /**
     * @param array<string, null|bool> $context
     * @param mixed                    $data
     * @param null|mixed               $format
     */
    public function supportsNormalization($data, $format = null, array $context = []): bool
    {
        return isset($context[self::IS_EXPORT_NORMALIZER]) && $data instanceof User && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        $isFullExport = false;
        if ($context && isset($context['is_full_export'])) {
            $isFullExport = $context['is_full_export'];
        }

        /** @var User $object */
        $userArray = [
            self::EXPORT_PARTICIPANT_USER_ID => $object->getId(),
            self::EXPORT_PARTICIPANT_USERNAME => $object->getUsername(),
            self::EXPORT_PARTICIPANT_USER_EMAIL => $object->getEmail(),
            self::EXPORT_PARTICIPANT_CONSENT_INTERNAL_COMMUNICATION => $this->getReadableBoolean($object->isConsentInternalCommunication()),
            self::EXPORT_PARTICIPANT_PHONE => $object->getPhone(),
            self::EXPORT_PARTICIPANT_TYPE => $object->getUserType() ? $object->getUserType()->getName() : '',
            self::EXPORT_PARTICIPANT_FIRSTNAME => $object->getFirstName(),
            self::EXPORT_PARTICIPANT_LASTNAME => $object->getLastName(),
            self::EXPORT_PARTICIPANT_DATE_OF_BIRTH => $object->getDateOfBirth() ? $object->getDateOfBirth()->format('Y-m-d H:i:s') : null,
            self::EXPORT_PARTICIPANT_POSTAL_ADDRESS => $object->getPostalAddress() ? $object->getPostalAddress()->getFormatted() : null,
            self::EXPORT_PARTICIPANT_ZIP_CODE => $object->getZipCode(),
            self::EXPORT_PARTICIPANT_CITY => $object->getCity(),
            self::EXPORT_PARTICIPANT_PROFILE_URL => $this->userUrlResolver->__invoke($object),
            self::EXPORT_PARTICIPANT_IDENTIFICATION_CODE => $object->getUserIdentificationCode() ? $object->getUserIdentificationCode()->getIdentificationCode() : null,
        ];

        if ($isFullExport) {
            $fullExportData = [
                self::EXPORT_PARTICIPANT_USER_CREATED_AT => $object->getCreatedAt() ? $object->getCreatedAt()->format('Y-m-d H:i:s') : null,
                self::EXPORT_PARTICIPANT_USER_UPDATED_AT => $object->getUpdatedAt() ? $object->getUpdatedAt()->format('Y-m-d H:i:s') : null,
                self::EXPORT_PARTICIPANT_USER_LAST_LOGIN => $object->getLastLogin() ? $object->getLastLogin()->format('Y-m-d H:i:s') : null,
                self::EXPORT_PARTICIPANT_USER_ROLES_TEXT => $this->userRolesTextResolver->resolve($object),
                self::EXPORT_PARTICIPANT_USER_ENABLED => $this->getReadableBoolean($object->isEnabled()),
                self::EXPORT_PARTICIPANT_USER_IS_EMAIL_CONFIRMED => $this->getReadableBoolean($object->isEmailConfirmed()),
                self::EXPORT_PARTICIPANT_USER_LOCKED => $this->getReadableBoolean($object->isLocked()),
                self::EXPORT_PARTICIPANT_USER_IS_PHONE_CONFIRMED => $this->getReadableBoolean($object->isPhoneConfirmed()),
                self::EXPORT_PARTICIPANT_GENDER => $object->getGender(),
                self::EXPORT_PARTICIPANT_WEBSITE_URL => $object->getWebsiteUrl(),
                self::EXPORT_PARTICIPANT_BIOGRAPHY => $object->getBiography(),
                self::EXPORT_PARTICIPANT_IS_FRANCE_CONNECT_ASSOCIATED => $this->getReadableBoolean($object->isFranceConnectAccount()),
            ];

            $userArray = array_merge($userArray, $fullExportData);
        }

        return $this->translateHeaders($userArray);
    }
}
