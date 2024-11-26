<?php

namespace Capco\AppBundle\Command\Serializer;

use Capco\AppBundle\Entity\UserGroup;
use Capco\AppBundle\GraphQL\Resolver\User\UserRolesTextResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class UserNormalizer extends BaseNormalizer implements NormalizerInterface
{
    private readonly UserRolesTextResolver $userRolesTextResolver;

    public function __construct(
        UserRolesTextResolver $userRolesTextResolver,
        TranslatorInterface $translator
    ) {
        $this->userRolesTextResolver = $userRolesTextResolver;

        parent::__construct($translator);
    }

    public function supportsNormalization($data, $format = null, array $context = []): bool
    {
        return isset($context[self::IS_EXPORT_NORMALIZER]) && $data instanceof User && !isset($context['groups']);
    }

    public function normalize($object, $format = null, array $context = [])
    {
        /** @var User $object */
        $groups = implode(
            ', ',
            $object->getUserGroups()
                ->map(fn (UserGroup $userGroup) => $userGroup->getGroup()->getTitle())
                ->getValues()
        );

        $userArray = [
            self::EXPORT_PARTICIPANT_USER_ID => $object->getId(),
            self::EXPORT_PARTICIPANT_USERNAME => $object->getUsername(),
            self::EXPORT_PARTICIPANT_USER_EMAIL => $object->getEmail(),
            self::EXPORT_PARTICIPANT_USER_IS_EMAIL_CONFIRMED => $this->getReadableBoolean($object->isEmailConfirmed()),
            self::EXPORT_PARTICIPANT_USER_ROLES_TEXT => $this->userRolesTextResolver->resolve($object),
            self::EXPORT_PARTICIPANT_USER_CREATED_AT => $this->getNullableDatetime($object->getCreatedAt()),
            self::EXPORT_PARTICIPANT_USER_UPDATED_AT => $this->getNullableDatetime($object->getUpdatedAt()),
            self::EXPORT_PARTICIPANT_USER_LAST_LOGIN => $this->getNullableDatetime($object->getLastLogin()),
            self::EXPORT_PARTICIPANT_USER_ENABLED => $this->getReadableBoolean($object->isEnabled()),
            self::EXPORT_PARTICIPANT_CONFIRMED_ACCOUNT_AT => $this->getNullableDatetime($object->getConfirmedAccountAt()),
            self::EXPORT_PARTICIPANT_USER_GROUPS => $groups,
            self::EXPORT_PARTICIPANT_USER_LOCKED => $this->getReadableBoolean($object->isLocked()),
            self::EXPORT_PARTICIPANT_GENDER => $object->getGender(),
            self::EXPORT_PARTICIPANT_FIRSTNAME => $object->getFirstName(),
            self::EXPORT_PARTICIPANT_LASTNAME => $object->getLastName(),
            self::EXPORT_PARTICIPANT_DATE_OF_BIRTH => $this->getNullableDatetime($object->getDateOfBirth()),
            self::EXPORT_PARTICIPANT_WEBSITE_URL => $object->getWebsiteUrl(),
            self::EXPORT_PARTICIPANT_BIOGRAPHY => $object->getBiography(),
            self::EXPORT_PARTICIPANT_POSTAL_ADDRESS => $object->getPostalAddress() ? $object->getPostalAddress()->getFormatted() : null,
            self::EXPORT_PARTICIPANT_DELETED_ACCOUNT_AT => $this->getNullableDatetime($object->getDeletedAccountAt()),
            self::EXPORT_PARTICIPANT_FACEBOOK_ID => $object->getFacebookId(),
            self::EXPORT_PARTICIPANT_TYPE => $object->getUserType() ? $object->getUserType()->getName() : '',
            self::EXPORT_PARTICIPANT_CONSENT_INTERNAL_COMMUNICATION => $this->getReadableBoolean($object->isConsentInternalCommunication()),
            self::EXPORT_PARTICIPANT_CONSENT_EXTERNAL_COMMUNICATION => $this->getReadableBoolean($object->isConsentExternalCommunication()),
            self::EXPORT_PARTICIPANT_IDENTIFICATION_CODE => $object->getUserIdentificationCode() ? $object->getUserIdentificationCode()->getIdentificationCode() : null,
        ];

        return $this->translateHeaders($userArray);
    }
}
