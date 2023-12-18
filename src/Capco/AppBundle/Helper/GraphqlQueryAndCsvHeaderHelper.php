<?php

namespace Capco\AppBundle\Helper;

class GraphqlQueryAndCsvHeaderHelper
{
    public const CONTRIBUTOR_FRAGMENT = '
        id
        email
        lastname
        firstname
        phone
        phoneConfirmed
        postalAddress {
          formatted
        }
        dateOfBirth
        userIdentificationCode
        createdAt
    ';

    public const USER_FRAGMENT = '
    username
    userType {
      name
    }
    updatedAt
    lastLogin
    rolesText
    consentInternalCommunication
    enabled
    isEmailConfirmed
    locked
    gender
    websiteUrl
    biography
    address
    zipCode
    city
    url
    isFranceConnectAccount
';

    public const USER_HEADERS = [
        'user_id',
        'user_email',
        'user_userName',
        'user_TypeName',
        'user_createdAt',
        'user_updatedAt',
        'user_lastLogin',
        'user_rolesText',
        'user_consentInternalCommunication',
        'user_enabled',
        'user_isEmailConfirmed',
        'user_locked',
        'user_phoneConfirmed',
        'user_gender',
        'user_websiteUrl',
        'user_biography',
        'user_zipCode',
        'user_city',
        'user_firstname',
        'user_lastname',
        'user_dateOfBirth',
        'user_postalAddress',
        'user_isFranceConnectAssociated',
        'user_phone',
        'user_profileUrl',
        'userIdentificationCode',
    ];

    public const USER_HEADERS_EVENTS = [
        'user_id',
        'user_email',
        'user_userName',
        'user_TypeName',
        'event_RegisteredOn',
        'event_privateRegistration',
        'user_createdAt',
        'user_updatedAt',
        'user_lastLogin',
        'user_rolesText',
        'user_consentExternalCommunication',
        'user_enabled',
        'user_isEmailConfirmed',
        'user_locked',
        'user_phoneConfirmed',
        'user_gender',
        'user_dateOfBirth',
        'user_websiteUrl',
        'user_biography',
        'user_address',
        'user_zipCode',
        'user_city',
        'user_phone',
        'user_profileUrl',
    ];

    public const USER_TYPE_INFOS_FRAGMENT = <<<'EOF'
        fragment userTypeInfos on UserType {
          id
          name
        }
        EOF;
    public const AUTHOR_INFOS_FRAGMENT = <<<'EOF'
        fragment authorInfos on User {
          id
          username
          isEmailConfirmed
          phoneConfirmed
          email
          userType {
            ...userTypeInfos
          }
        }
        EOF;

    public const AUTHOR_INFOS_ANONYMOUS_FRAGMENT = <<<'EOF'
        fragment authorInfos on User {
          id
          username
          userType {
            ...userTypeInfos
          }
        }
        EOF;
}
