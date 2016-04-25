<?php

if (!function_exists('getenv_default')) {
    function getenv_default($key, $default = null)
    {
        return getenv('SYMFONY_'.strtoupper(str_replace('.', '__', $key))) ?: $default;
    }
}

$container->setParameter('database_driver', getenv_default('database_driver', 'pdo_mysql'));
$container->setParameter('database_host', getenv_default('database_host', '127.0.0.1'));
$container->setParameter('database_port', getenv_default('database_port', 3306));
$container->setParameter('database_name', getenv_default('database_name', 'symfony'));
$container->setParameter('database_user', getenv_default('database_user', 'root'));
$container->setParameter('database_password', null);
$container->setParameter('elasticsearch_host', getenv_default('elasticsearch_host', '127.0.0.1'));
$container->setParameter('redis_host', getenv_default('redis_host', '127.0.0.1'));

$container->setParameter('mailer_user', getenv_default('mailer_user', null));
$container->setParameter('mailer_password', getenv_default('mailer_password', null));
$container->setParameter('mailer_host', getenv_default('mailer_host', 'mailcatchersmtp'));
$container->setParameter('mailer_port', getenv_default('mailer_port', 25));

$container->setParameter('locale', getenv_default('locale', 'fr'));
$container->setParameter('secret', getenv_default('secret', '***REMOVED***'));
$container->setParameter('use_assetic_controller', getenv_default('use_assetic_controller', true));

$container->setParameter('facebook_app_id', getenv_default('facebook_app_id', '***REMOVED***'));
$container->setParameter('facebook_app_secret', getenv_default('facebook_app_secret', '***REMOVED***'));
$container->setParameter('google_app_id', getenv_default('google_app_id', '***REMOVED***'));
$container->setParameter('google_app_secret', getenv_default('google_app_secret', '***REMOVED***'));

$container->setParameter('shield_login', getenv_default('shield_login', '***REMOVED***'));
$container->setParameter('shield_pwd', getenv_default('shield_pwd', '***REMOVED***'));

$container->setParameter('jwt_private_key_path', getenv_default('jwt_private_key_path', '%kernel.root_dir%/var/jwt/private.pem'));
$container->setParameter('jwt_public_key_path', getenv_default('jwt_public_key_path', '%kernel.root_dir%/var/jwt/public.pem'));
$container->setParameter('jwt_key_pass_phrase', getenv_default('jwt_key_pass_phrase', 'iamapassphrase'));
$container->setParameter('jwt_token_ttl', getenv_default('jwt_token_ttl', 86400));

$container->setParameter('language_analyzer', getenv_default('language_analyzer', 'french'));

$container->setParameter('remember_secret', getenv_default('remember_secret', '***REMOVED***'));

$container->setParameter('router.request_context.host', getenv_default('router.request_context.host', 'capco.dev'));
$container->setParameter('assets_version', getenv_default('assets_version', 'v1'));
$container->setParameter('server_version', getenv_default('server_version', '5.6'));

$container->setParameter('sonata.media.thumbnail.liip_imagine', 'Capco\MediaBundle\Thumbnail\LiipImagineThumbnail');

$container->setParameter('recaptcha_private_key', getenv_default('recaptcha_private_key', '***REMOVED***'));
