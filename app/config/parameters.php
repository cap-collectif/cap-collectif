<?php

if (!function_exists('setOverridableParameter')) {
    function setOverridableParameter($container, $param, $default, $envVar)
    {
        $container->setParameter($param, getenv($envVar) ?: $default);
    }
}

// We use a database container in dev/test
setOverridableParameter($container, 'database_driver', 'pdo_mysql', 'SYMFONY_DATABASE_DRIVER');
setOverridableParameter($container, 'database_host', '127.0.0.1', 'SYMFONY_DATABASE_HOST');
setOverridableParameter($container, 'database_port', 3306, 'SYMFONY_DATABASE_PORT');
setOverridableParameter($container, 'database_name', 'symfony', 'SYMFONY_DATABASE_NAME');
setOverridableParameter($container, 'database_user', 'root', 'SYMFONY_DATABASE_USER');
setOverridableParameter($container, 'database_password', null, 'SYMFONY_DATABASE_PASSWORD');

setOverridableParameter($container, 'rabbitmq_login', 'guest', 'SYMFONY_RABBITMQ_LOGIN');
setOverridableParameter($container, 'rabbitmq_password', 'guest', 'SYMFONY_RABBITMQ_PASSWORD');

setOverridableParameter($container, 'saml_sp', 'oda', 'SYMFONY_SAML_SP');

// We use an elasticsearch container in dev/test
setOverridableParameter($container, 'elasticsearch_host', '127.0.0.1', 'SYMFONY_ELASTICSEARCH_HOST');

// We use a redis container in dev/test
setOverridableParameter($container, 'redis_host', '127.0.0.1', 'SYMFONY_REDIS_HOST');

// We use mailcatcher in dev/test
setOverridableParameter($container, 'mailer_user', null, 'SYMFONY_MAILER_USER');
setOverridableParameter($container, 'mailer_password', null, 'SYMFONY_MAILER_PASSWORD');
setOverridableParameter($container, 'mailer_host', 'mailcatchersmtp', 'SYMFONY_MAILER_HOST');
setOverridableParameter($container, 'mailer_port', 25, 'SYMFONY_MAILER_PORT');

setOverridableParameter($container, 'locale', 'fr', 'SYMFONY_LOCALE');
setOverridableParameter($container, 'secret', '***REMOVED***', 'SYMFONY_SECRET');
setOverridableParameter($container, 'use_assetic_controller', true, 'SYMFONY_USE_ASSETIC_CONTROLLER');

// Social credentials
setOverridableParameter($container, 'facebook_app_id', '***REMOVED***', 'SYMFONY_FACEBOOK_APP_ID');
setOverridableParameter($container, 'facebook_app_secret', '***REMOVED***', 'SYMFONY_FACEBOOK_APP_SECRET');
setOverridableParameter($container, 'google_app_id', '***REMOVED***', 'SYMFONY_GOOGLE_APP_ID');
setOverridableParameter($container, 'google_app_secret', '***REMOVED***', 'SYMFONY_GOOGLE_APP_SECRET');

setOverridableParameter($container, 'jwt_token_ttl', 86400, 'SYMFONY_JWT_TOKEN_TTL');
setOverridableParameter($container, 'language_analyzer', 'french', 'SYMFONY_LANGUAGE_ANALYZER');
setOverridableParameter($container, 'remember_secret', '***REMOVED***', 'SYMFONY_REMEMBER_SECRET');

// Used to fix URLs when indexing in ES
setOverridableParameter($container, 'router.request_context.host', 'capco.dev', 'SYMFONY_ROUTER__REQUEST_CONTEXT__HOST');
setOverridableParameter($container, 'router.request_context.scheme', 'http', 'SYMFONY_ROUTER__REQUEST_CONTEXT__SCHEME');

// set at every deployment
setOverridableParameter($container, 'assets_version', 'v1', 'SYMFONY_ASSETS_VERSION');

setOverridableParameter($container, 'recaptcha_private_key', '***REMOVED***', 'SYMFONY_RECAPTCHA_PRIVATE_KEY');

// Twilio test credentials (no charge)
setOverridableParameter($container, 'twilio_sid', '***REMOVED***', 'SYMFONY_TWILIO_SID');
setOverridableParameter($container, 'twilio_token', '***REMOVED***', 'SYMFONY_TWILIO_TOKEN');
setOverridableParameter($container, 'twilio_number', '+***REMOVED***', 'SYMFONY_TWILIO_NUMBER');

// Disable mail delivery
setOverridableParameter($container, 'disable_mail_delivery', 'false', 'SYMFONY_DISABLE_MAIL_DELIVERY');

$container->setParameter('sonata.media.thumbnail.liip_imagine', 'Capco\MediaBundle\Thumbnail\LiipImagineThumbnail');
$container->setParameter('google_maps_key', '***REMOVED***');
$container->setParameter('loco_key', '5TYY2LOJxU7WgnDpreCQYXkXLAS_hsDII');

// This key is used for server to server call
// There are a restriction on IP
$container->setParameter('google_maps_key_server', '***REMOVED***');
