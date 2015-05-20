<?php

function get_env_var($key) {
    return getenv('SYMFONY_'.strtoupper(str_replace('.', '__', $key)));
}

function set_var($key, $default) {
    return get_env_var($key) ?: $default;
}

$container->setParameter('database_driver',         set_var('database_driver', 'pdo_mysql'));
$container->setParameter('database_host',           set_var('database_host', '127.0.0.1'));
$container->setParameter('database_port',           set_var('database_port', 3306));
$container->setParameter('database_name',           set_var('database_name', 'symfony'));
$container->setParameter('database_user',           set_var('database_user', 'root'));
$container->setParameter('database_password',       set_var('database_password', null));

$container->setParameter('mailer_transport',        set_var('mailer_transport', 'smtp'));
$container->setParameter('mailer_user',             set_var('mailer_user', ''));
$container->setParameter('mailer_password',         set_var('mailer_password', ''));
$container->setParameter('mailer_host',             set_var('mailer_host', '***REMOVED***'));
$container->setParameter('mailer_port',             set_var('mailer_port', 587));

$container->setParameter('locale',                  set_var('locale', 'fr'));
$container->setParameter('secret',                  set_var('secret', '***REMOVED***'));
$container->setParameter('debug_toolbar',           set_var('debug_toolbar', true));
$container->setParameter('debug_redirects',         set_var('debug_redirects', false));
$container->setParameter('use_assetic_controller',  set_var('use_assetic_controller', true));

$container->setParameter('facebook_app_id',         set_var('facebook_app_id', 'xx'));
$container->setParameter('facebook_app_secret',     set_var('facebook_app_secret', 'xx'));
$container->setParameter('google_app_id',           set_var('google_app_id', 'xx'));
$container->setParameter('google_app_secret',       set_var('google_app_secret', 'xx'));
$container->setParameter('twitter_app_id',          set_var('twitter_app_id', 'xx'));
$container->setParameter('twitter_app_secret',      set_var('twitter_app_secret', 'xx'));

$container->setParameter('registration_email_address',  set_var('registration_email_address', 'coucou@cap-collectif.com'));
$container->setParameter('registration_sender_name',    set_var('registration_sender_name', 'Cap Collectif'));
$container->setParameter('redis_prefix',                set_var('redis_prefix', 'capco'));
$container->setParameter('shield_login',                set_var('shield_login', 'admin'));
$container->setParameter('shield_pwd',                  set_var('shield_pwd', 'admin'));

if (file_exists('app/config/parameters.yml')) {
    $loader->import('parameters.yml');
}
