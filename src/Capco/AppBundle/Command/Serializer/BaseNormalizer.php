<?php

namespace Capco\AppBundle\Command\Serializer;

use Symfony\Contracts\Translation\TranslatorInterface;

abstract class BaseNormalizer
{
    public const IS_EXPORT_NORMALIZER = 'is_export_normalizer';
    public const IS_FULL_EXPORT = 'is_full_export';
    protected const EXPORT_PARTICIPANT_USER_ID = 'export_participant_user_id';
    protected const EXPORT_PARTICIPANT_USERNAME = 'export_participant_username';
    protected const EXPORT_PARTICIPANT_USER_EMAIL = 'export_participant_user_email';
    protected const EXPORT_PARTICIPANT_PHONE = 'export_participant_phone';
    protected const EXPORT_PARTICIPANT_TYPE = 'export_participant_type';
    protected const EXPORT_PARTICIPANT_FIRSTNAME = 'export_participant_firstname';
    protected const EXPORT_PARTICIPANT_LASTNAME = 'export_participant_lastname';
    protected const EXPORT_PARTICIPANT_DATE_OF_BIRTH = 'export_participant_date_of_birth';
    protected const EXPORT_PARTICIPANT_POSTAL_ADDRESS = 'export_participant_postal_address';
    protected const EXPORT_PARTICIPANT_ZIP_CODE = 'export_participant_zip_code';
    protected const EXPORT_PARTICIPANT_CITY = 'export_participant_city';
    protected const EXPORT_PARTICIPANT_PROFILE_URL = 'export_participant_profile_url';
    protected const EXPORT_PARTICIPANT_IDENTIFICATION_CODE = 'export_participant_identification_code';
    protected const EXPORT_PARTICIPANT_USER_CREATED_AT = 'export_participant_user_created_at';
    protected const EXPORT_PARTICIPANT_USER_UPDATED_AT = 'export_participant_user_updated_at';
    protected const EXPORT_PARTICIPANT_USER_LAST_LOGIN = 'export_participant_user_last_login';
    protected const EXPORT_PARTICIPANT_USER_ROLES_TEXT = 'export_participant_user_roles_text';
    protected const EXPORT_PARTICIPANT_USER_ENABLED = 'export_participant_user_enabled';
    protected const EXPORT_PARTICIPANT_USER_IS_EMAIL_CONFIRMED = 'export_participant_user_is_email_confirmed';
    protected const EXPORT_PARTICIPANT_USER_LOCKED = 'export_participant_user_locked';
    protected const EXPORT_PARTICIPANT_USER_IS_PHONE_CONFIRMED = 'export_participant_user_is_phone_confirmed';
    protected const EXPORT_PARTICIPANT_CONSENT_INTERNAL_COMMUNICATION = 'export_participant_consent_internal_communication';
    protected const EXPORT_PARTICIPANT_GENDER = 'export_participant_gender';
    protected const EXPORT_PARTICIPANT_WEBSITE_URL = 'export_participant_website_url';
    protected const EXPORT_PARTICIPANT_BIOGRAPHY = 'export_participant_biography';
    protected const EXPORT_PARTICIPANT_IS_FRANCE_CONNECT_ASSOCIATED = 'export_participant_is_france_connect_associated';
    private TranslatorInterface $translator;

    public function __construct(
        TranslatorInterface $translator
    ) {
        $this->translator = $translator;
    }

    protected function getReadableBoolean(bool $value): string
    {
        return $value ? 'Oui' : 'Non';
    }

    protected function translateHeaders(array $array): array
    {
        $keys = array_keys($array);
        $translatedKeys = [];

        foreach ($keys as $key) {
            $translatedKeys[] = $this->translator->trans($key);
        }

        return array_combine($translatedKeys, $array);
    }
}
